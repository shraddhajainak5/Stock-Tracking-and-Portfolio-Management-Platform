const Watchlist = require('../models/watchlistModel');
const axios = require('axios');
require('dotenv').config();
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;


const getWatchlist = async (req, res) => {
    const { userId } = req.params;
    
    try {
      const watchlist = await Watchlist.findOne({ userId });
      console.log("watchlist", watchlist)
      if (!watchlist || !watchlist.symbols.length) {
        return res.status(404).json({ message: 'No stocks in watchlist' });
      }
  
      const stockData = await Promise.all(
        watchlist.symbols.map(async (symbol) => {
          try {
            console.log("symbol", symbol)
            const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
              params: {
                symbol: symbol,
                token: 'd00k3q1r01qk939ok0f0d00k3q1r01qk939ok0fg'
              }
            });
  
            console.log("data", response.data)
            return {
              symbol,
              data: response.data
            };
          } catch (err) {
            console.log("err", err)
            return {
              symbol,
              error: 'Failed to fetch stock data'
            };
          }
        })
      );
  
      res.json({
        watchlist: watchlist.symbols,
        stockData
      });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const addToWatchlist = async (req, res) => {
  const { userId, symbol } = req.body;
  try {
    let watchlist = await Watchlist.findOne({ userId });
    if (!watchlist) {
      watchlist = new Watchlist({ userId, symbols: [symbol] });
    } else if (!watchlist.symbols.includes(symbol)) {
      watchlist.symbols.push(symbol);
    }
    await watchlist.save();
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeFromWatchlist = async (req, res) => {
  const { userId, symbol } = req.body;
  try {
    const watchlist = await Watchlist.findOne({ userId });
    watchlist.symbols = watchlist.symbols.filter(s => s !== symbol);
    await watchlist.save();
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist
}