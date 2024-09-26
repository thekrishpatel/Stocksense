import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_percentage_error
from statsmodels.tsa.arima.model import ARIMA
import ta
from datetime import datetime
import matplotlib.pyplot as plt

def calculate_indicators(data):
    # Adding specified indicators
    data['SMA_30'] = ta.trend.sma_indicator(data['Close'], window=30)
    data['SMA_100'] = ta.trend.sma_indicator(data['Close'], window=100)
    data['EMA_20'] = ta.trend.ema_indicator(data['Close'], window=20)
    data['EMA_50'] = ta.trend.ema_indicator(data['Close'], window=50)
    data['RSI'] = ta.momentum.RSIIndicator(data['Close']).rsi()
    
    # MACD
    data['MACD'] = ta.trend.macd(data['Close'])
    data['MACD Signal'] = ta.trend.macd_signal(data['Close'])
    data['MACD Histogram'] = ta.trend.macd_diff(data['Close'])
    
    # Bollinger Bands
    data['Bollinger High'] = ta.volatility.bollinger_hband(data['Close'])
    data['Bollinger Low'] = ta.volatility.bollinger_lband(data['Close'])

    # Average True Range (ATR)
    data['ATR'] = ta.volatility.average_true_range(data['High'], data['Low'], data['Close'])
    
    # Fibonacci Levels
    high_price = data['Close'].max()
    low_price = data['Close'].min()
    diff = high_price - low_price
    data['Fibonacci Level 0.0'] = high_price
    data['Fibonacci Level 0.236'] = high_price - (0.236 * diff)
    data['Fibonacci Level 0.382'] = high_price - (0.382 * diff)
    data['Fibonacci Level 0.618'] = high_price - (0.618 * diff)
    data['Fibonacci Level 1.0'] = low_price
    
    # Stochastic Oscillator
    data['Stochastic Oscillator'] = ta.momentum.stoch(data['High'], data['Low'], data['Close'])
    
    # On-Balance Volume (OBV)
    data['OBV'] = ta.volume.OnBalanceVolumeIndicator(data['Close'], data['Volume']).on_balance_volume()
    
    # Chaikin Money Flow (CMF)
    data['CMF'] = ta.volume.ChaikinMoneyFlowIndicator(data['High'], data['Low'], data['Close'], data['Volume']).chaikin_money_flow()

    # Aroon Indicator
    data['Aroon Up'] = ta.trend.aroon_up(data['High'], data['Low'], window=25)
    data['Aroon Down'] = ta.trend.aroon_down(data['High'], data['Low'], window=25)

    data = data.dropna()  # Drop rows with NaN values after calculating indicators
    return data

def predict_prices(data, target):
    # Check if there's enough data
    if len(data) < 2:
        print("Not enough data to make predictions.")
        return None

    # Calculate features
    X = data[['SMA_30', 'SMA_100', 'EMA_20', 'EMA_50', 
              'RSI', 'MACD', 'MACD Signal', 'MACD Histogram', 
              'Bollinger High', 'Bollinger Low', 'ATR', 
              'Stochastic Oscillator', 'OBV', 'CMF', 
              'Aroon Up', 'Aroon Down']]
    
    y = data[target]

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X[:-1], y[:-1])  # Train on all but the last row
    # Predict tomorrow's price using the last row of features
    tomorrow_features = X.iloc[[-1]]  # Use the last row for tomorrow's prediction
    predicted_price_tomorrow = model.predict(tomorrow_features)[0]

    return predicted_price_tomorrow

def short_term_analysis(data, stock_symbol):
    data = calculate_indicators(data)
    data = data.dropna()

    predicted_close = predict_prices(data, 'Close')
    predicted_low = predict_prices(data, 'Low')
    predicted_high = predict_prices(data, 'High')
    predicted_open = predict_prices(data, 'Open')
    
    print(f"Predicted Close Price (Tomorrow): {predicted_close:.2f}")
    print(f"Predicted Low Price (Tomorrow): {predicted_low:.2f}")
    print(f"Predicted High Price (Tomorrow): {predicted_high:.2f}")
    print(f"Predicted Open Price (Tomorrow): {predicted_open:.2f}")
    
    # Calculate percentage change for predicted low and high based on today's close
    actual_close_today = data['Close'].iloc[-1]
    percent_change_low = ((predicted_low - actual_close_today) / actual_close_today) * 100
    percent_change_high = ((predicted_high - actual_close_today) / actual_close_today) * 100
    
    print(f"Percentage Change in Low Price: {percent_change_low:.2f}%")
    print(f"Percentage Change in High Price: {percent_change_high:.2f}%")

    return predicted_close, predicted_low, predicted_high, predicted_open

def long_term_analysis(ticker):
    data = yf.download(ticker, period='5y')
    data['Price'] = data['Close']
    data.index = pd.to_datetime(data.index)
    data['Price_diff'] = data['Price'].diff().dropna()
    model = ARIMA(data['Price_diff'].dropna(), order=(5, 1, 0))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=30)
    last_price = data['Price'].iloc[-1]
    predicted_prices = last_price + forecast.cumsum()
    return predicted_prices.iloc[-1]

def predict_stock(stock_symbol, term):
    stock_symbol = stock_symbol + '.NS'
    try:
        # Fetch historical data to find the first trading date
        historical_data = yf.download(stock_symbol, period='max')
        
        # Get the first date of the stock's historical data
        start_date = historical_data.index.min().strftime('%Y-%m-%d')
        
        end_date = datetime.today().strftime('%Y-%m-%d')
        
        # Fetch the data for the specified date range
        data = yf.download(stock_symbol, start=start_date, end=end_date)

        if len(data) < 2:
            return "Insufficient data"

        if term == 'short_term':
            predicted_close, predicted_low, predicted_high, predicted_open = short_term_analysis(data, stock_symbol)
            return predicted_close, predicted_low, predicted_high, predicted_open
        elif term == 'long_term':
            prediction = long_term_analysis(stock_symbol)
            return prediction
        else:
            return "Invalid term specified"
    except Exception as e:
        print(f"Error: {str(e)}")
        return str(e)

def calculate_accuracy_on_specific_date(model, X, y, target, data, specific_date):
    # Convert specific_date to datetime object
    specific_date = pd.to_datetime(specific_date)

    # Check if specific_date exists in the data
    if specific_date in data.index:
        index = data.index.get_loc(specific_date)
        specific_features = X.iloc[[index]]
        predicted_price = model.predict(specific_features)[0]
        actual_price = y.iloc[index]

        # Calculate accuracy
        accuracy = 100 - mean_absolute_percentage_error([actual_price], [predicted_price]) * 100
        print(f"Actual {target} Price on {specific_date.strftime('%Y-%m-%d')}: {actual_price:.2f}, Predicted: {predicted_price:.2f}")
        print(f"Model Accuracy for {target} on {specific_date.strftime('%Y-%m-%d')}: {accuracy:.2f}%")
    else:
        print(f"Date {specific_date.strftime('%Y-%m-%d')} is not available in the data.")
