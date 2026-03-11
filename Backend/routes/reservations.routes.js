const router = require('express').Router();
const { reserver, annuler, getMesReservations } = require('../controllers/reservations.controller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.get('/mes-reservations', auth, role('adherent'), getMesReservations);
router.post('/',                auth, role('adherent'), reserver);
router.delete('/:id',           auth, role('adherent'), annuler);

module.exports = router;
