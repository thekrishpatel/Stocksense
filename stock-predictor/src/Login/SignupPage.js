import React, { useState, useEffect } from 'react';
import './SignupPage.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import image from './image.png'; // Adjust the path to where your image is located
import logo from '../Home_content/logo.png';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Navbar from '../Navbar/navbar';
import Footer from '../Footer/footer';

const Signup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [hasVisited, setHasVisited] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const visited = localStorage.getItem('hasVisitedSignupPage');
        if (!visited) {
            setHasVisited(true);
            localStorage.setItem('hasVisitedSignupPage', 'true');
        }
    }, []);

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState({ password: false, confirmPassword: false });

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return re.test(password);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let validationErrors = {};
        if (!validateEmail(formData.email)) validationErrors.email = 'Invalid email address';
        if (!validatePassword(formData.password)) validationErrors.password = 'Password must be at least 8 characters long, including one uppercase letter, one lowercase letter, one number, and one special character';
        if (formData.password !== formData.confirmPassword) validationErrors.confirmPassword = 'Passwords do not match';

        if (Object.keys(validationErrors).length === 0) {
            try {
                const response = await axios.post('http://localhost:5000/submit-form', formData);
                if (response.data.error) {
                    alert(response.data.error);
                }
                if (response.data.redirect_url) {
                    window.location.href = response.data.redirect_url;
                } else {
                    navigate('/editprofile')
                }
            } catch (error) {
                console.error('Error submitting form:', error);
            }
        } else {
            setErrors(validationErrors);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword({
            ...showPassword,
            [field]: !showPassword[field]
        });
    };

    return (
        <div className={hasVisited ? 'signup-page' : 'signup-page page-animation'}>
            <Navbar />
            <div className="signup-container">
                <div className="signup-content">
                    <div className="signup-left">
                        <img src={image} alt="Character and Stats" className="signup-image" />
                    </div>
                    <div className="signup-right">
                        <h2>Welcome to StockSense! 👋</h2>
                        <p>Please sign up to your account and start the adventure</p>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="firstName">First Name</label>
                                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                                {errors.email && <p className="error-text">{errors.email}</p>}
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <div className="password-container">
                                    <input
                                        type={showPassword.password ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => togglePasswordVisibility('password')}
                                    >
                                        <i className={`fas ${showPassword.password ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {errors.password && <p className="error-text">{errors.password}</p>}
                            </div>
                            <div className="input-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="password-container">
                                    <input
                                        type={showPassword.confirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => togglePasswordVisibility('confirmPassword')}
                                    >
                                        <i className={`fas ${showPassword.confirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                            </div>
                            <button type="submit" className="signup-button">Sign Up</button>
                        </form>
                        <div className="divider-container">
                            <div className="divider"></div>
                            <span className="divider-text">or</span>
                            <div className="divider"></div>
                        </div>
                        <div className="login-prompt">
                            <p>Already have an account? <a href="/login" className="login-link">Log In</a></p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Signup;
