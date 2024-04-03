const express = require('express')
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const WatchList = require('./WatchListDB');
const app = express();
const Portfolio = require('./Portfolio');

app.use(cors());
app.use(express.json());


const dbURI = 'mongodb+srv://kingebhushan2000:OmiW4uBz6fKZKvP7@cluster0.zbwgbfl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
    .then(() => console.log('MongoDB connected...'))
    .catch((err) => console.error(err));

let marketStatus = false;

const API_KEY = 'cn5vh49r01qo3qc0cgf0cn5vh49r01qo3qc0cgfg';
const POLY_API = 'dkp5gqpPpUv_fqkSqndn0sLojPbhOkol';

const upsertStockEntry = async ({ name, symbol, price, quantity }) => {
    try {
        // Attempt to find the stock by its symbol
        let stock = await Portfolio.findOne({ symbol });

        if (stock) {
            // If the stock exists, update its price and increment its quantity
            stock.price = price;
            stock.quantity += quantity; // Increment existing quantity
        } else {
            // If the stock doesn't exist, create a new entry
            stock = new Portfolio({ name, symbol, price, quantity });
        }

        // Save the updated or new stock entry
        const result = await stock.save();

        console.log('Upserted stock entry:', result);
    } catch (error) {
        console.error('Error upserting stock entry:', error);
    }
};


