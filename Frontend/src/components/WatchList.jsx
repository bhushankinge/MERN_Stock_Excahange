import React, { useState, useEffect } from 'react'
import useStock from '../context/StockContext'
import Spinner from './Spinner';
import API from '../Service/api';

const StockCard = ({ stock, removeFromWatchlist }) => {
    // Determine the color for the price change
    const changeClass = stock.change > 0 ? 'text-success' : stock.change < 0 ? 'text-danger' : 'text-black';
    const changeIcon = stock.change > 0 ? (
        <i className="fa-solid fa-caret-up me-2" style={{ color: 'green', fontSize: '20px' }}></i>
    ) : stock.change < 0 ? (
        <i className="fa-solid fa-caret-down me-2" style={{ color: 'red', fontSize: '20px' }}></i>
    ) : null;

    return (
        <div className="card mb-3 shadow-sm" style={{ border: '0.5px solid grey' }}>
            <div className="card-body pt-0">
                <div className="row">
                    <div className="col-6">
                        <div className="row">
                            <div className="col">
                                <button type='button' onClick={() => removeFromWatchlist(stock.ticker)} className="btn-close" style={{ fontSize: '8px' }}></button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <h3>{stock.ticker}</h3>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <p style={{ fontSize: '18px', fontWeight: '500' }}>{stock.name}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="row">
                            <div className="col mt-4">
                                <h3 className={changeClass}>{stock.currentPrice}</h3>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col d-flex align-items-center">
                                {changeIcon}
                                <h6 className={changeClass}>{`${stock.change} (${Number(stock.percentChange).toFixed(2)}%)`}</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



function WatchList() {
    let { watchList, setWatchList } = useStock();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Change loading state to false after 1.5 seconds
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        // Cleanup the timer
        return () => clearTimeout(timer);
    }, []);

    const removeFromWatchlist = async (ticker) => {
        try {
            const response = await API.delete(`/api/deletewatch/${ticker}`);

            console.log("Delete operation successful:", response.data);
            // Filter out the deleted stock from the watchlist
            setWatchList(watchList.filter(stock => stock.ticker !== ticker));

        } catch (error) {
            console.error('Error removing stock from watchlist:', error);
            // Handle the error (e.g., show an error message)
        }
    };

    if (isLoading) {
        return <div className='container-fluid container-lg w-lg-75 mt-4'>
            <div className="mt-4 mb-4" style={{ fontSize: '32px', fontWeight: '500' }}>
                My Watchlist
            </div>
            <Spinner />
        </div>;
    }

    return (
        <div className='container-fluid container-lg w-lg-75 mt-4'>
            <div className="mt-4 mb-4" style={{ fontSize: '32px', fontWeight: '500' }}>
                My Watchlist
            </div>
            {watchList.length < 1 ? ( // Show this after loading is done and if there are no stocks
                <div className="alert alert-warning d-flex justify-content-center text-center" role="alert">
                    Currently, you don't have any stock in your watchlist.
                </div>
            ) : (
                watchList.map(stock => (
                    <StockCard key={stock.ticker} stock={stock} removeFromWatchlist={removeFromWatchlist} />
                ))
            )}
        </div>
    );
}
export default WatchList