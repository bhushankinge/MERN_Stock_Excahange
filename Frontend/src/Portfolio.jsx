import React, { useEffect, useState } from 'react';
import useStock from './context/StockContext';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import BuyModal from './components/BuyModal';
import SellModal from './components/SellModal';
import { useNavigate } from 'react-router-dom';
import Spinner from './components/Spinner';

function Portfolio() {
    let { portfolioData, setShowSellModal, setShowBuyModal, setTicker, setModalSource, walletAmount } = useStock();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Change loading state to false after 1.5 seconds
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        // Cleanup the timer
        return () => clearTimeout(timer);
    }, []);

    // // State to control the visibility of the alert
    // const [showAlert, setShowAlert] = useState(false); // You would set this based on your application's logic

    const handleHeaderClick = (Ticker) => {
        setTicker(Ticker);
        navigate(`/search/${Ticker}`);
    };

    const openSellModal = (ticker) => {
        setTicker(ticker);
        console.log(ticker);
        setModalSource('portfolio');
        setShowSellModal(true);
    };

    const openBuyModal = (ticker) => {
        setTicker(ticker);
        console.log(ticker);
        setModalSource('portfolio');
        setShowBuyModal(true);
    };

    if (isLoading) {
        return <div className='container-fluid container-lg w-lg-75 mt-5'>
            <h2>My Portfolio</h2>
            <Spinner />
        </div>;
    }

    return (
        <div className='container-fluid container-lg w-lg-75 mt-5'>

            <h2>My Portfolio</h2>
            <h4 className='mb-4'>Money in Wallet: ${Number(walletAmount).toFixed(2)}</h4>
            {(!Array.isArray(portfolioData) || portfolioData.length === 0) && (
                <Alert variant="warning">Currently, you don't have any stock.</Alert>
            )}
            {portfolioData.map((data, index) => {
                const changeClass = data.change > 0 ? 'text-success' : data.change < 0 ? 'text-danger' : 'text-black';
                const changeIcon = data.change > 0 ? (
                    <i className="fa-solid fa-caret-up me-2" style={{ color: 'green', fontSize: '20px' }}></i>
                ) : data.change < 0 ? (
                    <i className="fa-solid fa-caret-down me-2" style={{ color: 'red', fontSize: '20px' }}></i>
                ) : null;
                // Added return statement here
                return (
                    <Card key={index} style={{ width: '100%', marginBottom: '10px' }}>
                        <Card.Header className='d-flex flex-row' onClick={() => handleHeaderClick(data.ticker)}>
                            <h3>{data.ticker}</h3>
                            <h5 className='mt-2 ms-2 text-secondary'>{data.companyName}</h5>
                        </Card.Header>
                        <Card.Body className='fs-5'>
                            <div className="row ">
                                <div className="col-md-6">
                                    <div className="row">
                                        <div className="col-6 " >
                                            <b>Quantity:</b>
                                        </div>
                                        <div className="col-6">
                                            <b><p>{Number(data.quantity).toFixed(2)}</p></b>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">
                                            <b>Avg. Cost:</b>
                                        </div>
                                        <div className="col-6">
                                            <b><p>{Number(data.avgCostPerShare).toFixed(2)}</p></b>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">
                                            <b>Total Cost:</b>
                                        </div>
                                        <div className="col-6">
                                            <b><p>{Number(data.totalCost).toFixed(2)}</p></b>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="row">
                                        <div className="col-6">
                                            <b>Change:</b>
                                        </div>
                                        <div className="col-6 ">
                                            <b> <p className={changeClass}>{changeIcon}{data.change}</p></b>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">
                                            <b>Current Price:</b>
                                        </div>
                                        <div className="col-6">
                                            <b><p className={changeClass}>{data.currentPrice}</p></b>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <b>Market Value:</b>
                                        </div>
                                        <div className="col">
                                            <b><p className={changeClass}>{data.marketValue}</p></b>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                        <Card.Footer>
                            <Button className='me-3' variant="primary" onClick={() => openBuyModal(data.ticker)}>Buy</Button>
                            <Button variant="danger" onClick={() => openSellModal(data.ticker)}>Sell</Button>
                        </Card.Footer>
                    </Card>
                );
            })}

            <BuyModal />
            <SellModal />
        </div >
    );
}

export default Portfolio;
