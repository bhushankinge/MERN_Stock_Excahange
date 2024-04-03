import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import HC_indicators from 'highcharts/indicators/indicators-all';
import HC_vbp from 'highcharts/indicators/volume-by-price';
import useStock from '../context/StockContext';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import Spinner from './Spinner';
import API from '../Service/api';

// Initialize Highcharts modules
HC_indicators(Highcharts);
HC_vbp(Highcharts);
HighchartsAccessibility(Highcharts);

function Charts() {
    let { ticker } = useStock();
    const [chartOptions, setChartOptions] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchChartData = async () => {
            setIsLoading(true);
            try {
                const res = await API.get(`/api/daily-charts/${ticker}`);
                const data = res.data.results;
                // console.log(data);

                const ohlc = [];
                const volume = [];

                data.forEach(item => {
                    const date = item.t; // Assuming 't' is the timestamp
                    ohlc.push([
                        date,
                        item.o, // open
                        item.h, // high
                        item.l, // low
                        item.c // close
                    ]);
                    volume.push([
                        date,
                        item.v // volume
                    ]);
                });

                const options = {
                    chart: {
                        height: 700,
                        backgroundColor: '#f8f8f8'
                    },
                    accessibility: {
                        enabled: true, // This line ensures accessibility features are enabled
                    },
                    rangeSelector: {
                        selected: 2
                    },
                    title: {
                        text: `${ticker} Historical`
                    },
                    subtitle: {
                        text: 'with SMA and Volume by Price technical indicators',
                        style: {
                            color: '#666666',
                            fontSize: '13px'
                        }
                    },
                    yAxis: [{
                        labels: {
                            align: 'right',
                            x: -3
                        },
                        title: {
                            text: 'OHLC'
                        },
                        height: '60%',
                        lineWidth: 2,
                        resize: {
                            enabled: true
                        }
                    }, {
                        labels: {
                            align: 'right',
                            x: -3
                        },
                        title: {
                            text: 'Volume'
                        },
                        top: '65%',
                        height: '35%',
                        offset: 0,
                        lineWidth: 2
                    }],
                    series: [{
                        type: 'candlestick',
                        name: ticker,
                        id: ticker,
                        data: ohlc
                    }, {
                        type: 'column',
                        name: 'Volume',
                        data: volume,
                        yAxis: 1,
                        id: 'volume'
                    }, {
                        type: 'vbp',
                        linkedTo: ticker,
                        params: {
                            volumeSeriesID: 'volume'
                        },
                        dataLabels: {
                            enabled: false
                        },
                        zoneLines: {
                            enabled: false
                        }
                    }, {
                        type: 'sma',
                        linkedTo: ticker,
                        zIndex: 1,
                        marker: {
                            enabled: false
                        }
                    }]
                };

                setChartOptions(options);
            } catch (error) {
                console.error('Error fetching Charts Data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChartData();
    }, [ticker]);

    if (isLoading) {
        return (
            <div className='d-flex justify-content-center mt-5'>
                <Spinner />
            </div>);
    }

    return (
        <div>
            {ticker && (
                <HighchartsReact
                    highcharts={Highcharts}
                    constructorType={'stockChart'}
                    options={chartOptions}
                />
            )}
        </div>
    );
}

export default Charts;
