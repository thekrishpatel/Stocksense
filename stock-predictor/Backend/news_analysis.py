import requests
from utils import extract_stock_symbol_from_title

news_articles_cache = []

def fetch_and_cache_news():
    global news_articles_cache
    url = "https://share-market-news-api-india.p.rapidapi.com/marketNews"
    headers = {
        "x-rapidapi-key": "",  # Replace with your actual API key
        "x-rapidapi-host": "share-market-news-api-india.p.rapidapi.com"
    }
    
    response = requests.get(url, headers=headers)
    print(response.status_code)
    try:
        news_articles_cache = response.json()
    except requests.exceptions.JSONDecodeError as e:
        fetch_and_cache_news()

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
                    'reason_to_buy': title,
                    'url': url
                }
    
    return suggestions
