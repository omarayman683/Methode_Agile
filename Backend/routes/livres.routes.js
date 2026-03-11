const router = require('express').Router();
const { getAll, getById, create, update, remove } = require('../controllers/livres.controller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.get('/',     getAll);
router.get('/:id',  getById);
router.post('/',    auth, role('bibliothecaire', 'administrateur'), create);
router.put('/:id',  auth, role('bibliothecaire', 'administrateur'), update);
router.delete('/:id', auth, role('bibliothecaire', 'administrateur'), remove);

module.exports = router;