app.post('/api/portfolioadd', async (req, res) => {
    try {
        const { name, symbol, price, quantity } = req.body;
        await upsertStockEntry({ name, symbol, price, quantity });
        res.status(200).json({ message: 'Portfolio entry added/updated successfully.' });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/sell', async (req, res) => {
    try {
        const { symbol, sellQuantity } = req.body;

        // Find the stock entry in the portfolio
        let stock = await Portfolio.findOne({ symbol });
        if (!stock) {
            return res.status(404).json({ message: "Stock not found in portfolio." });
        }

        if (sellQuantity > stock.quantity) {
            return res.status(400).json({ message: "Selling quantity exceeds the quantity owned." });
        }

        // Adjust the quantity or remove the stock entry
        stock.quantity -= sellQuantity;
        if (stock.quantity > 0) {
            await stock.save();
        } else {
            await Portfolio.deleteOne({ symbol });
        }

        res.status(200).json({ message: 'Stock quantity adjusted or entry removed successfully.' });
    } catch (error) {
        console.error('Error processing sell request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/api/tickers', async (req, res) => {
    try {
        const { ticker, name } = req.body;
        const newTicker = new WatchList({ ticker, name });
        await newTicker.save();
        res.status(201).send(newTicker);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get('/api/tickers/:ticker', async (req, res) => {
    try {
        const { ticker } = req.params;
        const stock = await WatchList.findOne({ ticker: ticker });
        if (stock) {
            res.status(200).send({ exists: true, stock: stock });
        } else {
            res.status(200).send({ exists: false });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/api/deletewatch/:ticker', async (req, res) => {
    try {
        const { ticker } = req.params;
        const result = await WatchList.findOneAndDelete({ ticker: ticker });

        if (result) {
            res.status(200).send({ message: `Stock with ticker ${ticker} removed from watchlist` });
        } else {
            res.status(404).send({ message: 'Stock not found in watchlist' });
        }
    } catch (error) {
        console.error('Failed to delete stock from watchlist:', error);
        res.status(500).send({ message: 'Failed to delete stock from watchlist', error: error.message });
    }
});

function getDates() {
    const today = new Date();
    let yesterday = new Date(today);

    // Adjust for weekends: if it's Sunday (0) or Monday (1), set to last Friday
    if (today.getDay() === 1) { // Monday
        yesterday.setDate(today.getDate() - 3);
    } else if (today.getDay() === 0) { // Sunday
        yesterday.setDate(today.getDate() - 2);
    } else { // Tuesday to Saturday
        yesterday.setDate(today.getDate() - 1);
    }

    const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // Today's date formatted
    const formattedToday = formatDate(today);

    // Yesterday's date formatted
    const formattedYesterday = formatDate(yesterday);

    // Date from two years ago formatted
    const twoYearsAgo = new Date(new Date().setFullYear(today.getFullYear() - 2));
    const formattedTwoYearsAgo = formatDate(twoYearsAgo);

    return {
        today: formattedToday,
        yesterday: formattedYesterday,
        twoYearsAgo: formattedTwoYearsAgo,
    };
}


app.get('/api/stock/:ticker', async (req, res) => {
    const { ticker } = req.params;
    console.log(ticker)

    if (!ticker) {
        return res.status(400).json({ error: 'stock ticker is required' });
    }

    const stockProfileUrl = `https://finnhub.io/api/v1/stock/profile2`;
    // Adjusted market status URL with parameters directly in the URL
    const marketStatusUrl = `https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${API_KEY}`;

    const stockProfileParams = {
        params: {
            symbol: ticker,
            token: API_KEY // Your Finnhub API key
        }
    };

    try {
        const [stockProfileResponse, marketStatusResponse] = await Promise.all([
            axios.get(stockProfileUrl, stockProfileParams),
            axios.get(marketStatusUrl) // No params object needed since the URL includes the query parameters
        ]);
        marketStatus = marketStatusResponse.data.isOpen;
        // Directly include isOpen, timezone, and timestamp in the combined response
        const combinedResponse = {
            ...stockProfileResponse.data,
            isOpen: marketStatusResponse.data.isOpen,
            timestamp: marketStatusResponse.data.t
        };
        // console.log(combinedResponse);

        res.json(combinedResponse);
    } catch (error) {
        console.error('API call error:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.get('/api/stockdata/:ticker', async (req, res) => {
    const { ticker } = req.params;

    if (!ticker) {
        return res.status(400).json({ error: 'Stock ticker is required' });
    }
    try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY}&cb=${Date.now()}`;
        const response = await axios.get(url);
        const data = response.data;
        res.json(data);
    } catch (error) {
        console.error('Failed to fetch stock data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});


app.get('/api/search/:query', async (req, res) => {
    const { query } = req.params;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const response = await axios.get(`https://finnhub.io/api/v1/search`, {
            params: {
                q: query,
                token: API_KEY
            }
        });
        res.json(response.data.result); // Assuming you want to return the array of results directly.
    } catch (error) {
        console.error('API call error:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.get('/api/peers/:ticker', async (req, res) => {
    const ticker = req.params.ticker;
    let { today, yesterday } = getDates();

    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${ticker}&token=${API_KEY}`);
        // Assuming response from Finnhub is always correct for simplicity

        // Simulate fetching chart data with proper error handling
        let chartData;
        try {
            const chart_res = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/hour/${yesterday}/${today}?adjusted=true&%20sort=asc&apiKey=MxU_YJSX2T3aVfYFBAc1KoVd3LHf4Ihz`);
            chartData = chart_res.data;
            console.log(chartData);
        } catch (error) {
            console.error('Error fetching chart data:', error);
            // Handle or log the error as needed
            chartData = {}; // Provide a fallback value or handle as needed
        }

        res.json({
            peersData: response.data,
            chartData: chartData,
        });
    } catch (error) {
        console.error('Error fetching company peers:', error);
        res.status(500).json({ message: 'Error fetching company peers' });
    }
});

app.get('/api/news/:ticker/:fromDate/:toDate', async (req, res) => {
    const { ticker, fromDate, toDate } = req.params;

    try {
        const response = await axios.get(`https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${fromDate}&to=${toDate}&token=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching company news:', error);
        res.status(500).json({ message: 'Error fetching company news' });
    }
});




app.get('/api/daily-charts/:ticker', async (req, res) => {
    try {
        const { ticker } = req.params;
        const { today, twoYearsAgo } = getDates();

        const chartsData = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${twoYearsAgo}/${today}?adjusted=true&
        sort=asc&apiKey=MxU_YJSX2T3aVfYFBAc1KoVd3LHf4Ihz`);
        res.json(chartsData.data);
        // console.log(chartsData.data)
    } catch (error) {
        console.error("Error fetching daily charts data:", error);
    }
});


app.get('/api/insights/:ticker', async (req, res) => {
    try {
        const { ticker } = req.params;

        const sentiments = await axios.get(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${ticker}&from=2022-01-01&token=${API_KEY}`);

        const recommendations = await axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${API_KEY}`);

        const earnings = await axios.get(`https://finnhub.io/api/v1/stock/earnings?symbol=${ticker}&token=${API_KEY}`);

        const combinedResponse = {
            sentiments: sentiments.data,
            recommendations: recommendations.data,
            earnings: earnings.data,

        };

        res.json(combinedResponse)
    } catch (error) {
        console.error("Error fetching insights data:", error);
    }
});


const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));