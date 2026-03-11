/**
 * Script one-time : crée un compte administrateur de test.
 * Usage : node create-admin.js
 * Supprimer ce fichier après utilisation.
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const db     = require('./config/db');

async function main() {
    const nom         = 'Admin';
    const prenom      = 'Super';
    const email       = 'admin@test.com';
    const mot_de_passe = 'Admin1234!';
    const role        = 'administrateur';

    const [existing] = await db.execute('SELECT id_utilisateur FROM utilisateur WHERE email = ?', [email]);
    if (existing.length > 0) {
        console.log('Un compte admin existe déjà pour', email);
        process.exit(0);
    }

    const hash = await bcrypt.hash(mot_de_passe, 12);
    const [result] = await db.execute(
        'INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
        [nom, prenom, email, hash, role]
    );
    const id = result.insertId;
    await db.execute('INSERT INTO administrateur (id_utilisateur) VALUES (?)', [id]);

    console.log('Compte admin créé avec succès !');
    console.log('  Email    :', email);
    console.log('  Password :', mot_de_passe);
    console.log('  ID       :', id);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
