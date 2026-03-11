const axios      = require('axios');
const LivreModel = require('../models/livre.model');

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

exports.aiSearch = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ success: false, message: 'Paramètre query requis' });

        const allBooks = await LivreModel.findAll();
        const catalog  = allBooks.map(l =>
            `ID:${l.id_livre} | Titre: ${l.titre} | Auteur: ${l.auteur} | Catégorie: ${l.categorie} | Résumé: ${l.resume}`
        ).join('\n');

        const prompt = `Tu es un assistant de bibliothèque. Voici le catalogue :\n${catalog}\n\nRequête : "${query}"\n\nRéponds uniquement avec les IDs des livres les plus pertinents, au format JSON strict : { "ids": [1, 2, 3] }`;

        const ollamaRes = await axios.post(`${process.env.OLLAMA_URL}/api/generate`, {
            model:  'mistral',
            prompt,
            stream: false,
        });

        let ids = [];
        try {
            ids = JSON.parse(ollamaRes.data.response).ids || [];
        } catch {
            ids = [];
        }

        const results = allBooks.filter(l => ids.includes(l.id_livre));
        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur IA (Ollama)', error: err.message });
    }
};
