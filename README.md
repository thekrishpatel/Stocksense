
# Stock Predictor

Stock Predictor is a web-based application that allows users to predict stock prices, analyze market trends, and view related news articles. It is built using a combination of frontend and backend technologies, including React for the frontend and Python for the backend.

## Project Structure

```
/stock-predictor
│
├── Backend/
│   ├── app.py
│   ├── db_operations.py
│   ├── news_analysis.py
│   ├── routes.py
│   ├── stock_analysis.py
│   ├── utils.py
│   └── __pycache__/
│
├── public/
│   ├── full_company_names.csv
│   ├── images/
│   └── logo.png
│
├── src/
│   ├── Aboutus/
│   ├── Authentication/
│   ├── components/
│   ├── Dashboard/
│   ├── Footer/
│   ├── Home_content/
│   ├── Login/
│   ├── Navbar/
│   ├── PredictPage/
│   ├── PredictStocksPage/
│   ├── StockInfoPage/
│   └── index.js
│
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org/) installed on your machine.
- [Python 3.12](https://www.python.org/downloads/) installed for the backend.
- [pip](https://pip.pypa.io/en/stable/) for installing Python packages.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/stock-predictor.git
   ```

2. Navigate to the project directory:

   ```bash
   cd stock-predictor
   ```

3. Install the Node.js dependencies:

   ```bash
   npm install
   ```

4. Navigate to the backend directory and install the Python dependencies:

   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

## Usage

### Running the Backend

1. Navigate to the backend directory:

   ```bash
   cd Backend
   ```

2. Run the backend server:

   ```bash
   python app.py
   ```

The backend will start running at `http://localhost:5000`.

### Running the Frontend

1. In a separate terminal, navigate back to the project root:

   ```bash
   cd ../
   ```

2. Start the React frontend:

   ```bash
   npm start
   ```

The frontend will be running at `http://localhost:3000`.

## Features

- Stock price prediction
- News analysis related to stocks
- Interactive user interface with prediction results
- Authentication system with login and signup

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://www.apache.org/licenses/LICENSE-2.0) file for details.

```
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
