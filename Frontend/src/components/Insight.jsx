import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import useStock from '../context/StockContext';
import { Spinner } from 'react-bootstrap';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import './Search.css';
import API from '../Service/api';

HighchartsAccessibility(Highcharts);

function Insight() {
    const { ticker, stockDetails } = useStock();
    const [recommendations, setRecommendations] = useState([]);
    const [insideSent, setInsideSent] = useState([]);
    const [surprise, setSurprise] = useState([]);
    const [chartOptions, setChartOptions] = useState([]);
    const [surpriseChartOptions, setSurpriseChartOptions] = useState({});
    const [totals, setTotals] = useState({
        totalMspr: 0,
        totalChange: 0,
        positiveMspr: 0,
        positiveChange: 0,
        negativeMspr: 0,
        negativeChange: 0
    });

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const insightsResponse = await API.get(`/api/insights/${ticker}`);
                // console.log(insightsResponse)
                setRecommendations(insightsResponse.data.recommendations);
                setInsideSent(insightsResponse.data.sentiments.data);
                setSurprise(insightsResponse.data.earnings);

            } catch (error) {
                console.error('Error fetching Insights:', error);
            }
        };
        if (ticker) {
            fetchInsights();
        }
    }, [ticker]);


    useEffect(() => {
        if (recommendations.length > 0) {
            setChartOptions({
                chart: {
                    type: 'column',
                    backgroundColor: '#F8F8F8',
                    spacingBottom: 50
                },
                accessibility: {
                    enabled: true, // This line ensures accessibility features are enabled
                },
                title: {
                    text: 'Recommendation Trends'
                },
                xAxis: {
                    categories: recommendations.map(insight => insight.period)
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: '# Analysis'
                    },
                    stackLabels: {
                        enabled: false,
                        style: {
                            fontWeight: 'bold',
                            color: ( // theme
                                Highcharts.defaultOptions.title.style &&
                                Highcharts.defaultOptions.title.style.color
                            ) || 'gray'
                        }
                    }
                },
                legend: {
                    align: 'center',
                    x: -30,
                    verticalAlign: 'bottom',
                    y: 35,
                    floating: true,
                    backgroundColor:
                        Highcharts.defaultOptions.legend.backgroundColor || '#F8F8F8',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false,
                },
                tooltip: {
                    headerFormat: '<b>{point.x}</b><br/>',
                    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: [{
                    name: 'Strong Buy',
                    data: recommendations.map(insight => insight.strongBuy),
                    stack: 'recommendations',
                    color: '#006100'
                }, {
                    name: 'Buy',
                    data: recommendations.map(insight => insight.buy),
                    stack: 'recommendations',
                    color: '#00dc00'
                }, {
                    name: 'Hold',
                    data: recommendations.map(insight => insight.hold),
                    stack: 'recommendations',
                    color: '#e6b800'
                }, {
                    name: 'Sell',
                    data: recommendations.map(insight => insight.sell),
                    stack: 'recommendations',
                    color: '#ff6666'
                }, {
                    name: 'Strong Sell',
                    // Replace 'strongSell' with the correct property name for the strong sell data
                    data: recommendations.map(insight => insight.strongSell || 0),
                    stack: 'recommendations',
                    color: '#800000'
                }]
            });

            setSurpriseChartOptions({
                chart: {
                    type: 'spline',
                    backgroundColor: '#F8F8F8',
                },
                title: {
                    text: 'Historical EPS Surprise'
                },
                xAxis: {
                    categories: surprise.map(surprise => `${surprise.period} <br> Surprise: ${surprise.surprise}`),

                    labels: {
                        useHTML: true, // Allows HTML in labels for line breaks and styling if needed
                        formatter: function () {
                            return this.value; // Returns the formatted label with period and surprise
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: 'Surprise Value'
                    }
                },
                tooltip: {
                    shared: true
                },
                series: [{
                    name: 'Actual',
                    data: surprise.map(surprise => surprise.actual),
                    color: '#68BBE3'
                }, {
                    name: 'Estimate',
                    data: surprise.map(surprise => surprise.estimate),
                    color: '#000080'
                }]
            });


            const totalMspr = insideSent.reduce((acc, val) => acc + val.mspr, 0);
            const totalChange = insideSent.reduce((acc, val) => acc + val.change, 0);
            const positiveMspr = insideSent.reduce((acc, val) => val.mspr > 0 ? acc + val.mspr : acc, 0);
            const positiveChange = insideSent.reduce((acc, val) => val.change > 0 ? acc + val.change : acc, 0);
            const negativeMspr = insideSent.reduce((acc, val) => val.mspr < 0 ? acc + val.mspr : acc, 0);
            const negativeChange = insideSent.reduce((acc, val) => val.change < 0 ? acc + val.change : acc, 0);

            setTotals({
                totalMspr,
                totalChange,
                positiveMspr,
                positiveChange,
                negativeMspr,
                negativeChange
            });
        }
    }, [recommendations]);

    if (!stockDetails || !Object.keys(chartOptions).length === 0 || !Object.keys(surpriseChartOptions).length === 0 || !totals.totalMspr === 0) {
        return <Spinner animation="border" />;
    }
    return (
        <div>
            <div className="container-fluid mt-3">
                <div className="row mb-3">
                    <div className="col-12">
                        <h5 className="text-center">Insider Sentiments</h5>
                    </div>
                </div>

                <div className="container-fluid w-50 align-items-center text-center">
                    <div className="row mb-3 ">
                        <div className="col-12 d-flex justify-content-center">
                            <table className="table table-responsive-sm light-border">
                                <thead>
                                    <tr>
                                        <th>{stockDetails.name}</th>
                                        <th>MSPR</th>
                                        <th>Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><b>Total</b></td>
                                        <td>{totals.totalMspr.toFixed(2)}</td>
                                        <td>{totals.totalChange.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Positive</b></td>
                                        <td>{totals.positiveMspr.toFixed(2)}</td>
                                        <td>{totals.positiveChange.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Negative</b></td>
                                        <td>{totals.negativeMspr.toFixed(2)}</td>
                                        <td>{totals.negativeChange.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                <div className="row">
                    <div className="col-lg-6 mb-3">
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={chartOptions}
                        />
                    </div>

                    <div className="col-lg-6">
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={surpriseChartOptions}
                        />
                    </div>
                </div>
            </div>


        </div>
    )
}

export default Insight