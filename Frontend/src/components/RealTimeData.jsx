import React, { useEffect, useState } from 'react';
import useStock from '../context/StockContext';
import Spinner from './Spinner';
import API from '../Service/api';

const RealTimeData = () => {
    let { ticker, setRealTimeData } = useStock();
    const [lrealTimeData, setlRealTimeData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchlRealTimeData = async () => {
            setLoading(true);
            try {
                const realTimeResponse = await API.get(`/api/stockdata/${ticker}?_=${new Date().getTime()}`);
                const lrealTimeData = realTimeResponse.data;
                setlRealTimeData(lrealTimeData);
                setRealTimeData(lrealTimeData);
            } catch (err) {
                console.error("Error fetching real-time data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchlRealTimeData(); // Fetch immediately on mount

        // Set up the interval
        const interval = setInterval(fetchlRealTimeData, 15000); // 15000 ms = 15 seconds

        // Clean up interval on component unmount
        return () => clearInterval(interval);

    }, [ticker]); // Only fetch real-time data when ticker changes

    if (loading) {
        return <Spinner />;
    }

    if (!lrealTimeData) {
        return null; // Or you can render a placeholder
    }

    // console.log(lrealTimeData)
    return (
        <>
            <h2 style={{ color: lrealTimeData.d > 0 ? 'green' : 'red' }}>{lrealTimeData.c}</h2>
            <div className="d-flex flex-row align-items-center">
                {lrealTimeData.d > 0 ? (
                    <i className="fa-solid fa-caret-up me-2" style={{ color: 'green', fontSize: '20px' }}></i>
                ) : (
                    <i className="fa-solid fa-caret-down me-2" style={{ color: 'red', fontSize: '20px' }}></i>
                )}
                <h4 style={{ color: lrealTimeData.d > 0 ? 'green' : 'red' }}>{lrealTimeData.d}</h4>
                <h4 style={{ color: lrealTimeData.d > 0 ? 'green' : 'red' }} className='ms-2'>({Number(lrealTimeData.dp).toFixed(2)}%)</h4>
            </div>
        </>
    );
};

export default RealTimeData;
