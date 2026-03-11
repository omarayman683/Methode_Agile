const router = require('express').Router();
const { simpleSearch, aiSearch } = require('../controllers/search.controller');

router.get('/simple', simpleSearch);
router.post('/ai',    aiSearch);

module.exports = router;
