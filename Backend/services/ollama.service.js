const { Ollama } = require('ollama');


const ollama = new Ollama({ host: process.env.OLLAMA_URL });

const askAI = async (prompt) => {
    try {
        const response = await ollama.chat({
            model: 'phi3', 
            messages: [{ role: 'user', content: prompt }],
        });
        return response.message.content;
    } catch (error) {
        console.error("Erreur service Ollama:", error);
        throw new Error("L'IA est indisponible pour le moment.");
    }
};

module.exports = { askAI };