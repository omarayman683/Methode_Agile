const db = require('../config/db');

exports.create = async ({ id_livre, id_utilisateur, position_file }) => {
    const [result] = await db.execute(
        'INSERT INTO reservation (id_livre, id_utilisateur, position_file) VALUES (?, ?, ?)',
        [id_livre, id_utilisateur, position_file]
    );
    return result.insertId;
};

exports.findByUser = async (id_utilisateur) => {
    const [rows] = await db.execute(
        `SELECT r.*, l.titre, l.auteur
         FROM reservation r
         JOIN livre l ON r.id_livre = l.id_livre
         WHERE r.id_utilisateur = ? AND r.statut = 'en_attente'
         ORDER BY r.date_reservation`,
        [id_utilisateur]
    );
    return rows;
};

exports.findById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM reservation WHERE id_reservation = ?', [id]);
    return rows[0] || null;
};

exports.countForBook = async (id_livre) => {
    const [rows] = await db.execute(
        "SELECT COUNT(*) AS count FROM reservation WHERE id_livre = ? AND statut = 'en_attente'",
        [id_livre]
    );
    return rows[0].count;
};

exports.annuler = async (id) => {
    await db.execute("UPDATE reservation SET statut = 'annulee' WHERE id_reservation = ?", [id]);
};

exports.getNext = async (id_livre) => {
    const [rows] = await db.execute(
        "SELECT * FROM reservation WHERE id_livre = ? AND statut = 'en_attente' ORDER BY position_file ASC LIMIT 1",
        [id_livre]
    );
    return rows[0] || null;
};
