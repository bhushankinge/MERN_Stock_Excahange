const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    symbol: {
        type: String,
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

module.exports = Portfolio;