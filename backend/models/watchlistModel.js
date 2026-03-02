// models/Watchlist.js
const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbols: [{ type: String, required: true }], // e.g. ['AAPL', 'TSLA']
}, { timestamps: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
