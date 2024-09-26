from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['StockSense']  # Replace with your database name
collection = db['Profiles']  # Replace with your collection name

def initialize_db(app):
    # Any additional initialization can go here if needed
    pass
