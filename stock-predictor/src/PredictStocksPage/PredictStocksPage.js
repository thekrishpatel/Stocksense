import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PredictStocksPage.css';
import Navbar from '../Navbar/navbar';
import Footer from '../Footer/footer';

const PredictStocksPage = () => {
    const [stocks, setStocks] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Initialize the useNavigate hook

    useEffect(() => {
        const fetchStocks = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch('http://localhost:5000/predict_stocks');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setStocks(Object.entries(data)); // Convert object to array for easier rendering
            } catch (error) {
                console.error('Fetch error:', error);
                setError('Error fetching stock predictions. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchStocks();
    }, []);

    const handleItemClick = (symbol) => {
        navigate(`/stock-info/${symbol}`);
    };

    return (
        <div className="predict-stocks-page">
            <Navbar />
            <section className="predict-stocks-hero">
                <div className="predict-stocks-hero-content">
                    <h2>Recommended Stocks</h2>
                    <p id='predictpageArticle'>Get a list of top stocks to buy based on recent news and analysis.</p>
                    {loading && (<h3 className="predict-loading">We are reseaching the news...</h3>)}
                    {error && <div className="predict-stocks-error">{error}</div>}
                    {!loading && !error && (
                        <ul className="predict-stocks-list">
                            {stocks.map(([symbol, data]) => (
                                <li
                                    key={symbol}
                                    className="predict-stocks-list-item"
                                    onClick={() => handleItemClick(symbol)}
                                >
                                    <h3>{symbol}</h3>
                                    <p>Short Term Prediction: ₹{data.short_term}</p>
                                    <p>Long Term Prediction: ₹{data.long_term}</p>
                                    <p>{data.details.reason_to_buy}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default PredictStocksPage;
