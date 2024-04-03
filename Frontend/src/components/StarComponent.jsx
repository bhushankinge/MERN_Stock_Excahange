import React, { useState, useEffect } from 'react';
import useStock from '../context/StockContext';
import API from '../Service/api';

const StarComponent = ({ handleShowAlert }) => {
    const [isStarActive, setIsStarActive] = useState(false); // State to manage if star is active (yellow)
    let { ticker, watchList, setWatchList, realTimeData, stockDetails } = useStock();



    const checkStockInWatchlist = async () => {
        try {
            const response = await API.get(`/api/tickers/${ticker}`);
            const data = await response.data
            setIsStarActive(data.exists);
        } catch (error) {
            console.error("Failed to check stock in watchlist:", error);
        }
    };


    useEffect(() => {
        // Check if the stock is in the watchlist when the component mounts or ticker changes
        checkStockInWatchlist();
    }, [ticker]);

    const addToWatchlist = async () => {
        const newStock = {
            ticker: ticker,
            name: stockDetails.name,
            currentPrice: realTimeData.c,
            change: realTimeData.d,
            percentChange: realTimeData.dp,
        };

        // Check if the stock is already in the watchlist
        const isStockExist = watchList.some(stock => stock.ticker === ticker);


        if (!isStockExist) {
            try {
                const response = await API.post('/api/tickers', {
                    ticker: newStock.ticker,
                    name: newStock.name,
                });
                if (response.status !== 201) {
                    throw new Error('Failed to process sell operation');
                }

                // Optionally, fetch the updated watchlist here or manage state based on response
                const addedStock = await response.data;
                // console.log('Stock added to watchlist:', addedStock);

                setWatchList(prevWatchList => [...prevWatchList, newStock]);
                setIsStarActive(true);
                handleShowAlert(`${ticker} added to Watchlist`, 'success');

            } catch (error) {
                console.error('Error adding stock to watchlist:', error);
            }
        } else {

            try {
                const response = await API.delete(`/api/deletewatch/${ticker}`);

                // console.log("Delete operation successful:", response.data);

                // Remove the stock from the local state
                setWatchList(prevWatchList => prevWatchList.filter(stock => stock.ticker !== ticker));
                setIsStarActive(false);
                handleShowAlert(`${ticker} removed from Watchlist`, 'danger');
                // console.log('Stock removed from watchlist:', ticker);
            } catch (error) {
                console.error('Error removing stock from watchlist:', error);
            }
        }
    };

    return (
        isStarActive ? (
            <i
                className="fa-solid fa-star text-warning mt-2 ms-2"
                onClick={addToWatchlist}
                style={{ cursor: 'pointer', fontSize: '22px', color: 'yellow' }}
            ></i>
        ) : (
            <i
                className="bi bi-star ms-2"
                onClick={addToWatchlist}
                style={{ cursor: 'pointer', fontSize: '22px' }}
            ></i>
        )

    );
};

export default StarComponent;
