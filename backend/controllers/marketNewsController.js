// backend/controllers/marketNewsController.js
const axios = require('axios');
const dotenv = require("dotenv");
// Keep API key secure in backend
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY; // Replace with your actual API key
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
dotenv.config();

// Get market news
const getMarketNews = async (req, res) => {
    try {
        console.log('Fetching market news from Finnhub API...',`${FINNHUB_BASE_URL}/news` );
        
        const response = await axios.get(`https://finnhub.io/api/v1/news`, {
            params: {
                category: 'general',
                token: FINNHUB_API_KEY
            }
        });
        
        // Format the news data for frontend consumption
        const formattedNews = response.data.slice(0, 6).map((item, index) => ({
            id: item.id || index + 1,
            title: item.headline,
            source: item.source,
            summary: item.summary,
            url: item.url,
            image: item.image || null,
            publishedAt: new Date(item.datetime * 1000).toLocaleDateString()
        }));
        
        console.log(`Successfully fetched ${formattedNews.length} news items`);
        return res.status(200).json(formattedNews);
    } catch (error) {
        console.error('Error fetching market news:', error);
        return res.status(500).json({
            error: "Server error. Failed to fetch market news.",
            message: error.message
        });
    }
};

module.exports = {
    getMarketNews
};