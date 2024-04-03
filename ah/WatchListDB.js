const mongoose = require('mongoose');

const tickerSchema = new mongoose.Schema({
    ticker: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    }
});

const Ticker = mongoose.model('Ticker', tickerSchema);

module.exports = Ticker;
