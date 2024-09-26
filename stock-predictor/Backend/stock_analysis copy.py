import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_percentage_error
from statsmodels.tsa.arima.model import ARIMA
import ta
from datetime import datetime

def calculate_indicators(data):
    # Adding various indicators
    data['SMA_30'] = ta.trend.sma_indicator(data['Close'], window=30)
    data['SMA_100'] = ta.trend.sma_indicator(data['Close'], window=100)
    data['RSI'] = ta.momentum.RSIIndicator(data['Close']).rsi()
    data['MFI'] = ta.volume.MFIIndicator(high=data['High'], low=data['Low'], close=data['Close'], volume=data['Volume']).money_flow_index()
    data['OBV'] = ta.volume.OnBalanceVolumeIndicator(data['Close'], data['Volume']).on_balance_volume()
    data['ATR'] = ta.volatility.average_true_range(data['High'], data['Low'], data['Close'])
    data['EMA_20'] = ta.trend.ema_indicator(data['Close'], window=20)
    data['EMA_50'] = ta.trend.ema_indicator(data['Close'], window=50)
    data['EMA_100'] = ta.trend.ema_indicator(data['Close'], window=100)
    data['EMA_200'] = ta.trend.ema_indicator(data['Close'], window=200)

    # Fibonacci Levels
    high_price = data['Close'].max()
    low_price = data['Close'].min()
    diff = high_price - low_price

    data['Fibonacci Level 0.0'] = high_price
    data['Fibonacci Level 0.236'] = high_price - (0.236 * diff)
    data['Fibonacci Level 0.382'] = high_price - (0.382 * diff)
    data['Fibonacci Level 0.618'] = high_price - (0.618 * diff)
    data['Fibonacci Level 1.0'] = low_price
    
    # MACD
    data['MACD'] = ta.trend.macd(data['Close'])
    data['MACD Signal'] = ta.trend.macd_signal(data['Close'])
    data['MACD Histogram'] = ta.trend.macd_diff(data['Close'])

    # Additional Indicators
    data['ADX'] = ta.trend.ADXIndicator(data['High'], data['Low'], data['Close']).adx()
    data['Williams %R'] = ta.momentum.williams_r(data['High'], data['Low'], data['Close'])
    data['Stochastic Oscillator'] = ta.momentum.stoch(data['High'], data['Low'], data['Close'])
    data['CCI'] = ta.trend.cci(data['High'], data['Low'], data['Close'])
    data['ROC'] = ta.momentum.roc(data['Close'])
    data['Bollinger High'] = ta.volatility.bollinger_hband(data['Close'])
    data['Bollinger Low'] = ta.volatility.bollinger_lband(data['Close'])
    data['Stochastic RSI'] = ta.momentum.stochrsi(data['Close'])
    data['TSI'] = ta.momentum.tsi(data['Close'])
    data['DPO'] = ta.trend.dpo(data['Close'])
    data['Vortex Indicator Positive'] = ta.trend.vortex_indicator_pos(data['High'], data['Low'], data['Close'])
    data['Vortex Indicator Negative'] = ta.trend.vortex_indicator_neg(data['High'], data['Low'], data['Close'])
    data['TRIX'] = ta.trend.trix(data['Close'])
    data['DMI+'] = ta.trend.adx_pos(data['High'], data['Low'],data['Close'])
    data['DMI-'] = ta.trend.adx_neg(data['High'], data['Low'],data['Close'])
    data['Ulcer Index'] = ta.volatility.ulcer_index(data['Close'])
    data['Donchian Channel High'] = ta.volatility.donchian_channel_hband(data['High'], data['Low'], close=data['Close'], window=20)
    data['Donchian Channel Low'] = ta.volatility.donchian_channel_lband(data['High'], data['Low'], close=data['Close'], window=20)
    data['Mass Index'] = ta.trend.mass_index(data['High'], data['Low'])
    data['Aroon Up'] = ta.trend.aroon_up(data['High'], data['Low'], window=25)
    data['Aroon Down'] = ta.trend.aroon_down(data['High'], data['Low'], window=25)

    data = data.dropna()  # Drop rows with NaN values after calculating indicators
    return data

def predict_prices(data, target):
    """
    Predicts the target price (Close, Low, or High) using a Random Forest Regressor model.
    """
    # Define features and target variable
    X = data[['SMA_30', 'SMA_100', 'RSI', 'MFI', 'OBV', 'ATR', 
              'EMA_20', 'EMA_50', 'EMA_100', 'EMA_200', 
              'ADX', 'Williams %R', 'Stochastic Oscillator', 'CCI', 
              'ROC', 'Bollinger High', 'Bollinger Low', 
              'MACD', 'MACD Signal', 'MACD Histogram', 
              'Stochastic RSI', 'TSI', 'DPO', 
              'Vortex Indicator Positive', 'Vortex Indicator Negative', 
              'TRIX', 'DMI+', 'DMI-', 
              'Ulcer Index', 'Donchian Channel High', 'Donchian Channel Low', 
              'Mass Index', 'Aroon Up', 'Aroon Down']]

    y = data[target]

    # Fit the Random Forest Regressor model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X[:-1], y[:-1])  # Train on all but the last row

    # Predict the price for tomorrow using the last row of features
    tomorrow_features = X.iloc[[-1]]  # Use the last row for tomorrow's prediction
    predicted_price_tomorrow = model.predict(tomorrow_features)[0]

    # Predict the price for the previous day (yesterday)
    yesterday_features = X.iloc[[-2]]  # Use the second last row for yesterday's prediction
    predicted_price_yesterday = model.predict(yesterday_features)[0]

    # Compare predicted price with the actual price of yesterday
    actual_price_yesterday = y.iloc[-2]
    accuracy = 100 - mean_absolute_percentage_error([actual_price_yesterday], [predicted_price_yesterday]) * 100

    print(f"Actual {target} Price (Yesterday): {actual_price_yesterday:.2f}")
    print(f"Predicted {target} Price (Yesterday): {predicted_price_yesterday:.2f}")
    print(f"Model Accuracy for {target} (Yesterday): {accuracy:.2f}%")

    # Return the predicted price of tomorrow
    return predicted_price_tomorrow

def short_term_analysis(data, stock_symbol):
    # Calculate indicators
    data = calculate_indicators(data)

    # Drop rows with NaN values from the new indicators
    data = data.dropna()

    # Predict Close, Low, and High prices for tomorrow
    predicted_close = predict_prices(data, 'Close')
    predicted_low = predict_prices(data, 'Low')
    predicted_high = predict_prices(data, 'High')

    print(f"Predicted Close Price (Tomorrow): {predicted_close:.2f}")
    print(f"Predicted Low Price (Tomorrow): {predicted_low:.2f}")
    print(f"Predicted High Price (Tomorrow): {predicted_high:.2f}")

    return predicted_close, predicted_low, predicted_high

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
        start_date = '2020-01-01'
        end_date = datetime.today().strftime('%Y-%m-%d')
        data = yf.download(stock_symbol, start=start_date, end=end_date)

        if len(data) < 2:
            return "Insufficient data"

        if term == 'short_term':
            predicted_close, predicted_low, predicted_high = short_term_analysis(data, stock_symbol)
            return predicted_close, predicted_low, predicted_high
        elif term == 'long_term':
            prediction = long_term_analysis(stock_symbol)
            return prediction
        else:
            return "Invalid term specified"
    except Exception as e:
        print(f"Error: {str(e)}")
        return str(e)
