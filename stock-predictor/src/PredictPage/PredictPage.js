import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse'; // Import PapaParse
import './PredictPage.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import image from '../Login/image.png';
import Navbar from '../Navbar/navbar';
import Footer from '../Footer/footer';
import { useLocation } from 'react-router-dom';

const PredictPage = () => {
    const [stockSymbol, setStockSymbol] = useState('');
    const [term, setTerm] = useState('short_term');
    const [prediction, setPrediction] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [companyData, setCompanyData] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const location = useLocation();

    useEffect(() => {
        // Load CSV data on component mount
        Papa.parse('/full_company_names.csv', { // Update path as needed
            download: true,
            header: true,
            complete: (result) => {
                // Log data to verify it's loaded correctly
                console.log('CSV Data:', result.data);

                // Ensure data is properly mapped
                const data = result.data.map(item => ({
                    symbol: item.Symbol || '', // Default to empty string if undefined
                    name: item.CompanyName || '' // Default to empty string if undefined
                }));
                setCompanyData(data);
            },
            error: (error) => console.error('Error parsing CSV:', error),
        });
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const symbol = queryParams.get('stockSymbol');
        if (symbol) {
            setStockSymbol(symbol);
        }
    }, [location.search]);

    useEffect(() => {
        if (stockSymbol) {
            // Delay of 1 second before submitting
            const timer = setTimeout(() => {
                handleStockSubmit();
            }, 200);

            // Cleanup timer if component unmounts
            return () => clearTimeout(timer);
        }
    }, [stockSymbol]);

    const handleStockSubmit = async () => {
        setError('');
        setPrediction('');
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/predict', {
                stock_symbol: stockSymbol,
                term: term
            });

            // Check if the response data contains multiple predictions (short-term case)
            if (term === 'short_term' && Array.isArray(response.data.prediction)) {
                const [predictedClose, predictedLow, predictedHigh] = response.data.prediction;
                setPrediction(`Predicted Close: ₹${predictedClose.toFixed(2)}, Low: ₹${predictedLow.toFixed(2)}, High: ₹${predictedHigh.toFixed(2)}`);
            } else {
                // Handle long-term case or any other single value prediction
                setPrediction(`Predicted price: ₹${response.data.prediction.toFixed(2)}`);
            }
        } catch (error) {
            setError('An error occurred while fetching the prediction.');
        } finally {
            setLoading(false);
        }
    };


    const handleInputChange = (e) => {
        const query = e.target.value.toUpperCase();
        setStockSymbol(query);

        // Filter suggestions based on input
        if (query) {
            const filteredSuggestions = companyData.filter(item => {
                // Ensure item properties are defined before calling toLowerCase
                const symbolMatch = item.symbol && item.symbol.toUpperCase().includes(query);
                const nameMatch = item.name && item.name.toUpperCase().includes(query);
                return symbolMatch || nameMatch;
            });
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setStockSymbol(suggestion.symbol);
        setSuggestions([]);
    };

    return (
        <div className="predict-page-container">
            <Navbar />
            <div className="predict-page-content-container">
                <div className="predict-page-content">
                    <div className="predict-page-left">
                        <img src={image} alt="Character and Stats" className="predict-page-image" />
                    </div>
                    <div className="predict-page-right">
                        <h2>Predict Stock Prices</h2>
                        <p>Enter a stock symbol and select the prediction term to get forecasts based on recent data.</p>
                        <label className="predict-page-label" htmlFor="stock-symbol">
                            Stock Symbol:
                            <input
                                className="predict-page-input"
                                type="text"
                                id="stock-symbol"
                                value={stockSymbol}
                                onChange={handleInputChange}
                                placeholder="e.g., RELIANCE"
                            />
                        </label>
                        {suggestions.length > 0 && (
                            <div className="suggestions-container-unique">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="suggestion-item-unique"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion.symbol} - {suggestion.name}
                                    </div>
                                ))}
                            </div>
                        )}
                        <label className="predict-page-label" htmlFor="term">
                            Prediction Term:
                            <select
                                className="predict-page-select"
                                id="term"
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                            >
                                <option value="short_term">Short Term</option>
                                <option value="long_term">Long Term</option>
                            </select>
                        </label>
                        <button className="predict-page-button" onClick={handleStockSubmit} disabled={loading}>
                            {loading ? 'Fetching...' : 'Get Prediction'}
                        </button>
                        {prediction && <div className="predict-page-result">{
                            prediction
                        }</div>}
                        {error && <div className="predict-page-error">{error}</div>}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PredictPage;
