require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes         = require('./routes/auth.routes');
const livresRoutes       = require('./routes/livres.routes');
const empruntsRoutes     = require('./routes/emprunts.routes');
const reservationsRoutes = require('./routes/reservations.routes');
const amendesRoutes      = require('./routes/amendes.routes');
const utilisateursRoutes = require('./routes/utilisateurs.routes');
const searchRoutes       = require('./routes/search.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',         authRoutes);
app.use('/api/livres',       livresRoutes);
app.use('/api/emprunts',     empruntsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/amendes',      amendesRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api/search',       searchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
