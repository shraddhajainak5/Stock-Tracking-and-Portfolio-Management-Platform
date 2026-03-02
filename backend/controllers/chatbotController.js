const axios = require('axios');
const yahooFinance = require('yahoo-finance2').default;
const dotenv = require("dotenv");
const Portfolio = require('../models/portfolioModel');
const mongoose = require('mongoose');
dotenv.config();

const sessions = new Map();

const isStockRelated = (text) => {
    return /stock|share|price|market|nasdaq|portfolio|equity|finance|AAPL|MSFT|ticker|chart|trading|investment|recommendations/i.test(text);
};

const formatHistoricalData = (data, symbol, shortName, exchange) => {
  return data.map(entry => {
    const dateStr = new Date(entry.date).toISOString().split('T')[0];
    const changePercent = (((entry.close - entry.open) / entry.open) * 100).toFixed(2);
    return `Symbol: ${symbol} (${shortName}) closed at $${entry.close.toFixed(2)} (${changePercent}%) on ${exchange} at ${dateStr}.`;
  }).join('\n');
};

async function callOpenRouter(prompt) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes stock market performance data into simple and actionable insights.",
          },
          {
            role: "user",
            content: prompt,
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 
          'Content-Type': 'application/json',
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter Error:", error?.response?.data || error.message);
    return "Error generating summary.";
  }
}

const summarizeWithLLM = async(req, res) => {
  try {
    const data = await yahooFinance.historical('AAPL', {
      period1: new Date(),
      period2: new Date()
    });

    const formatted = formatHistoricalData(data, "AAPL", "Apple Inc.", "NasdaqGS");

    console.log("Sending all formatted data to GPT in one go...");

    const prompt = `Summarize the following historical stock data for AAPL:\n\n${formatted}`;
    const summary = await callOpenRouter(prompt);

    console.log("Final Summary:\n", summary);
    return res.status(200).json({ summary });

  } catch (err) {
    console.error("Summarization failed:", err.message);
    return "Failed to summarize.";
  }
}

const fetchCurrentPrice = async (symbol) => {
  try {
    const quote = await yahooFinance.quote(symbol);
    return quote?.regularMarketPrice || null;
  } catch (err) {
    console.error(`Failed to fetch price for ${symbol}:`, err.message);
    return null;
  }
};

const chatWithStockBot = async (req, res) => {
  const { sessionId, message, userId } = req.body;

  if (!isStockRelated(message)) {
    return res.json({ reply: "Please ask only stock-related questions." });
  }

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, [
      {
        role: "system",
        content:
          "You are a helpful assistant that only answers questions related to stocks and financial markets. Provide useful, neutral insights without offering direct investment advice.",
      },
    ]);
  }

  const messages = sessions.get(sessionId);

  try {
    if (userId) {
      const portfolio = await Portfolio.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      if (portfolio) {
        let investedAmount = 0;

        const stockSummaries = await Promise.all(
          portfolio.stocks.map(async (stock) => {
            const currentPrice = await fetchCurrentPrice(stock.symbol);
            const avgBuyPrice = stock.totalPrice / stock.quantity;
            const totalValue = currentPrice * stock.quantity;
            const gainOrLoss = (currentPrice - avgBuyPrice) * stock.quantity;
            investedAmount += totalValue;

            const historical = await yahooFinance.historical(stock.symbol, {
              period1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              period2: new Date(),
            });

            const profile = await yahooFinance.quoteSummary(stock.symbol, {
              modules: ['price']
            });

            const shortName = profile?.price?.shortName || stock.symbol;
            const exchange = profile?.price?.exchangeName || "Unknown";
            const histData = formatHistoricalData(historical, stock.symbol, shortName, exchange);

            return `📈 ${stock.symbol} (${stock.quantity} shares)
- Avg Buy: $${avgBuyPrice.toFixed(2)}
- Current: $${currentPrice.toFixed(2)}
- Value: $${totalValue.toFixed(2)}
- Unrealized ${gainOrLoss >= 0 ? "Gain" : "Loss"}: $${gainOrLoss.toFixed(2)}

Recent Performance:
${histData}`;
          })
        );

        const totalValue = portfolio.wallet + investedAmount;

        const contextMessage = `
Here is the user's current portfolio context:

- 💰 Wallet Balance: $${portfolio.wallet.toFixed(2)}
- 📊 Invested in Stocks (current value): $${investedAmount.toFixed(2)}
- 💼 Original Investment Fund: $${portfolio.investmentFund.toFixed(2)}
- 🧾 Total Portfolio Value: $${totalValue.toFixed(2)}

📁 Holdings and Performance:
${stockSummaries.join("\n\n")}
        `.trim();

        messages.push({ role: "assistant", content: contextMessage });
      }
    }

    messages.push({ role: "user", content: message });
  } catch (err) {
    console.error("Context generation error:", err.message);
    messages.push({
      role: "assistant",
      content: "Unable to enrich your query with live portfolio insights due to an internal error.",
    });
    messages.push({ role: "user", content: message });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    messages.push({ role: "assistant", content: reply });
    sessions.set(sessionId, messages);

    res.json({ reply });
  } catch (err) {
    console.error("LLM API error:", err?.response?.data || err.message);
    res.status(500).json({ reply: "Error processing your stock-related query." });
  }
};

module.exports = {
	  summarizeWithLLM,
    chatWithStockBot
};
