const express = require('express');
const router = express.Router();
const { createPaymentIntent, paymentSuccess } = require('../controllers/paymentController');

router.post('/create-payment-intent', createPaymentIntent);
router.post('/payment-success', paymentSuccess);

module.exports = router;
