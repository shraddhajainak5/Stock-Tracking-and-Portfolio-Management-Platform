const express = require('express');
const router = express.Router();
const { summarizeWithLLM, chatWithStockBot } = require('../controllers/chatbotController');

router.get('/chat', summarizeWithLLM);
router.post('/ask', chatWithStockBot);

module.exports = router;
