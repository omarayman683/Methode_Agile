const bcrypt          = require('bcrypt');
const UtilisateurModel = require('../models/utilisateur.model');

exports.getAll = async (req, res) => {
    try {
        const users = await UtilisateurModel.findAll();
        res.json({ success: true, data: users });
    } catch (err) {
        console.error('[getAll utilisateurs]', err);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const user = await UtilisateurModel.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        const { mot_de_passe: _, ...userData } = user;
        res.json({ success: true, data: userData });
    } catch (err) {
        console.error('[getById utilisateur]', err);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe, role } = req.body;
        if (!nom || !prenom || !email || !mot_de_passe) {
            return res.status(400).json({ success: false, message: 'Tous les champs sont requis (nom, prenom, email, mot_de_passe).' });
        }
        const validRoles = ['adherent', 'bibliothecaire', 'administrateur'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: `Rôle invalide. Valeurs acceptées : ${validRoles.join(', ')}` });
        }
        const existing = await UtilisateurModel.findByEmail(email);
        if (existing) return res.status(409).json({ success: false, message: 'Email déjà utilisé' });
        const hash = await bcrypt.hash(mot_de_passe, 12);
        const id = await UtilisateurModel.create({ nom, prenom, email, mot_de_passe: hash, role });
        res.status(201).json({ success: true, message: 'Utilisateur créé', data: { id_utilisateur: id } });
    } catch (err) {
        console.error('[create utilisateur]', err);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const affected = await UtilisateurModel.update(req.params.id, req.body);
        if (!affected) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        res.json({ success: true, message: 'Utilisateur mis à jour' });
    } catch (err) {
        console.error('[update utilisateur]', err);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        await UtilisateurModel.delete(req.params.id);
        res.json({ success: true, message: 'Utilisateur supprimé' });
    } catch (err) {
        console.error('[remove utilisateur]', err);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};
