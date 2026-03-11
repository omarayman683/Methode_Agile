const EmpruntModel  = require('../models/emprunt.model');
const LivreModel    = require('../models/livre.model');
const AmendeModel   = require('../models/amende.model');

exports.emprunter = async (req, res) => {
    try {
        const { id_livre } = req.body;
        const id_utilisateur = req.user.id_utilisateur;

        const livre = await LivreModel.findById(id_livre);
        if (!livre) return res.status(404).json({ success: false, message: 'Livre introuvable' });
        if (!livre.disponibilite) return res.status(409).json({ success: false, message: 'Livre non disponible' });

        const activeCount = await EmpruntModel.countActiveByUser(id_utilisateur);
        if (activeCount >= 5) return res.status(409).json({ success: false, message: "Quota d'emprunts atteint (max 5)" });

        const hasAmende = await AmendeModel.hasUnpaid(id_utilisateur);
        if (hasAmende) return res.status(409).json({ success: false, message: 'Amende impayée en cours' });

        const today  = new Date();
        const retour = new Date(today);
        retour.setDate(retour.getDate() + 14);

        const id = await EmpruntModel.create({
            id_livre,
            id_utilisateur,
            date_emprunt:       today.toISOString().split('T')[0],
            date_retour_prevue: retour.toISOString().split('T')[0],
        });
        await LivreModel.setDisponibilite(id_livre, false);

        res.status(201).json({ success: true, message: 'Emprunt enregistré', data: { id_emprunt: id } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.retourner = async (req, res) => {
    try {
        const emprunt = await EmpruntModel.findById(req.params.id);
        if (!emprunt) return res.status(404).json({ success: false, message: 'Emprunt introuvable' });
        if (emprunt.statut === 'retourne') return res.status(409).json({ success: false, message: 'Déjà retourné' });

        const today = new Date().toISOString().split('T')[0];
        await EmpruntModel.retourner(req.params.id, today);
        await LivreModel.setDisponibilite(emprunt.id_livre, true);

        // Generate fine if overdue
        const days = Math.ceil(
            (new Date(today) - new Date(emprunt.date_retour_prevue)) / (1000 * 60 * 60 * 24)
        );
        if (days > 0) {
            await AmendeModel.create({ id_emprunt: parseInt(req.params.id), montant: +(days * 0.20).toFixed(2) });
        }

        res.json({ success: true, message: 'Retour enregistré' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.getMesEmprunts = async (req, res) => {
    try {
        const emprunts = await EmpruntModel.findByUser(req.user.id_utilisateur);
        res.json({ success: true, data: emprunts });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const emprunts = await EmpruntModel.findAll();
        res.json({ success: true, data: emprunts });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};
