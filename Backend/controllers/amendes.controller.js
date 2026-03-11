const AmendeModel = require('../models/amende.model');

exports.getMesAmendes = async (req, res) => {
    try {
        const amendes = await AmendeModel.findByUser(req.user.id_utilisateur);
        res.json({ success: true, data: amendes });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const amendes = await AmendeModel.findAll();
        res.json({ success: true, data: amendes });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.payer = async (req, res) => {
    try {
        const amende = await AmendeModel.findById(req.params.id);
        if (!amende) return res.status(404).json({ success: false, message: 'Amende introuvable' });
        await AmendeModel.payer(req.params.id);
        res.json({ success: true, message: 'Amende marquée comme payée' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};
