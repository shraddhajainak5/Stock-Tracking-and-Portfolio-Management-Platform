// backend/routes/marketRoutes.js
const express = require('express');
const router = express.Router();
const { getMarketNews } = require('../controllers/marketNewsController');

// Route to get market news
router.get('/news', getMarketNews);

module.exports = router;