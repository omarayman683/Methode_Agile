const db = require('../config/db');

exports.create = async ({ id_emprunt, montant }) => {
    const [result] = await db.execute(
        'INSERT INTO amende (id_emprunt, montant) VALUES (?, ?)',
        [id_emprunt, montant]
    );
    return result.insertId;
};

exports.findByUser = async (id_utilisateur) => {
    const [rows] = await db.execute(
        `SELECT a.*, e.date_emprunt, e.date_retour_prevue, l.titre
         FROM amende a
         JOIN emprunt e ON a.id_emprunt = e.id_emprunt
         JOIN livre l ON e.id_livre = l.id_livre
         WHERE e.id_utilisateur = ?
         ORDER BY a.date_creation DESC`,
        [id_utilisateur]
    );
    return rows;
};

exports.findAll = async () => {
    const [rows] = await db.execute(
        `SELECT a.*, u.nom, u.prenom, l.titre
         FROM amende a
         JOIN emprunt e ON a.id_emprunt = e.id_emprunt
         JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
         JOIN livre l ON e.id_livre = l.id_livre
         ORDER BY a.date_creation DESC`
    );
    return rows;
};

exports.findById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM amende WHERE id_amende = ?', [id]);
    return rows[0] || null;
};

exports.payer = async (id) => {
    await db.execute('UPDATE amende SET payee = TRUE WHERE id_amende = ?', [id]);
};

exports.hasUnpaid = async (id_utilisateur) => {
    const [rows] = await db.execute(
        `SELECT COUNT(*) AS count FROM amende a
         JOIN emprunt e ON a.id_emprunt = e.id_emprunt
         WHERE e.id_utilisateur = ? AND a.payee = FALSE`,
        [id_utilisateur]
    );
    return rows[0].count > 0;
};
