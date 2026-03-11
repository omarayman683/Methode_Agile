const router = require('express').Router();
const { getAll, getById, create, update, remove } = require('../controllers/utilisateurs.controller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.get('/',       auth, role('administrateur'), getAll);
router.get('/:id',    auth, role('administrateur'), getById);
router.post('/',      auth, role('administrateur'), create);
router.put('/:id',    auth, role('administrateur'), update);
router.delete('/:id', auth, role('administrateur'), remove);

module.exports = router;
