// BuyModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import useStock from '../context/StockContext';
import API from '../Service/api';

const BuyModal = ({ handleShowAlert }) => {
    let { showBuyModal,
        setShowBuyModal,
        stockDetails,
        realTimeData,
        quantity,
        setQuantity,
        total,
        setTotal,
        walletAmount,
        setWalletAmount,
        portfolioData,
        setPortfolioData,
        ticker,
        modalSource,
    } = useStock();
    const [ldata, setLdata] = useState([]);
    useEffect(() => {
        const findAndSetTickerData = () => {
            const foundTicker = portfolioData.find(stock => stock.ticker === ticker);

            if (foundTicker) {
                setLdata(foundTicker);
            } else {
                console.log("Ticker not found");
                setLdata({}); // If not found, set an empty object
            }
        };

        if (modalSource === "portfolio") {
            findAndSetTickerData();
        }
    }, [ticker, portfolioData, modalSource]);

    // Determine which price to display based on the modal source
    const currentPrice = modalSource === "portfolio" ? parseFloat(ldata.currentPrice) : parseFloat(realTimeData?.c).toFixed(2);
    // console.log(currentPrice)

    const calculateTotal = (qty) => {
        const numQty = parseFloat(qty) || 0;
        // const currentPrice = parseFloat(realTimeData.c) || 0;
        const totalPrice = numQty * currentPrice;
        setTotal(parseFloat(totalPrice.toFixed(2)));
        // console.log(total);
    };

    const handleQuantityChange = (e) => {
        const qty = e.target.value;
        setQuantity(qty);
        calculateTotal(qty);
    };

    const handleBuy = async () => {
        let sname, symbol, price;
        // console.log('entered the handleBuy', ticker);

        if (parseFloat(quantity) > 0) {
            const index = portfolioData.findIndex(p => p.ticker === stockDetails.ticker);

            // Found an existing entry for this ticker, update it
            if (index !== -1) {
                if (modalSource === "portfolio") {
                    // If buying from portfolio, get details from ldata
                    sname = ldata.companyName;
                    symbol = ldata.ticker;
                    price = ldata.currentPrice;
                } else {
                    // If buying from search, get details from stockDetails and realTimeData
                    sname = stockDetails.name;
                    symbol = stockDetails.ticker;
                    price = realTimeData.c;
                }
                const newQuantity = parseFloat(quantity);
                const newCurrentPrice = parseFloat(price);
                const newTotalCost = newQuantity * newCurrentPrice;
                // console.log('entered the update', ticker);
                try {

                    const stockData = {
                        name: sname,
                        symbol: symbol,
                        price: newCurrentPrice,
                        quantity: newQuantity,
                    };

                    const response = await API.post('/api/portfolioadd', stockData);
                    if (response.status !== 200) {
                        throw new Error('Failed to process sell operation');
                    }
                    handleShowAlert(`${ticker} bought successfully`, "success");
                } catch (error) {
                    console.error("Error updating data in database", error);
                }

                setPortfolioData((prevPortfolioData) => {
                    // Check if the symbol exists in the portfolio data
                    const existingIndex = prevPortfolioData.findIndex((p) => p.ticker === symbol);

                    if (existingIndex !== -1) {
                        // Update the existing entry
                        const updatedPortfolio = [...prevPortfolioData];
                        const existingEntry = updatedPortfolio[existingIndex];
                        const updatedQuantity = existingEntry.quantity + newQuantity;
                        const updatedTotalCost = existingEntry.totalCost + newTotalCost;

                        updatedPortfolio[existingIndex] = {
                            ...existingEntry,
                            quantity: updatedQuantity,
                            totalCost: updatedTotalCost,
                            currentPrice: newCurrentPrice,
                            marketValue: updatedQuantity * newCurrentPrice, // Assuming newMarketValue is not needed
                            avgCostPerShare: updatedTotalCost / updatedQuantity,
                        };

                        return updatedPortfolio;
                    }
                });
            } else {
                try {
                    const stockData = {
                        name: stockDetails.name,
                        symbol: stockDetails.ticker,
                        price: parseFloat(realTimeData.c),
                        quantity: parseFloat(quantity),
                    };
                    const response = await API.post('/api/portfolioadd', stockData);
                    if (response.status !== 200) {
                        throw new Error('Failed to process sell operation');
                    }
                    handleShowAlert(`${ticker} bought successfully`, "success")
                } catch (error) {
                    console.error("Error updating data in database", error);
                }
                // No existing entry, add a new one
                const purchase = {
                    ticker: stockDetails.ticker,
                    companyName: stockDetails.name,
                    quantity: parseFloat(quantity),
                    change: realTimeData.d,
                    totalCost: parseFloat(total),
                    currentPrice: realTimeData.c,
                    marketValue: parseFloat((parseFloat(quantity) * realTimeData.c).toFixed(2)),
                    avgCostPerShare: parseFloat((parseFloat(total) / parseFloat(quantity)).toFixed(2)),
                };

                setPortfolioData(prevPortfolioData => Array.isArray(prevPortfolioData) ? [...prevPortfolioData, purchase] : [purchase]);
            }


            setWalletAmount(prevAmount => prevAmount - parseFloat(total));
            setShowBuyModal(false);
            setQuantity("0");
            setTotal(parseFloat(0.00));
        }
    };

    useEffect(() => {
        // Only recalculate if the modal is intended to be shown
        // console.log(`Modal shown: ${showBuyModal}, Current Price: ${currentPrice}, Quantity: ${quantity}`);
        if (showBuyModal) {
            calculateTotal(quantity);
        }
    }, [showBuyModal, quantity, currentPrice]);


    return (
        <Modal key={showBuyModal ? 'bmodalKey' : 'bmodalKeyHidden'} show={showBuyModal} onHide={() => setShowBuyModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>{ticker}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Current Price: ${currentPrice} <br />
                Money in Wallet: ${walletAmount.toFixed(2)}<br />
                Quantity: <Form.Control type="number" value={quantity} onChange={handleQuantityChange} />
                {parseFloat(total) > walletAmount && <p style={{ color: 'red' }}>Not enough money in wallet!</p>}
            </Modal.Body>
            <Modal.Footer>
                Total: ${parseFloat(quantity) * currentPrice}<br />
                <Button variant="success" disabled={parseFloat(total) > walletAmount} onClick={handleBuy}>Buy</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BuyModal;
