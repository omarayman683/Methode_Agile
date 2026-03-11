const db = require('../config/db');

exports.findByEmail = async (email) => {
    const [rows] = await db.execute('SELECT * FROM utilisateur WHERE email = ?', [email]);
    return rows[0] || null;
};

exports.findById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM utilisateur WHERE id_utilisateur = ?', [id]);
    return rows[0] || null;
};

exports.findAll = async () => {
    const [rows] = await db.execute(
        'SELECT id_utilisateur, nom, prenom, email, role, date_creation FROM utilisateur ORDER BY nom'
    );
    return rows;
};

exports.create = async ({ nom, prenom, email, mot_de_passe, role }) => {
    const [result] = await db.execute(
        'INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
        [nom, prenom, email, mot_de_passe, role]
    );
    const id = result.insertId;
    if (role === 'adherent') {
        await db.execute('INSERT INTO adherent (id_utilisateur) VALUES (?)', [id]);
    } else if (role === 'bibliothecaire') {
        const matricule = `BIB-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;
        await db.execute('INSERT INTO bibliothecaire (id_utilisateur, matricule) VALUES (?, ?)', [id, matricule]);
    } else if (role === 'administrateur') {
        await db.execute('INSERT INTO administrateur (id_utilisateur) VALUES (?)', [id]);
    }
    return id;
};

exports.update = async (id, { nom, prenom, email, role }) => {
    await db.execute(
        'UPDATE utilisateur SET nom = ?, prenom = ?, email = ?, role = ? WHERE id_utilisateur = ?',
        [nom, prenom, email, role, id]
    );
};

exports.delete = async (id) => {
    await db.execute('DELETE FROM utilisateur WHERE id_utilisateur = ?', [id]);
};
