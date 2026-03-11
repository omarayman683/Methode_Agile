const router = require('express').Router();
const { getMesAmendes, getAll, payer } = require('../controllers/amendes.controller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.get('/mes-amendes',  auth, role('adherent'), getMesAmendes);
router.get('/',             auth, role('bibliothecaire', 'administrateur'), getAll);
router.put('/:id/payer',    auth, role('bibliothecaire', 'administrateur'), payer);

module.exports = router;
