const Portfolio = require('../models/portfolioModel');
const mongoose = require('mongoose');


const getPortfolio = async (req, res) => {
    const { userId } = req.params;
  
    try {
      console.log("Request userId", userId);
  
      let portfolio = await Portfolio.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });
  
      if (!portfolio) {
        console.log("No direct match found. Trying fallback...");
        const allPortfolios = await Portfolio.find({});
        portfolio = allPortfolios.find(
          (p) => p.userId.toString() === userId
        );
      }
  
      if (!portfolio) {
        console.log("No matching portfolio found");
        return res.status(404).json({ message: 'Portfolio not found' });
      }
  
      console.log("Matched Portfolio:", portfolio);
      res.json(portfolio);
  
    } catch (err) {
      console.error("Error in getPortfolio:", err.message);
      res.status(500).json({ error: err.message });
    }
};


module.exports = {
    getPortfolio
}