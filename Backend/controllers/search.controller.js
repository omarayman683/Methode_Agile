const { Ollama } = require('ollama');
const LivreModel = require('../models/livre.model');

const ollama = new Ollama({ host: process.env.OLLAMA_URL || 'http://localhost:11434' });

// AJOUT DE CETTE FONCTION QUI MANQUAIT :
exports.simpleSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ success: false, message: 'Paramètre q requis' });
        const livres = await LivreModel.search(q);
        res.json({ success: true, data: livres });
    } catch (err) {
        console.error('Erreur simpleSearch :', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// TA FONCTION AISEARCH :
exports.aiSearch = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ success: false });

        const allBooks = await LivreModel.findAll();

        const livresContext = allBooks.map(l =>
            `- "${l.titre}" par ${l.auteur} (Catégorie: ${l.categorie} | Résumé: ${l.resume})`
        ).join('\n');

        const prompt = `Tu es un assistant bibliothécaire expert. Ton rôle est de comprendre l'intention de l'utilisateur et de lui proposer les livres les plus adaptés parmi notre catalogue.

CATALOGUE RÉEL (NE CITE QUE CEUX-LA) :
${livresContext}

DEMANDE UTILISATEUR : "${query}"

TES RÈGLES D'OR :
1. Analyse l'intention : cherche-t-il un titre, un auteur, une lettre spécifique ou un thème ?
2. Ne cite JAMAIS un livre qui n'est pas dans le catalogue ci-dessus.
3. Si on demande "tous les livres", liste-les tous poliment.
4. Si on cherche un critère (ex: la lettre P, un thème, une émotion), vérifie bien dans la liste.
5. Tu peux faire une phrase d'introduction sympa, mais reste 100% fidèle aux données.
6. Si aucun livre ne correspond à son envie, dis-le poliment et propose de chercher autre chose.

RÉPONDS DIRECTEMENT À L'UTILISATEUR :`;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();

        const stream = await ollama.chat({
            model: 'phi3',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
            options: {
                temperature: 0.3,
                num_ctx: 4096
            }
        });

        for await (const part of stream) {
            const token = part.message.content || '';
            if (token) {
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();

    } catch (err) {
        console.error('Erreur IA :', err);
        if (!res.headersSent) res.status(500).json({ success: false });
        res.end();
    }
};