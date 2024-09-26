import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StockInfoPage.css';
import Navbar from '../Navbar/navbar';
import Footer from '../Footer/footer';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register necessary components and scales
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const StockInfoPage = () => {
    const { stockSymbol } = useParams();
    const [stockData, setStockData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize the useNavigate hook

    useEffect(() => {
        const fetchStockData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/stock/${stockSymbol}`);
                setStockData(response.data);
                if (!response.data.stock_info) {
                    setError(`Stock not found. Check the name again (e.g., SUZLON, MTNL).`);
                }
            } catch (err) {
                setError(`Error: Stock not found. Check the name again (e.g., SUZLON, MTNL).`);
            }
        };
        fetchStockData();
    }, [stockSymbol]);

    if (error) {
        return (
            <div>
                <Navbar />
                <div className="error-message-container">
                    <p className="error-message">{error}</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!stockData) {
        return <div className="spinner"></div>; // Use a CSS spinner here
    }

    const { stock_info, stock_history } = stockData;

    if (!stock_info) {
        return <div>No stock information available for {stockSymbol}</div>;
    }

    if (!stock_history || stock_history.length === 0) {
        return <div>No historical data available for {stockSymbol}</div>;
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const chartData = {
        labels: stock_history.map(entry => formatDate(entry.Date)), // Formatted Dates as labels
        datasets: [
            {
                label: 'Highest Price',
                data: stock_history.map(entry => entry.High),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            },
        ],
    };


    return (
        <div>
            <Navbar />

            <div className="container-wrapper">

                {/* Stock Company Info Container */}
                <div className="stock-company-name-container">
                    <h1>{stock_info.longName}</h1>
                </div>

                <div className="stock-company-info-container">
                    <p><strong>Sector:</strong> {stock_info.sector || 'N/A'}</p>
                    <p><strong>Industry:</strong> {stock_info.industry || 'N/A'}</p>
                    <p><strong>Website:</strong> <a href={stock_info.website} target="_blank" rel="noopener noreferrer">{stock_info.website}</a></p>
                    <p><strong>Description:</strong> {stock_info.longBusinessSummary || 'No description available.'}</p>
                </div>

                {/* Financial Status Container */}
                <div className="financial-status-container">
                    <h2>Financial Status</h2>
                    <p><strong>Current Price:</strong> ₹{stock_info.currentPrice || 'N/A'}</p>
                    <p><strong>Market Cap:</strong> ₹{stock_info.marketCap || 'N/A'}</p>
                    <p><strong>52-Week High:</strong> ₹{stock_info.fiftyTwoWeekHigh || 'N/A'}</p>
                    <p><strong>52-Week Low:</strong> ₹{stock_info.fiftyTwoWeekLow || 'N/A'}</p>
                    <p><strong>Dividend Yield:</strong> {stock_info.fiveYearAvgDividendYield || 'N/A'}%</p>
                    <p><strong>Average Volume:</strong> {stock_info.averageVolume || 'N/A'}</p>
                    <p><strong>Previous Close:</strong> ₹{stock_info.previousClose || 'N/A'}</p>
                </div>

                {/* Chart Container */}
                <div className="chart-container">
                    <h2>Price History</h2>
                    <Line data={chartData} />
                </div>

                {/* Predict Price Button */}
                <div className="predict-button-container">
                    <button
                        onClick={() => navigate(`/predict?stockSymbol=${stockSymbol}`)}
                        className="predict-button"
                    >
                        Predict price for tomorrow
                    </button>
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default StockInfoPage;
