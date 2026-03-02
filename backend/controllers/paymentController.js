const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Portfolio = require('../models/portfolioModel');
const dotenv = require("dotenv");
dotenv.config();

exports.createPaymentIntent = async (req, res) => {
    const { userId, amount } = req.body;
  
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: { userId }
      });
  
      res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error('[Stripe Error]', error.message);
      res.status(500).json({ error: error.message });
    }
};
  

exports.paymentSuccess = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    portfolio.wallet += amount / 100;
    await portfolio.save();

    res.send({ success: true, newBalance: portfolio.wallet });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
