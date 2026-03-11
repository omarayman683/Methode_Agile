const router = require('express').Router();
const { emprunter, retourner, getMesEmprunts, getAll } = require('../controllers/emprunts.controller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Order matters: specific paths before parameterized ones
router.get('/mes-emprunts',  auth, role('adherent'), getMesEmprunts);
router.get('/',              auth, role('bibliothecaire', 'administrateur'), getAll);
router.post('/',             auth, role('adherent'), emprunter);
router.put('/:id/retour',    auth, role('bibliothecaire', 'administrateur'), retourner);

module.exports = router;
