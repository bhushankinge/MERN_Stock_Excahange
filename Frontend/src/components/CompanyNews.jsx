import React, { useState, useEffect } from 'react'
import useStock from '../context/StockContext';
import { Modal } from 'react-bootstrap';
import Spinner from './Spinner';
import API from '../Service/api';


function formatUnixTimestamp(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}


function getDates() {
    const today = new Date();
    const twoYearsAgo = new Date(today);
    twoYearsAgo.setFullYear(today.getFullYear() - 2); // Subtract 2 years

    // Format today's date
    const yearToday = today.getFullYear();
    const monthToday = (today.getMonth() + 1).toString().padStart(2, '0');
    const dayToday = today.getDate().toString().padStart(2, '0');
    const formattedToday = `${yearToday}-${monthToday}-${dayToday}`;

    // Format date 2 years ago
    const yearTwoYearsAgo = twoYearsAgo.getFullYear();
    const monthTwoYearsAgo = (twoYearsAgo.getMonth() + 1).toString().padStart(2, '0');
    const dayTwoYearsAgo = twoYearsAgo.getDate().toString().padStart(2, '0');
    const formattedTwoYearsAgo = `${yearTwoYearsAgo}-${monthTwoYearsAgo}-${dayTwoYearsAgo}`;

    return {
        todaysDate: formattedToday,
        dateTwoYearsAgo: formattedTwoYearsAgo
    };
}


function CompanyNews() {
    let { ticker } = useStock();
    const [companyNews, setCompanyNews] = useState('');
    const dates = getDates();
    const [showModal, setShowModal] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);


    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await API.get(`/api/news/${ticker}/${dates.dateTwoYearsAgo}/${dates.todaysDate}`);
                const data = res.data;
                // console.log(data);
                setCompanyNews(data);
            } catch (error) {
                console.error('Error fetching news:', error);
            }
        };

        if (ticker) {
            fetchNews();
        }
    }, [ticker]);
    if (!Array.isArray(companyNews)) {
        return <div className='d-flex justify-content-center'><Spinner /></div>; // Or some other placeholder content
    }
    const validArticles = companyNews.filter(article => article.headline && article.image);

    const handleCardClick = (article) => {
        setSelectedArticle(article);
        setShowModal(true);
    };


    return (
        <div className="container mt-3">
            <div className="row">
                <div className="col-md-6">
                    {validArticles.slice(0, 10).map(article => (
                        <React.Fragment key={article.id}>
                            {/* Mobile view card with increased height, visible only on small screens */}
                            <div className='d-flex flex-column border p-3 align-items-center shadow-sm d-md-none'
                                onClick={() => handleCardClick(article)}
                                style={{ marginBottom: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px', minHeight: '200px' }}>
                                <img src={article.image} alt={article.headline} style={{ width: '300px', height: '150px', borderRadius: '3px' }} />
                                <p className='m-0 flex-grow-1 text-center mt-1' style={{ fontSize: '14px' }}>{article.headline}</p>
                            </div>

                            {/* Desktop view card, hidden on small screens */}
                            <div className='d-flex flex-row border p-3 align-items-center shadow-sm d-none d-md-flex'
                                onClick={() => handleCardClick(article)}
                                style={{ marginBottom: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px', minHeight: '83px' }}>
                                <img src={article.image} alt={article.headline} style={{ width: '90px', height: '50px', borderRadius: '3px' }} />
                                <p className='m-0 flex-grow-1 text-center' style={{ fontSize: '14px' }}>{article.headline}</p>
                            </div>
                        </React.Fragment>


                    ))}
                </div>
                <div className="col-md-6">
                    {validArticles.slice(10, 20).map(article => (
                        <React.Fragment key={article.id}>
                            {/* Mobile view card with increased height, visible only on small screens */}
                            <div className='d-flex flex-column border p-3 align-items-center shadow-sm d-md-none'
                                onClick={() => handleCardClick(article)}
                                style={{ marginBottom: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px', minHeight: '200px' }}>
                                <img src={article.image} alt={article.headline} style={{ width: '300px', height: '150px', borderRadius: '3px' }} />
                                <p className='m-0 flex-grow-1 text-center mt-1' style={{ fontSize: '14px' }}>{article.headline}</p>
                            </div>

                            {/* Desktop view card, hidden on small screens */}
                            <div className='d-flex flex-row border p-3 align-items-center shadow-sm d-none d-md-flex'
                                onClick={() => handleCardClick(article)}
                                style={{ marginBottom: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px', minHeight: '83px' }}>
                                <img src={article.image} alt={article.headline} style={{ width: '90px', height: '50px', borderRadius: '3px' }} />
                                <p className='m-0 flex-grow-1 text-center' style={{ fontSize: '14px' }}>{article.headline}</p>
                            </div>
                        </React.Fragment>
                    ))}
                </div>

            </div>

            <Modal key={showModal ? 'modalKey' : 'modalKeyHidden'} show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header className='pe-0 ps-2'>
                    <Modal.Title className='row container-fluid pe-0 ps-1'>
                        <div className="col-10">
                            <h3 className='mb-1'>{selectedArticle?.source}</h3>
                            <p className='mb-0' style={{ fontSize: '14px', fontWeight: '500', color: 'grey' }}>{formatUnixTimestamp(selectedArticle?.datetime)}</p>
                        </div>
                        <div className="col-2 text-end pe-0">
                            <button type="button" aria-label="Close" onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', color: 'blue', textDecoration: 'underline', fontSize: '1rem', marginLeft: 'auto' }}>
                                ×
                            </button>
                        </div>

                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className='mb-0' style={{ fontSize: '20px', fontWeight: '500' }}>{selectedArticle?.headline}</p>
                    <p className='mb-0' style={{ fontSize: '14px' }}>{selectedArticle?.summary}</p>
                    <p className='mt-0' style={{ fontSize: '13px', color: 'grey' }}>For more details click <a href={selectedArticle?.url} target="_blank" rel="noopener noreferrer">here</a></p>
                </Modal.Body>
                <Modal.Footer style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    margin: '10px',
                    flexDirection: 'column',
                    padding: '5px',
                    paddingLeft: '10px',
                    justifyContent: 'start',
                    alignItems: 'start'
                }}>
                    <div style={{
                        fontWeight: 'bold',
                        marginBottom: '5px',
                        textAlign: 'start',
                        width: '100%'
                    }}>
                        Share
                    </div>
                    <div className='d-flex flex-row justify-content-start'>
                        <div style={{ gap: '10px' }}>
                            <a
                                className="twitter-share-button"
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedArticle?.headline)}&url=${encodeURIComponent(selectedArticle?.url)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" style={{ width: '40px', height: '35px' }}>
                                    <path d="M26.37,26l-8.795-12.822l0.015,0.012L25.52,4h-2.65l-6.46,7.48L11.28,4H4.33l8.211,11.971L12.54,15.97L3.88,26h2.65 l7.182-8.322L19.42,26H26.37z M10.23,6l12.34,18h-2.1L8.12,6H10.23z"></path>
                                </svg>
                            </a>
                            <a
                                className="facebook-share-button"
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedArticle?.url)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: '50px', height: '40px' }}>
                                    <path fill="#0804fc" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path>
                                    <path fill="#FFF" d="M34.368,25H31v13h-5V25h-3v-4h3v-2.41c0.002-3.508,1.459-5.59,5.592-5.59H35v4h-2.287C31.104,17,31,17.6,31,18.723V21h4L34.368,25z"></path>
                                </svg>

                            </a>
                        </div>
                    </div>
                </Modal.Footer>

            </Modal>

        </div>


    )
}

export default CompanyNews