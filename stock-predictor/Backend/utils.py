import pandas as pd

def preprocess_company_name(name):
    suffixes = ['limited', 'ltd', 'corp', 'inc', 'llc']
    for suffix in suffixes:
        if suffix in name.lower():
            name = name.replace(suffix, '').strip()
    return name

def load_mappings(csv_path):
    df = pd.read_csv(csv_path)
    df['CompanyName'] = df['CompanyName'].apply(preprocess_company_name)
    return dict(zip(df['CompanyName'].str.lower(), df['Symbol']))

def extract_stock_symbol_from_title(title, mappings):
    suffixes = ['limited', 'ltd', 'corp', 'inc', 'llc']
    for company_name, symbol in mappings.items():
        for suffix in suffixes:
            company_name = company_name.replace(suffix, '').strip()
        if company_name in title:
            return symbol
    return None
