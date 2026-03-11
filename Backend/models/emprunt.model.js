const db = require('../config/db');

exports.create = async ({ id_livre, id_utilisateur, date_emprunt, date_retour_prevue }) => {
    const [result] = await db.execute(
        'INSERT INTO emprunt (id_livre, id_utilisateur, date_emprunt, date_retour_prevue) VALUES (?, ?, ?, ?)',
        [id_livre, id_utilisateur, date_emprunt, date_retour_prevue]
    );
    return result.insertId;
};

exports.findByUser = async (id_utilisateur) => {
    const [rows] = await db.execute(
        `SELECT e.*, l.titre, l.auteur
         FROM emprunt e
         JOIN livre l ON e.id_livre = l.id_livre
         WHERE e.id_utilisateur = ?
         ORDER BY e.date_emprunt DESC`,
        [id_utilisateur]
    );
    return rows;
};

exports.findAll = async () => {
    const [rows] = await db.execute(
        `SELECT e.*, l.titre, l.auteur, u.nom, u.prenom
         FROM emprunt e
         JOIN livre l ON e.id_livre = l.id_livre
         JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
         ORDER BY e.date_emprunt DESC`
    );
    return rows;
};

exports.findById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM emprunt WHERE id_emprunt = ?', [id]);
    return rows[0] || null;
};

exports.retourner = async (id, date_retour_effective) => {
    await db.execute(
        "UPDATE emprunt SET statut = 'retourne', date_retour_effective = ? WHERE id_emprunt = ?",
        [date_retour_effective, id]
    );
};

exports.countActiveByUser = async (id_utilisateur) => {
    const [rows] = await db.execute(
        "SELECT COUNT(*) AS count FROM emprunt WHERE id_utilisateur = ? AND statut = 'en_cours'",
        [id_utilisateur]
    );
    return rows[0].count;
};

exports.markOverdue = async () => {
    await db.execute(
        "UPDATE emprunt SET statut = 'en_retard' WHERE statut = 'en_cours' AND date_retour_prevue < CURDATE()"
    );
};
