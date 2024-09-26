// src/LoginPage/LoginPage.js
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import './LoginPage.css';
import image from './image.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from "react-router-dom";
import Navbar from '../Navbar/navbar';
import Footer from '../Footer/footer';
import { AuthContext } from '../Authentication/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const navigate = useNavigate();
    const { isAuthenticated, login } = useContext(AuthContext);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/success'); // Or any other route you want to redirect to
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', { email, password });
            if (response.data) {
                const { email, profilePicture ,name} = response.data; // Extract email and other data
                const userData = {
                    name:name,
                    email: email,
                    profilePicture: profilePicture // Use profile picture if available
                };
                login(userData, rememberMe); // Pass user data to context
                navigate('/success'); // Navigate to success page
            }
        } catch (error) {
            if (error.response) {
                // Handle different error responses from Flask
                if (error.response.status === 401) {
                    setError('Invalid password');
                } else if (error.response.status === 404) {
                    setError('User not found');
                } else {
                    setError('An error occurred');
                }
            } else {
                setError('An error occurred');
            }
        }
    };


    return (
        <div className="login-page">
            <Navbar />
            <div className="login-container">
                <div className="login-content">
                    <div className="login-left">
                        <img src={image} alt="Character and Stats" className="login-image" />
                    </div>
                    <div className="login-right">
                        <h2>Welcome to StockSense! 👋</h2>
                        <p>Please sign in to your account and start the adventure</p>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="error-text">{error}</p>}
                            <div className="actions">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    Remember me
                                </label>
                                <a href="#">Forgot password?</a>
                            </div>
                            <button type="submit" className="login-button">Log In</button>
                        </form>
                        <div className="divider-container">
                            <div className="divider"></div>
                            <span className="divider-text">or</span>
                            <div className="divider"></div>
                        </div>
                        <div className="signup-link">
                            <p>New on our platform? <a href="/signup">Create an account</a></p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
