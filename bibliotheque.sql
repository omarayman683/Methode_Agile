-- ============================================================
-- Application de Gestion de Bibliothèque
-- Script SQL de création de la base de données
-- DSL – Méthodes Agiles – Université de Haute-Alsace
-- Compatible : MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS bibliotheque
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE bibliotheque;


-- ============================================================
-- TABLE : utilisateur
-- Classe de base pour tous les types d'utilisateurs.
-- ============================================================
CREATE TABLE utilisateur (
    id_utilisateur INT          PRIMARY KEY AUTO_INCREMENT,
    nom            VARCHAR(100) NOT NULL,
    prenom         VARCHAR(100) NOT NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe   VARCHAR(255) NOT NULL,  -- stocké hashé (bcrypt)
    role           ENUM('adherent', 'bibliothecaire', 'administrateur') NOT NULL,
    date_creation  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE : adherent  (hérite de utilisateur – relation 1-1)
-- Représente un membre qui peut emprunter des livres.
-- ============================================================
CREATE TABLE adherent (
    id_utilisateur INT NOT NULL PRIMARY KEY,
    quota_emprunts INT NOT NULL DEFAULT 5,   -- nb max d'emprunts simultanés autorisés
    CONSTRAINT fk_adherent_utilisateur
        FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
        ON DELETE CASCADE
);


-- ============================================================
-- TABLE : bibliothecaire  (hérite de utilisateur – relation 1-1)
-- Peut gérer les emprunts, amendes et le catalogue.
-- ============================================================
CREATE TABLE bibliothecaire (
    id_utilisateur INT         NOT NULL PRIMARY KEY,
    matricule      VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT fk_bibliothecaire_utilisateur
        FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
        ON DELETE CASCADE
);


-- ============================================================
-- TABLE : administrateur  (hérite de utilisateur – relation 1-1)
-- Accès complet à la plateforme (gestion des comptes, stats…).
-- ============================================================
CREATE TABLE administrateur (
    id_utilisateur INT         NOT NULL PRIMARY KEY,
    niveau_acces   VARCHAR(50) NOT NULL DEFAULT 'standard',
    CONSTRAINT fk_administrateur_utilisateur
        FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
        ON DELETE CASCADE
);


-- ============================================================
-- TABLE : livre
-- Catalogue des ouvrages disponibles dans la bibliothèque.
-- ============================================================
CREATE TABLE livre (
    id_livre         INT          PRIMARY KEY AUTO_INCREMENT,
    titre            VARCHAR(255) NOT NULL,
    auteur           VARCHAR(255) NOT NULL,
    date_publication DATE,
    categorie        VARCHAR(100),
    resume           TEXT,
    disponibilite    BOOLEAN      NOT NULL DEFAULT TRUE,
    date_ajout       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE : emprunt
-- Enregistre chaque emprunt d'un livre par un adhérent.
-- Statuts : en_cours | retourne | en_retard
-- ============================================================
CREATE TABLE emprunt (
    id_emprunt            INT  PRIMARY KEY AUTO_INCREMENT,
    id_livre              INT  NOT NULL,
    id_utilisateur        INT  NOT NULL,
    date_emprunt          DATE NOT NULL,
    date_retour_prevue    DATE NOT NULL,
    date_retour_effective DATE,                            -- NULL tant que non rendu
    statut                ENUM('en_cours', 'retourne', 'en_retard') NOT NULL DEFAULT 'en_cours',
    CONSTRAINT fk_emprunt_livre
        FOREIGN KEY (id_livre)       REFERENCES livre(id_livre),
    CONSTRAINT fk_emprunt_utilisateur
        FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
);


-- ============================================================
-- TABLE : amende
-- Générée automatiquement lorsqu'un emprunt passe en retard.
-- ============================================================
CREATE TABLE amende (
    id_amende     INT            PRIMARY KEY AUTO_INCREMENT,
    id_emprunt    INT            NOT NULL UNIQUE,   -- une amende par emprunt
    montant       DECIMAL(8, 2)  NOT NULL,
    date_creation DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payee         BOOLEAN        NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_amende_emprunt
        FOREIGN KEY (id_emprunt) REFERENCES emprunt(id_emprunt)
);


-- ============================================================
-- TABLE : reservation
-- File d'attente pour un livre non disponible.
-- Statuts : en_attente | convertie | annulee
-- ============================================================
CREATE TABLE reservation (
    id_reservation   INT      PRIMARY KEY AUTO_INCREMENT,
    id_livre         INT      NOT NULL,
    id_utilisateur   INT      NOT NULL,
    date_reservation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut           ENUM('en_attente', 'convertie', 'annulee') NOT NULL DEFAULT 'en_attente',
    position_file    INT      NOT NULL DEFAULT 1,    -- rang dans la file d'attente
    CONSTRAINT fk_reservation_livre
        FOREIGN KEY (id_livre)       REFERENCES livre(id_livre),
    CONSTRAINT fk_reservation_utilisateur
        FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
);


-- ============================================================
-- INDEXES
-- Optimisent les recherches fréquentes (titre, auteur, catégorie).
-- ============================================================
CREATE INDEX idx_livre_titre      ON livre(titre);
CREATE INDEX idx_livre_auteur     ON livre(auteur);
CREATE INDEX idx_livre_categorie  ON livre(categorie);
CREATE INDEX idx_emprunt_statut   ON emprunt(statut);
CREATE INDEX idx_emprunt_user     ON emprunt(id_utilisateur);
CREATE INDEX idx_reservation_file ON reservation(id_livre, statut, position_file);


-- ============================================================
-- DONNÉES DE TEST
-- ============================================================

-- 1. Utilisateurs de base (mots de passe : exemples hashés bcrypt)
INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role) VALUES
    ('Admin',   'Super', 'admin@bibliotheque.fr',        '$2b$12$hashedPasswordAdmin000000000000', 'administrateur'),
    ('Dupont',  'Marie', 'marie.dupont@bibliotheque.fr', '$2b$12$hashedPasswordBiblio00000000000', 'bibliothecaire'),
    ('Martin',  'Jean',  'jean.martin@mail.com',         '$2b$12$hashedPasswordUser000000000000',  'adherent'),
    ('Lambert', 'Sara',  'sara.lambert@mail.com',        '$2b$12$hashedPasswordUser100000000000',  'adherent');

-- 2. Profils spécialisés
INSERT INTO administrateur (id_utilisateur, niveau_acces) VALUES
    (1, 'super_admin');

INSERT INTO bibliothecaire (id_utilisateur, matricule) VALUES
    (2, 'BIB-2025-001');

INSERT INTO adherent (id_utilisateur, quota_emprunts) VALUES
    (3, 5),
    (4, 5);

-- 3. Catalogue de livres
INSERT INTO livre (titre, auteur, date_publication, categorie, resume, disponibilite) VALUES
    ('Harry Potter à l''école des sorciers',       'J.K. Rowling',               '1997-06-26', 'Fantasy',      'Un jeune garçon découvre qu''il est un sorcier.', TRUE),
    ('Harry Potter et la Chambre des Secrets',     'J.K. Rowling',               '1998-07-02', 'Fantasy',      'Harry retourne à Poudlard pour sa deuxième année.', FALSE),
    ('Le Petit Prince',                            'Antoine de Saint-Exupéry',   '1943-04-06', 'Littérature',  'Un aviateur rencontre un petit prince venu d''une autre planète.', TRUE),
    ('L''Étranger',                                'Albert Camus',               '1942-01-01', 'Littérature',  'Meursault, un homme indifférent, commet un meurtre absurde.', TRUE),
    ('Clean Code',                                 'Robert C. Martin',           '2008-08-01', 'Informatique', 'Bonnes pratiques pour écrire du code lisible et maintenable.', TRUE);

-- 4. Emprunts (livre 2 emprunté par Jean Martin, en retard)
INSERT INTO emprunt (id_livre, id_utilisateur, date_emprunt, date_retour_prevue, statut) VALUES
    (2, 3, '2026-02-25', '2026-03-11', 'en_retard');

-- 5. Amende liée à l'emprunt en retard (0,20 € / jour de retard à titre d'exemple)
INSERT INTO amende (id_emprunt, montant, payee) VALUES
    (1, 0.00, FALSE);   -- montant mis à jour dynamiquement par l'application

-- 6. Réservation (Sara Lambert attend le livre 2)
INSERT INTO reservation (id_livre, id_utilisateur, statut, position_file) VALUES
    (2, 4, 'en_attente', 1);
