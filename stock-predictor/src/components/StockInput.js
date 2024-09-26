import React, { useState } from 'react';

const StockInput = ({ onSubmit }) => {
    const [stockSymbol, setStockSymbol] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        if (stockSymbol) {
            onSubmit(stockSymbol);
            setStockSymbol('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Stock Symbol:
                <input
                    type="text"
                    value={stockSymbol}
                    onChange={(e) => setStockSymbol(e.target.value)}
                    placeholder="Enter stock symbol (e.g., RELIANCE)"
                />
            </label>
            <button type="submit">Get Prediction</button>
        </form>
    );
};

export default StockInput;
