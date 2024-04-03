import React, { useEffect, useState } from 'react';
import ResultsTab from './components/ResultsTab';
import useStock from './context/StockContext';
import moment from 'moment-timezone';
import RealTimeData from './components/RealTimeData';
import { Button } from 'react-bootstrap';
import StarComponent from './components/StarComponent';
import Spinner from './components/Spinner';
import BuyModal from './components/BuyModal';
import SellModal from './components/SellModal';
import API from './Service/api';

// import Search from './Search'; // Uncomment if you need to include the search component
const stockDetailsCache = {};

const getMarketStatusMessage = (marketOpen, stockDetails) => {
    if (marketOpen) {
        return '<span style="color: green;">Market is Open</span>';
    } else {
        // Ensure moment is defined and has the timezone plugin
        if (typeof moment === "undefined" || typeof moment.tz === "undefined") {
            console.error("Moment or Moment Timezone is not defined. Make sure to include and configure it.");
            return '<span style="color: red;">Market Status Unknown</span>';
        }

        // Calculate the last market close time
        const nyTime = moment.unix(stockDetails.timestamp).tz("America/New_York");
        const laTime = nyTime.clone().tz("America/Los_Angeles");
        const dayOfWeek = laTime.day(); // Day of week in LA time

        let formattedCloseTime;

        if (dayOfWeek === 6 || dayOfWeek === 0) { // If it's Saturday or Sunday in LA
            // Show previous Friday at 13:00
            formattedCloseTime = laTime.day(5).hour(13).minute(0).second(0).format("YYYY-MM-DD 13:00:00");
        } else if (dayOfWeek === 1 && laTime.hour() < 6) { // If it's Monday before market open in LA
            // Show previous Friday at 13:00
            formattedCloseTime = laTime.subtract(3, 'days').day(5).hour(13).minute(0).second(0).format("YYYY-MM-DD 13:00:00");
        } else {
            // Since you want to always show the close time as 13:00:00, adjust here accordingly
            formattedCloseTime = moment.unix(stockDetails.timestamp).tz("America/New_York").format("YYYY-MM-DD 13:00:00");
        }

        return `<span style="color: red;">Market Closed on ${formattedCloseTime}</span>`;
    }
};


const getCurrentTimeInLA = () => {
    // Get the current time in Los Angeles timezone
    const laTime = moment().tz("America/Los_Angeles");

    // Format the date and time in the desired format
    const formattedTime = laTime.format("YYYY-MM-DD HH:mm:ss");

    return formattedTime;
};

function SearchDetails() {
    let {
        ticker,
        stockDetails,
        setStockDetails,
        marketOpen,
        setMarketOpen,
        portfolioData,
        setShowBuyModal,
        setShowSellModal,
    } = useStock();

    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');

    const handleShowAlert = (message, type = 'success') => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
        setTimeout(() => {
            setShowAlert(false);
        }, 3000); // Hide after 5 seconds
    };


    useEffect(() => {
        if (!ticker) {
            return;
        }

        const fetchData = async () => {
            // Check if data for this ticker is already in the cache
            if (stockDetailsCache[ticker]) {
                // Use cached data
                const cachedData = stockDetailsCache[ticker];
                setStockDetails(cachedData);
                setMarketOpen(cachedData.isOpen);
                return;
            }

            setLoadingDetails(true);
            try {
                const stockResponse = await API.get(`/api/stock/${ticker}`);
                const stockData = stockResponse.data;

                // Cache the fetched data
                stockDetailsCache[ticker] = stockData;

                setStockDetails(stockData);
                setMarketOpen(stockData.isOpen);
            } catch (err) {
                console.error("Error fetching stock data:", err);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchData();
    }, [ticker, setStockDetails, setMarketOpen]);



    const handleBuyClick = () => {
        setShowBuyModal(true);
    };

    if (!stockDetails || loadingDetails) {
        return <Spinner />;
    }



    let isInPortfolio
    if (Array.isArray(portfolioData)) {
        isInPortfolio = portfolioData.some(p => p.ticker === ticker);
    } else {
        // Handle the case where portfolioData is not an array
        console.warn('portfolioData is not an array', portfolioData);
    }



    // console.log(portfolioData);

    return (

        < div className='container-fluid container-lg w-lg-75 d-flex flex-column mb-2 mt-2 '>
            {showAlert && (
                <div className={`alert alert-${alertType} alert-dismissible fade show d-flex justify-content-center`} role="alert">
                    {alertMessage}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setShowAlert(false)}></button>
                </div>
            )}
            <div className="row d-flex flex-row justify-content-evenly mt-1">
                <div className='col-4 d-flex flex-column align-items-center p-0'>
                    <div className="d-flex flex-row m-0 p-0">
                        <h3 className='mb-1 mt-1'>{stockDetails.ticker}</h3>
                        <StarComponent handleShowAlert={handleShowAlert} />
                    </div>
                    <h5 className='text-secondary mb-1 mt-1'>{stockDetails.name}</h5>
                    <p className='text-secondary-emphasis mb-1 text-center' style={{ fontSize: '14px', fontWeight: '500' }}>{stockDetails.exchange}</p>
                    <div className="d-flex flex-row m-1">
                        <Button className='ps-3 pe-3 me-1' variant="success" onClick={() => handleBuyClick()}>Buy</Button>
                        {isInPortfolio && <Button className='ps-3 pe-3' variant="danger" onClick={() => setShowSellModal(true)}>Sell</Button>}
                    </div>
                    <BuyModal handleShowAlert={handleShowAlert} />
                    <SellModal handleShowAlert={handleShowAlert} />
                </div>
                <div className=" col-3 col-lg-4 d-flex flex-column align-items-center p-0">
                    <img className='w-50 mt-2 mb-5' alt='logo' src={stockDetails.logo} style={{ maxHeight: '15vh', maxWidth: '100px', minWidth: '50px' }} />
                    <p style={{ fontSize: '14px' }} className='fw-medium text-center' dangerouslySetInnerHTML={{ __html: getMarketStatusMessage(marketOpen, stockDetails) }}></p>
                </div>
                <div className="col-5 col-lg-4 d-flex flex-column align-items-center p-0">
                    <RealTimeData />
                    <p style={{ fontSize: '14px' }}>{getCurrentTimeInLA()}</p>
                </div>
            </div>
            <ResultsTab />
        </div >
    );
}


export default SearchDetails;
