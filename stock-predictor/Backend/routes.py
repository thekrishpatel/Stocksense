from flask import request, jsonify
from stock_analysis import predict_stock
from news_analysis import analyze_news_titles
from db_operations import collection
from utils import load_mappings
import yfinance as yf

def register_routes(app):
    @app.route('/predict', methods=['POST'])
    def predict():
        data = request.json
        stock_symbol = data.get('stock_symbol')
        term = data.get('term')
        prediction = predict_stock(stock_symbol, term)
        return jsonify({'prediction': prediction})

    @app.route('/predict_stocks', methods=['GET'])
    def predict_stocks():
        """Endpoint to predict and list stocks based on cached news analysis."""
        # Load company to symbol mappings
        mappings_csv_path = 'D:/New folder/stock-predictor/src/full_company_names.csv'
        mappings = load_mappings(mappings_csv_path)

        # Use cached news articles
        from news_analysis import news_articles_cache
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

    @app.route('/submit-form', methods=['POST'])
    def submit_form():
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        email = data.get('email')
        existing_user = collection.find_one({'email': email})
        if existing_user:
            return jsonify({
                'error': 'User already registered\nPlease Login',
                'redirect_url': '/login'
            }), 200
        data['stocks'] = []
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
                    'name': user['firstName'],
                    'email': user['email'],
                    'profilePicture': user.get('profilePicture', '')
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
        if stock_symbol not in user.get('stocks', []):
            collection.update_one(
                {'email': email},
                {'$push': {'stocks': stock_symbol}}
            )
            return jsonify({'message': 'Stock added to portfolio'}), 200
        else:
            return jsonify({'message': 'Stock already in portfolio'}), 200

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
