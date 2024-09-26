// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home_content/Home';
import PredictPage from './PredictPage/PredictPage';
import PredictStocksPage from './PredictStocksPage/PredictStocksPage';
import Signup from './Login/SignupPage';
import Login from './Login/LoginPage';
import Success from './Login/success';
import StockInfoPage from './StockInfoPage/StockInfoPage';
import AboutUs from './Aboutus/AboutUs';
import PrivateRoute from './Authentication/PrivateRoute';
import { AuthProvider } from './Authentication/AuthContext'; // Import AuthProvider
import EditProfile from './EditProfile';
import Dashboard from './Dashboard/dashboard';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/predict" element={<PredictPage />} />
            <Route path="/predict_stocks" element={<PredictStocksPage />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/success" element={<Success />} />
            <Route path="/stock-info/:stockSymbol" element={<StockInfoPage />} />
            <Route path='/editprofile' element={<EditProfile />} />
            <Route path='/profile' element={<Dashboard />} />
            <Route path='/dashboard' element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
