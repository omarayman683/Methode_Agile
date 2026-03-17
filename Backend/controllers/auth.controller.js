const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UtilisateurModel = require('../models/utilisateur.model');

exports.login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;
        console.log("--- TENTATIVE DE CONNEXION ---");
        console.log("Email saisi :", email);
        console.log("Password saisi :", mot_de_passe);

        // 1. Recherche de l'utilisateur
        const user = await UtilisateurModel.findByEmail(email);
        
        if (!user) {
            console.log("RÉSULTAT : Utilisateur non trouvé en BDD.");
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }

        console.log("Utilisateur trouvé :", user.nom, user.prenom);
        console.log("Hash stocké en BDD :", user.mot_de_passe);

        // 2. Comparaison Bcrypt
        const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        console.log("Résultat de la comparaison BCrypt :", valid);

        if (!valid) {
            console.log("RÉSULTAT : Le mot de passe ne correspond pas au hash.");
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }

        // 3. Vérification des variables JWT
        console.log("Secret JWT utilisé :", process.env.JWT_SECRET ? "Défini" : "MANQUANT (Attention !)");

        const token = jwt.sign(
            { id_utilisateur: user.id_utilisateur, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        console.log("RÉSULTAT : Connexion réussie, Token généré.");
        const { mot_de_passe: _, ...userData } = user;
        
        res.json({ 
            success: true, 
            message: 'Connexion réussie', 
            data: { token, user: userData } 
        });

    } catch (err) {
        console.error('--- ERREUR SERVEUR ---');
        console.error('[login]', err);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe, role } = req.body;
        console.log("--- INSCRIPTION ---");
        
        if (!nom || !prenom || !email || !mot_de_passe) {
            return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
        }

        const allowedRoles = ['adherent', 'bibliothecaire'];
        const userRole = allowedRoles.includes(role) ? role : 'adherent';

        const existing = await UtilisateurModel.findByEmail(email);
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email déjà utilisé' });
        }

        const hash = await bcrypt.hash(mot_de_passe, 12);
        console.log("Nouveau hash généré pour l'inscription :", hash);

        const id = await UtilisateurModel.create({ nom, prenom, email, mot_de_passe: hash, role: userRole });
        res.status(201).json({ success: true, message: 'Compte créé avec succès', data: { id_utilisateur: id } });
    } catch (err) {
        console.error('[register]', err);
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
        console.error('[getMe]', err);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
};