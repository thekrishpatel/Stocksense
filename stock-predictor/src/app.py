from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime
import ta
import requests
from pymongo import MongoClient
from statsmodels.tsa.arima.model import ARIMA

app = Flask(__name__)
CORS(app)

# Global variable to store news articles
news_articles_cache = []

def preprocess_company_name(name):
    """Remove 'Limited', 'Ltd', and other common suffixes from company names."""
    suffixes = ['limited', 'ltd', 'corp', 'inc', 'llc']
    for suffix in suffixes:
        if suffix in name.lower():
            name = name.replace(suffix, '').strip()
    return name

def load_mappings(csv_path):
    """Load company to stock symbol mappings from a CSV file, with preprocessed names."""
    df = pd.read_csv(csv_path)
    df['CompanyName'] = df['CompanyName'].apply(preprocess_company_name)
    return dict(zip(df['CompanyName'].str.lower(), df['Symbol']))

def extract_stock_symbol_from_title(title, mappings):
    """Extract stock symbols from the title using company to symbol mappings."""
    suffixes = ['limited', 'ltd', 'corp', 'inc', 'llc']
    for company_name, symbol in mappings.items():
        for suffix in suffixes:
            company_name = company_name.replace(suffix, '').strip()
        if company_name in title:
            return symbol
    return None

def analyze_news_titles(news_articles, mappings):
    positive_indicators = ['good buy', 'buy', 'positive outlook', 'strong performance']
    
    suggestions = {}
    
    for article in news_articles:
        title = article.get('Title', '').lower()
        url = article.get('URL', '')
        
        if any(indicator in title for indicator in positive_indicators):
            stock_symbol = extract_stock_symbol_from_title(title, mappings)
            if stock_symbol:
                suggestions[stock_symbol] = {
                    'reason_to_buy': title,  # Include the full title here
                    'url': url
                }
    
    return suggestions

def short_term_analysis(data, stock_symbol):
    # Add technical indicators
    data['SMA_30'] = ta.trend.sma_indicator(data['Close'], window=30)
    data['SMA_100'] = ta.trend.sma_indicator(data['Close'], window=100)
    data['RSI'] = ta.momentum.RSIIndicator(data['Close']).rsi()
    
    latest_data = data.dropna().iloc[-1]
    
    data = data.dropna(subset=['SMA_30', 'SMA_100', 'RSI'])
    X = data[['SMA_30', 'SMA_100', 'RSI']]
    y = data['Close']
    
    model = LinearRegression()
    model.fit(X, y)
    
    next_day_features = [[latest_data['SMA_30'], latest_data['SMA_100'], latest_data['RSI']]]
    predicted_price = model.predict(next_day_features)[0]
    
    return predicted_price

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
            prediction = short_term_analysis(data, stock_symbol)
        elif term == 'long_term':
            prediction = long_term_analysis(stock_symbol)
        else:
            return "Invalid term specified"
        
        return prediction
    except Exception as e:
        return str(e)

def fetch_and_cache_news():
    global news_articles_cache
    url = "https://share-market-news-api-india.p.rapidapi.com/marketNews"
    headers = {
        "x-rapidapi-key": "dad1cda000msh0aed20de6c1b4a6p12de97jsn58b906584cbd",  # Replace with your actual API key
        "x-rapidapi-host": "share-market-news-api-india.p.rapidapi.com"
    }
    
    response = requests.get(url, headers=headers)
    # Proceed with JSON parsing
    if(response.status_code != 200):
        fetch_and_cache_news()
    
    try:
        news_articles_cache = response.json()
    except requests.exceptions.JSONDecodeError as e:
        fetch_and_cache_news()


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    stock_symbol = data.get('stock_symbol')
    term = data.get('term')
    prediction = predict_stock(stock_symbol, term)
    return jsonify({'prediction': prediction})

@app.route('/predict_stocks', methods=['GET'])
def predict_stocks():
    if(news_articles_cache == []):
        fetch_and_cache_news()  # Call the function directly
    """Endpoint to predict and list stocks based on cached news analysis."""
    # Load company to symbol mappings
    mappings_csv_path = 'full_company_names.csv'
    mappings = load_mappings(mappings_csv_path)

    # Use cached news articles
    suggestions = analyze_news_titles(news_articles_cache, mappings)

    # Fetch predictions for the suggested stocks
    predictions = {}
    for symbol in suggestions.keys():
        stock_data = yf.Ticker(symbol + '.NS')
        current_price = stock_data.history(period='1d')['Close'].iloc[-1] 
        short_term_pred = predict_stock(symbol, 'short_term')
        long_term_pred = predict_stock(symbol, 'long_term')
        predictions[symbol] = {
            'current_price': current_price,
            'short_term': short_term_pred,
            'long_term': long_term_pred,
            'details': suggestions[symbol]  # This includes the full title as reason to buy
        }

    # Return predictions as JSON
    return jsonify(predictions)

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['StockSense']  # Replace with your database name
collection = db['Profiles']  # Replace with your collection name

