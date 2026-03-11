const axios = require('axios');
const LivreModel = require('../models/livre.model');

// 1. We keep your simpleSearch exactly as it is since it works perfectly.
exports.simpleSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ success: false, message: 'Paramètre q requis' });
        const livres = await LivreModel.search(q);
        res.json({ success: true, data: livres });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

// 2. Modified aiSearch: Keeps LivreModel, but adds the conversational prompt & streaming
exports.aiSearch = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ success: false, message: 'Paramètre query requis' });

        // Fetch using your existing model instead of raw db.query
        const allBooks = await LivreModel.findAll();
        
        // Format the catalog for the new conversational prompt
        const livresContext = allBooks.map(l =>
            `- [ID:${l.id_livre}] "${l.titre}" de ${l.auteur} | Catégorie: ${l.categorie} | Résumé: ${l.resume}`
        ).join('\n');

        // The new conversational prompt
        const prompt = `Tu es un assistant de bibliothèque sympathique et helpful.
Voici les livres disponibles dans notre bibliothèque :

${livresContext}

L'utilisateur te demande : "${query}"

Réponds en français de manière naturelle et conversationnelle. 
Suggère les livres les plus pertinents en mentionnant leur titre et auteur.
Si aucun livre ne correspond, dis-le gentiment et propose des alternatives.
Sois concis (3-5 phrases maximum).`;

        // Setup SSE (Server-Sent Events) headers for streaming word-by-word
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();

        // Call Ollama with streaming enabled
        // Note: Using native fetch here (requires Node.js 18+) as it handles streams easily
        const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        const ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'mistral',
                prompt: prompt,
                stream: true
            })
        });

        if (!ollamaRes.ok) {
            res.write(`data: ${JSON.stringify({ error: 'Ollama non disponible.' })}\n\n`);
            return res.end();
        }

        // Read the stream from Ollama and forward it to your frontend
        const reader = ollamaRes.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
                try {
                    const json = JSON.parse(line);
                    if (json.response) {
                        // Send each token (word) to the frontend
                        res.write(`data: ${JSON.stringify({ token: json.response })}\n\n`);
                    }
                    if (json.done) {
                        // Tell the frontend the stream is finished
                        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                        return res.end();
                    }
                } catch (e) {
                    // Skip malformed JSON lines from the stream
                }
            }
        }

        res.end();

    } catch (err) {
        console.error('Erreur recherche IA :', err);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'Erreur serveur.' });
        }
        res.write(`data: ${JSON.stringify({ error: 'Erreur serveur.' })}\n\n`);
        res.end();
    }
};