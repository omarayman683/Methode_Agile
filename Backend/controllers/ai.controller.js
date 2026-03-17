const aiService = require('../services/ollama.service');

exports.chatWithAI = async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: "Posez une question !" });
    }

    try {
        const answer = await aiService.askAI(question);
        res.json({ response: answer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};