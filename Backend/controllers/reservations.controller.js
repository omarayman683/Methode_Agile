const ReservationModel = require('../models/reservation.model');
const LivreModel       = require('../models/livre.model');

exports.reserver = async (req, res) => {
    try {
        const { id_livre } = req.body;
        const id_utilisateur = req.user.id_utilisateur;

        const livre = await LivreModel.findById(id_livre);
        if (!livre) return res.status(404).json({ success: false, message: 'Livre introuvable' });
        if (livre.disponibilite) {
            return res.status(409).json({ success: false, message: 'Livre disponible, empruntez-le directement' });
        }

        const position = (await ReservationModel.countForBook(id_livre)) + 1;
        const id = await ReservationModel.create({ id_livre, id_utilisateur, position_file: position });

        res.status(201).json({ success: true, message: 'Réservation enregistrée', data: { id_reservation: id, position } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.annuler = async (req, res) => {
    try {
        const reservation = await ReservationModel.findById(req.params.id);
        if (!reservation) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
        if (reservation.id_utilisateur !== req.user.id_utilisateur) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }
        await ReservationModel.annuler(req.params.id);
        res.json({ success: true, message: 'Réservation annulée' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.getMesReservations = async (req, res) => {
    try {
        const reservations = await ReservationModel.findByUser(req.user.id_utilisateur);
        res.json({ success: true, data: reservations });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};
