const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

router.post('/ask', aiController.chatWithAI);

module.exports = router;