# In your Flask app

@app.route('/submit-form', methods=['POST'])
def submit_form():
    data = request.json

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    email = data.get('email')

    # Check if email already exists
    existing_user = collection.find_one({'email': email})
    if existing_user:
        return jsonify({
            'error': 'User already registered\nPlease Login',
            'redirect_url': '/login'  # You can include a URL for redirect
        }), 200

    # Initialize the stocks field
    data['stocks'] = []

    # Insert data into MongoDB
    result = collection.insert_one(data)
    if result.acknowledged:
        return jsonify({'message': 'Data stored successfully'}), 200
    else:
        return jsonify({'error': 'Failed to store data'}), 500



@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = collection.find_one({'email': email})
    if user:
        hashed_password = user['password']
        if password == hashed_password:
            return jsonify({
                'message': 'Login successful',
                'email': user['email'],  # Return the email
                'profilePicture': user.get('profilePicture', '')  # Return the profile picture if available
            }), 200
        else:
            return jsonify({'message': 'Invalid password'}), 401
    else:
        return jsonify({'message': 'User not found'}), 404

    
@app.route('/api/stock/<string:symbol>', methods=['GET'])
def get_stock_data(symbol):
    try:
        stock = yf.Ticker(symbol + '.NS')
        stock_info = stock.info
        
        if not stock_info:
            return jsonify({'error': 'No stock information available'}), 404
        
        stock_history = stock.history(period="1y")
        if stock_history.empty:
            return jsonify({'error': 'No historical data available'}), 404

        # Convert stock history to a list of dictionaries
        stock_history = stock_history.reset_index().to_dict(orient='records')
        return jsonify({
            'stock_info': stock_info,
            'stock_history': stock_history
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/user-portfolio', methods=['GET'])
def get_user_portfolio():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email not provided'}), 400

    user = collection.find_one({'email': email})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    stocks = user.get('stocks', [])
    portfolio = []

    for symbol in stocks:
        try:
            stock_data = yf.Ticker(symbol + '.NS')
            current_price = stock_data.history(period='1d')['Close'].iloc[-1]
            short_term_pred = predict_stock(symbol, 'short_term')
            long_term_pred = predict_stock(symbol, 'long_term')
            portfolio.append({
                'name': symbol,
                'currentPrice': current_price,
                'predictedShortTermPrice': short_term_pred,
                'predictedLongTermPrice': long_term_pred
            })
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            continue

    return jsonify(portfolio)

# Route to add a stock to the user's portfolio
@app.route('/add-stock', methods=['POST'])
def add_stock():
    data = request.json
    email = data.get('email')
    stock_symbol = data.get('stock_symbol')

    if not email or not stock_symbol:
        return jsonify({'error': 'Email or stock symbol not provided'}), 400

    user = collection.find_one({'email': email})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Add the stock to the user's portfolio if not already present
    if stock_symbol not in user.get('stocks', []):
        collection.update_one(
            {'email': email},
            {'$push': {'stocks': stock_symbol}}
        )
        return jsonify({'message': 'Stock added to portfolio'}), 200
    else:
        return jsonify({'message': 'Stock already in portfolio'}), 200
    
# Route to delete a stock from the user's portfolio
@app.route('/delete-stock', methods=['DELETE'])
def delete_stock():
    data = request.json
    email = data.get('email')
    stock_symbol = data.get('stock_symbol')

    if not email or not stock_symbol:
        return jsonify({'error': 'Email or stock symbol not provided'}), 400

    user = collection.find_one({'email': email})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if stock_symbol in user.get('stocks', []):
        result = collection.update_one(
            {'email': email},
            {'$pull': {'stocks': stock_symbol}}
        )
        if result.acknowledged and result.modified_count > 0:
            return jsonify({'message': 'Stock removed from portfolio'}), 200
        else:
            return jsonify({'error': 'Failed to remove stock'}), 500
    else:
        return jsonify({'error': 'Stock not found in portfolio'}), 404

    
if __name__ == '__main__':
    app.run(debug=True)
