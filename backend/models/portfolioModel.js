const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stocks: [
    {
      symbol: { type: String, required: true },
      quantity: { type: Number, required: true },
      averagePrice: { type: Number, required: true },
      investedAmount: { type: Number, required: true }
    }
  ],
  totalValue: { type: Number, default: 0 },
  investmentFund: { type: Number, default: 0 }, // total invested amount
  wallet: { type: Number, default: 25000 },     // cash available
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);