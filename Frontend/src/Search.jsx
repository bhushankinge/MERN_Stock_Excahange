import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStock from './context/StockContext';
import './components/Header.css';
import * as React from 'react';
import './components/Search.css';
import Spinner from './components/Spinner';
import API from './Service/api';



function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}



function Search() {
    const { ticker, setTicker, setStockDetails } = useStock();
    const [inputValue, setInputValue] = useState('');
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);



    useEffect(() => {
        if (ticker) {
            setInputValue(ticker);
        }
    }, [ticker]);



    const fetchSuggestions = async () => {
        if (!inputValue) return;

        setIsLoading(true);

        try {
            const response = await API.get(`/api/search/${inputValue}`);
            const data = response.data;
            const filteredData = data.filter(suggestion => !suggestion.symbol.includes('.'));
            setSuggestions(filteredData);
            // console.log(suggestions);
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Use useMemo to memoize the debounced version of fetchSuggestions
    const debouncedFetchSuggestions = React.useMemo(() => debounce(fetchSuggestions, 500), [inputValue]);

    // useEffect to call debouncedFetchSuggestions when inputValue changes
    useEffect(() => {
        // Make sure to call the function since debouncedFetchSuggestions is now a function
        debouncedFetchSuggestions();
    }, [inputValue, debouncedFetchSuggestions, showSuggestions]);



    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        const trimmedValue = inputValue.trim().toUpperCase();
        if (trimmedValue && trimmedValue !== ticker) {
            setTicker(trimmedValue);
            navigate(`/search/${trimmedValue}`); // Navigate but keep the input state
        }
    };
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        // console.log(inputValue);
    };

    const handleCancelClick = () => {
        setInputValue(''); // Clear the input field
        setTicker('');
        navigate('/search/home'); // Navigate back to /search/home
        setStockDetails(null);
        setSuggestions([]);
    };

    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion); // Set input value to the selected suggestion
        setTicker(suggestion); // Optionally set the ticker if needed
        handleSubmit();
        navigate(`/search/${suggestion}`); // Navigate as per your logic
        setSuggestions([]);
        setShowSuggestions(false);
    };

    useEffect(() => {
        if (suggestions.length === 0 && !isLoading && inputValue.trim() !== '') {
            setAlertVisible(true);
            // Auto-close the alert after 5 seconds
            const timer = setTimeout(() => {
                setAlertVisible(false);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setAlertVisible(false);
        }
    }, [suggestions, isLoading, inputValue]);

    const closeAlert = () => {
        setAlertVisible(false); // Function to manually close the alert
    };

    return (
        <>
            <div className='container-fluid d-flex justify-content-center align-items-center p-0'>
                <div style={{ minWidth: '300px', maxWidth: '500px' }} className='container-sm w-50 d-flex flex-column justify-content-center align-items-center'>
                    <p className='headline text-center mt-3 mb-3'>STOCK SEARCH</p>
                    <form onSubmit={handleSubmit} role='search' className='search-bar d-flex justify-content-center w-75 p-1'>
                        <input
                            type="search"
                            placeholder='Enter stock ticker symbol'
                            value={inputValue}
                            onChange={handleInputChange}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            style={{ minwidth: '150px' }}
                            className='input-field w-75'
                        />
                        <button className="mb-1 icon-color" type='submit'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-search icon-color" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                            </svg>
                        </button>
                        <button className="mb-1 icon-color ms-2" type='button' onClick={handleCancelClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-x-lg " viewBox="0 0 16 16" style={{ stroke: "currentColor", strokeWidth: 0.5 }}>
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                            </svg>
                        </button>
                    </form>
                    {isInputFocused && (
                        <>
                            {isLoading ? (
                                <div style={{ backgroundColor: 'white' }}> <Spinner /></div>
                            ) : suggestions.length > 0 ? (
                                <ul className="suggestions-list">
                                    {suggestions.map((suggestion, index) => (
                                        <li key={index} onClick={() => handleSuggestionClick(suggestion.symbol)} className="suggestion-item">
                                            {`${suggestion.symbol} | ${suggestion.description}`}
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </>
                    )}
                </div>
            </div >
            {alertVisible && (
                <div className="container-fluid d-flex justify-content-center">
                    <div className="alert alert-danger mt-2" role="alert">
                        No data found. Please enter a valid Ticker
                        <button type="button" className="btn-close" onClick={closeAlert}></button>
                    </div>
                </div>
            )
            }
        </>

    )
}

export default Search


