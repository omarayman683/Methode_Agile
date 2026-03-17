const { Ollama } = require('ollama');
const LivreModel = require('../models/livre.model');

// Initialisation d'Ollama avec l'URL de ton .env
const ollama = new Ollama({ host: process.env.OLLAMA_URL || 'http://localhost:11434' });

/**
 * 1. RECHERCHE SIMPLE (Mots-clés SQL)
 */
exports.simpleSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ success: false, message: 'Paramètre q requis' });
        
        const livres = await LivreModel.search(q);
        res.json({ success: true, data: livres });
    } catch (err) {
        console.error('Erreur simpleSearch :', err);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

/**
 * 2. RECHERCHE INTELLIGENTE (IA OLLAMA avec Contexte BDD)
 */
exports.aiSearch = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ success: false, message: 'Paramètre query requis' });

        // On récupère tous les livres pour donner le contexte à l'IA
        const allBooks = await LivreModel.findAll();

        // On transforme la liste des livres en texte lisible par l'IA
        const livresContext = allBooks.map(l =>
            `- ID:${l.id_livre} | Titre: "${l.titre}" | Auteur: ${l.auteur} | Catégorie: ${l.categorie} | Résumé: ${l.resume}`
        ).join('\n');

        const prompt = `Tu es un assistant bibliothécaire intelligent. 
Voici la liste des livres actuellement disponibles dans notre base de données :

${livresContext}

L'utilisateur te demande : "${query}"

INSTRUCTIONS :
1. Analyse la demande : cherche des titres, des auteurs, ou des critères spécifiques (ex: une lettre particulière, un thème).
2. Ne propose QUE des livres présents dans la liste ci-dessus.
3. Si l'utilisateur demande "un livre avec un P", vérifie les titres de la liste.
4. Réponds en français de manière naturelle et concise (3 à 5 phrases).
5. Si aucun livre ne correspond, suggère-lui de reformuler sa recherche.`;

        // Configuration des headers pour le streaming (Server-Sent Events)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();

        // Appel à Ollama en mode streaming
        const stream = await ollama.chat({
            model: 'phi3', // Modèle léger pour éviter les erreurs de mémoire
            messages: [{ role: 'user', content: prompt }],
            stream: true,
        });

        // Envoi des morceaux (tokens) de réponse au frontend
        for await (const part of stream) {
            const token = part.message.content || '';
            if (token) {
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
        }

        // Signal de fin
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();

    } catch (err) {
        console.error('Erreur aiSearch avec Ollama :', err);
        
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'Erreur serveur.' });
        }
        
        res.write(`data: ${JSON.stringify({ error: 'L\'IA a rencontré un problème.' })}\n\n`);
        res.end();
    }
};