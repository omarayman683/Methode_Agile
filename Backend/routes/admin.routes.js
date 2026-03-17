const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/utilisateur.controller');

router.get('/', userCtrl.getAll);
router.post('/', userCtrl.create);
router.put('/:id', userCtrl.update);
router.delete('/:id', userCtrl.delete);

module.exports = router;