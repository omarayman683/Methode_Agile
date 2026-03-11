const db = require('../config/db');

exports.findAll = async () => {
    const [rows] = await db.execute('SELECT * FROM livre ORDER BY date_ajout DESC');
    return rows;
};

exports.findById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM livre WHERE id_livre = ?', [id]);
    return rows[0] || null;
};

exports.search = async (q) => {
    const term = `%${q}%`;
    const [rows] = await db.execute(
        'SELECT * FROM livre WHERE titre LIKE ? OR auteur LIKE ? OR categorie LIKE ?',
        [term, term, term]
    );
    return rows;
};

exports.create = async ({ titre, auteur, date_publication, categorie, resume }) => {
    const [result] = await db.execute(
        'INSERT INTO livre (titre, auteur, date_publication, categorie, resume) VALUES (?, ?, ?, ?, ?)',
        [titre, auteur, date_publication || null, categorie || null, resume || null]
    );
    return result.insertId;
};

exports.update = async (id, { titre, auteur, date_publication, categorie, resume }) => {
    await db.execute(
        'UPDATE livre SET titre = ?, auteur = ?, date_publication = ?, categorie = ?, resume = ? WHERE id_livre = ?',
        [titre, auteur, date_publication || null, categorie || null, resume || null, id]
    );
};

exports.delete = async (id) => {
    await db.execute('DELETE FROM livre WHERE id_livre = ?', [id]);
};

exports.setDisponibilite = async (id, disponibilite) => {
    await db.execute('UPDATE livre SET disponibilite = ? WHERE id_livre = ?', [disponibilite, id]);
};
