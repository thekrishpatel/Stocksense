from flask import Flask
from flask_cors import CORS
from routes import register_routes
from db_operations import initialize_db
from news_analysis import fetch_and_cache_news
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Configure CORS
    CORS(app, resources={r"/*": {"origins": "*"}})

    try:
        # Initialize the database
        logger.info('Starting server...')
        initialize_db(app)
        logger.info('Database connected successfully.')

        # Fetch and cache news articles
        logger.info('Fetching and caching news articles...')
        fetch_and_cache_news()
        logger.info('News articles fetched and cached successfully.')

        # Register routes
        register_routes(app)
        logger.info('Routes registered and connection established.')

    except Exception as e:
        logger.error(f'Error initializing the application: {e}')
        raise

    return app

if __name__ == '__main__':
    # Get the debug mode from environment variables or default to False
    debug_mode = os.getenv('FLASK_DEBUG', 'True').lower() in ['true', '1', 't']
    
    # Create the Flask app
    app = create_app()

    # Run the application (for development only)
    app.run(debug=debug_mode, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
