import React, { useState, useEffect, useMemo } from 'react';
import useStock from '../context/StockContext'
import { useNavigate } from 'react-router-dom';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import Spinner from './Spinner';
import API from '../Service/api';

const peersChartDataCache = {};


function SummaryTab() {
    let { realTimeData, stockDetails, marketOpen } = useStock();
    const navigate = useNavigate();
    const [peers, setPeers] = useState(null);
    let { ticker, setTicker } = useStock();
    const [lchartData, setChartData] = useState({});

    useEffect(() => {
        const fetchPeers = async () => {
            // Check cache first
            if (peersChartDataCache[ticker]) {
                const cachedData = peersChartDataCache[ticker];
                const uniqueFilteredPeers = [...new Set(cachedData.peers.filter(peer => !peer.includes('.')))];
                // console.log(uniqueFilteredPeers)
                setPeers(uniqueFilteredPeers);
                setChartData(cachedData.chartData);
                return;
            }

            try {
                const res = await API.get(`/api/peers/${ticker}`);
                const peersData = [...new Set(res.data.peersData)].filter(peer => !peer.includes('.'));

                const chartData = res.data?.chartData?.results?.map((item) => {
                    return [item.t, item.c];
                }) || []; // Default to an empty array if anything goes wrong

                // Update cache
                peersChartDataCache[ticker] = { peers: peersData, chartData: chartData };

                setPeers(peersData);
                setChartData(chartData);
                // console.log(chartData);
            } catch (error) {
                console.error('Error fetching peers:', error);
            }
        };

        if (ticker) {
            fetchPeers();
        }
    }, [ticker]);



    const chartOptions = useMemo(() => ({
        title: {
            text: `${ticker} Hourly Price Variation`,
            style: {
                color: '#969696',
                fontSize: '15px',
                fontWeight: '600'
            }
        },
        xAxis: {
            type: "datetime",
            tickInterval: 3 * 3600 * 1000, // 3 hours in milliseconds
            title: {
                text: null,
            },
        },
        yAxis: {
            title: {
                text: null,
            },
            opposite: true,
        },
        series: [
            {
                name: "",
                data: lchartData,
                pointInterval: 3 * 3600 * 1000, // one hour
                marker: {
                    enabled: false,
                },
                color: marketOpen ? "green" : "red",
            },
        ],
    }), [ticker, lchartData, marketOpen]);


    const handlePeerClick = (peerTicker) => {
        setTicker(peerTicker); // Update the ticker in context
        navigate(`/search/${peerTicker}`); // Navigate after setting the context
    };


    if (!lchartData || !peers || !realTimeData) {
        return <Spinner />; // You can customize this as needed
    }


    return (
        <div className='d-flex container-fluid row'>
            <div className="d-flex flex-column col-md-6 col-sm-12">
                <div className="d-flex container flex-column mb-3 mt-4 ms-5" style={{ fontSize: '14px' }}>
                    <p className='mb-0 ms-5'><b>High Price: </b>{realTimeData.h}</p>
                    <p className='mb-0 ms-5'><b>Low Price: </b>{realTimeData.l}</p>
                    <p className='mb-0 ms-5'><b>Open Price: </b>{realTimeData.o}</p>
                    <p className='mb-0 ms-5'><b>Prev. Close: </b>{realTimeData.pc}</p>
                </div>
                <div className="d-flex container flex-column align-items-center text-center mt-2">
                    <h5><u>About the company</u></h5>
                    <p className='mt-4 mb-2' style={{ fontSize: '14px' }}><b>IPO start Date:</b>{stockDetails.ipo}</p>
                    <p className='mb-2' style={{ fontSize: '14px' }}><b>Industry: </b>{stockDetails.finnhubIndustry}</p>
                    <p className='mb-2' style={{ fontSize: '14px' }}><b>Webpage: </b><a href={stockDetails.weburl} target="_blank" rel="noopener noreferrer">{stockDetails.weburl}</a></p>
                    <div style={{ fontSize: '14px' }}>
                        <p className='mb-2 '><b>Company Peers: </b></p>
                        {peers.map((peer, index) => (
                            <React.Fragment key={peer}>
                                {/* Using span or button for click handling */}
                                <span
                                    onClick={() => handlePeerClick(peer)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                                >
                                    {peer}
                                </span>
                                {index < peers.length - 1 ? ', ' : ''}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
            <div className='col-md-6 col-sm-12'>
                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            </div>
        </div>
    )
}

export default SummaryTab