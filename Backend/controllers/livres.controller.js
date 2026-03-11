const LivreModel = require('../models/livre.model');

exports.getAll = async (req, res) => {
    try {
        const livres = await LivreModel.findAll();
        res.json({ success: true, data: livres });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const livre = await LivreModel.findById(req.params.id);
        if (!livre) return res.status(404).json({ success: false, message: 'Livre introuvable' });
        res.json({ success: true, data: livre });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const id = await LivreModel.create(req.body);
        res.status(201).json({ success: true, message: 'Livre ajouté', data: { id_livre: id } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        await LivreModel.update(req.params.id, req.body);
        res.json({ success: true, message: 'Livre mis à jour' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        await LivreModel.delete(req.params.id);
        res.json({ success: true, message: 'Livre supprimé' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};
