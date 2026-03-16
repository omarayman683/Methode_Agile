const Groq = require('groq-sdk');
const LivreModel = require('../models/livre.model');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 1. Simple keyword search
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

// 2. AI search using Groq with streaming
exports.aiSearch = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ success: false, message: 'Paramètre query requis' });

        const allBooks = await LivreModel.findAll();

        const livresContext = allBooks.map(l =>
            `- [ID:${l.id_livre}] "${l.titre}" de ${l.auteur} | Catégorie: ${l.categorie} | Résumé: ${l.resume}`
        ).join('\n');

        const prompt = `Tu es un assistant de bibliothèque sympathique et helpful.
Voici les livres disponibles dans notre bibliothèque :

${livresContext}

L'utilisateur te demande : "${query}"

Réponds en français de manière naturelle et conversationnelle.
Suggère les livres les plus pertinents en mentionnant leur titre et auteur.
Si aucun livre ne correspond, dis-le gentiment et propose des alternatives.
Sois concis (3-5 phrases maximum).`;

        // Setup SSE headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();

        const stream = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
        });

        for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content || '';
            if (token) {
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
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
