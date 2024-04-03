import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import useStock from '../context/StockContext';
import API from '../Service/api';


const SellModal = ({ handleShowAlert }) => {

    let {
        showSellModal,
        setShowSellModal,
        stockDetails,
        realTimeData,
        walletAmount,
        setWalletAmount,
        portfolioData,
        setPortfolioData,
        quantity,
        setQuantity,
        total,
        setTotal,
        ticker,
        modalSource,
    } = useStock();

    const [isSellingMoreThanOwned, setIsSellingMoreThanOwned] = useState(false);
    const [displayTicker, setDisplayTicker] = useState(ticker);
    const [currentPrice, setCurrentPrice] = useState(realTimeData?.c);

    useEffect(() => {
        // Adjust displayTicker and currentPrice based on modalSource
        if (modalSource === 'portfolio') {
            const portfolioItem = portfolioData.find(item => item.ticker === ticker);
            if (portfolioItem) {
                setDisplayTicker(portfolioItem.ticker);
                setCurrentPrice(portfolioItem.currentPrice); // Assuming currentPrice exists in your portfolioData structure
            }
        } else {
            setDisplayTicker(stockDetails.ticker);
            setCurrentPrice(realTimeData?.c);
        }
    }, [modalSource, ticker, portfolioData, stockDetails, realTimeData]);

    useEffect(() => {
        // Reset the total whenever the quantity or currentPrice changes
        setTotal(parseFloat(quantity) * currentPrice);
    }, [quantity, currentPrice]);


    const handleQuantityChange = (e) => {
        const newQuantity = e.target.value;
        setQuantity(newQuantity);
        const ownedQuantity = portfolioData.find(item => item.ticker === stockDetails.ticker)?.quantity || 0;
        setIsSellingMoreThanOwned(parseFloat(newQuantity) > ownedQuantity);
    };

    const handleSell = async () => {
        const sellQuantity = parseFloat(quantity);
        if (sellQuantity <= 0 || isSellingMoreThanOwned) return;

        try {
            const response = await API.post('/api/sell', {
                symbol: stockDetails.ticker,
                sellQuantity: parseFloat(quantity),
            });

            // Handle successful sell operation
            console.log('Sell operation processed successfully', response.data);
            handleShowAlert(`${ticker} sold successfully`, "danger")
        } catch (error) {
            console.error('Error processing sell operation:', error);
        }

        const stockInPortfolio = portfolioData.find(p => p.ticker === stockDetails.ticker);
        if (!stockInPortfolio || sellQuantity > stockInPortfolio.quantity) {
            console.error('Selling more than owned is not allowed.');
            return;
        }

        // Adjust the portfolio after selling
        const remainingQuantity = stockInPortfolio.quantity - sellQuantity;
        if (remainingQuantity > 0) {
            stockInPortfolio.quantity = remainingQuantity;
            stockInPortfolio.totalCost = remainingQuantity * stockInPortfolio.avgCostPerShare;
            stockInPortfolio.marketValue = remainingQuantity * realTimeData?.c;
        } else {
            setPortfolioData(portfolioData.filter(p => p.ticker !== stockDetails.ticker));
        }

        setWalletAmount(prevAmount => prevAmount + (sellQuantity * realTimeData?.c));

        setShowSellModal(false);
        setQuantity("0");
        setTotal(0.00);
    };

    return (
        <Modal key={showSellModal ? 'bmodalKey' : 'bmodalKeyHidden'} show={showSellModal} onHide={() => setShowSellModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Sell {ticker}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Current Price: ${realTimeData?.c.toFixed(2)}</p>
                <p>Money in Wallet: ${walletAmount.toFixed(2)}</p>
                <p>Quantity:</p>
                <Form.Control
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="0"
                />
                {isSellingMoreThanOwned && <p style={{ color: 'red' }}>You cannot sell stocks you don't have!</p>}
            </Modal.Body>
            <Modal.Footer>
                <p>Total: ${total}</p>
                <Button variant="danger" onClick={handleSell} disabled={isSellingMoreThanOwned || parseFloat(quantity) <= 0}>Sell</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SellModal;