const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UtilisateurModel = require('../models/utilisateur.model');

exports.login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;
        const user = await UtilisateurModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }
        const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!valid) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }
        const token = jwt.sign(
            { id_utilisateur: user.id_utilisateur, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        const { mot_de_passe: _, ...userData } = user;
        res.json({ success: true, message: 'Connexion réussie', data: { token, user: userData } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe } = req.body;
        const existing = await UtilisateurModel.findByEmail(email);
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email déjà utilisé' });
        }
        const hash = await bcrypt.hash(mot_de_passe, 12);
        const id = await UtilisateurModel.create({ nom, prenom, email, mot_de_passe: hash, role: 'adherent' });
        res.status(201).json({ success: true, message: 'Compte créé avec succès', data: { id_utilisateur: id } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await UtilisateurModel.findById(req.user.id_utilisateur);
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        const { mot_de_passe: _, ...userData } = user;
        res.json({ success: true, data: userData });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};
