import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Papa from 'papaparse';
import logo from '../Home_content/logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Navbar.css';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { AuthContext } from '../Authentication/AuthContext';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [companyData, setCompanyData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });

        Papa.parse('/full_company_names.csv', {
            download: true,
            header: true,
            complete: (result) => {
                const data = result.data.map(item => ({
                    symbol: item.Symbol || '',
                    name: item.CompanyName || ''
                }));
                setCompanyData(data);
            },
            error: (error) => console.error('Error parsing CSV:', error),
        });
    }, []);

    const handleLoginRedirect = () => {
        navigate('/signup');
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleSearch = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (searchTerm.trim()) {
                navigate(`/stock-info/${searchTerm.trim()}`);
            }
        }
    };

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);

        if (query) {
            const filteredSuggestions = companyData.filter(item => {
                const symbolMatch = item.symbol && item.symbol.toLowerCase().includes(query.toLowerCase());
                const nameMatch = item.name && item.name.toLowerCase().includes(query.toLowerCase());
                return symbolMatch || nameMatch;
            });
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.symbol);
        setSuggestions([]);
        navigate(`/stock-info/${suggestion.symbol}`);
    };

    const handleLogout = () => {
        logout();
        localStorage.setItem('hasVisitedSuccessPage', 'false');
        navigate('/login');
    };

    return (
        <div className="navbar-container-unique">
            <header className="navbar-unique" data-aos="fade-down">
                <div className="logo-container-unique" onClick={handleLogoClick}>
                    <img src={logo} alt="Logo" className="logo-unique" />
                    <p className="logo-name-unique">StockSense</p>
                </div>
                <nav className="nav-links-unique">
                    <button className="nav-button-unique" onClick={() => handleNavigate('/')}>Home</button>
                    <button className="nav-button-unique" onClick={() => handleNavigate('/predict')}>Predict</button>
                    <button className="nav-button-unique" onClick={() => handleNavigate('/predict_stocks')}>Recommendation</button>
                    <button className="nav-button-unique" onClick={() => handleNavigate('/aboutus')}>About Us</button>
                    <div className="search-container-unique">
                        <i className="fas fa-search search-icon-unique"></i>
                        <input
                            type="text"
                            placeholder="Stock Name or Symbol"
                            className="search-input-unique"
                            value={searchTerm}
                            onChange={handleInputChange}
                            onKeyDown={handleSearch}
                        />
                        {suggestions.length > 0 && (
                            <div className="suggestions-container">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="suggestion-item-unique"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion.symbol} - {suggestion.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {isAuthenticated ? (
                        <>
                            <li className="navbar-profile">
                                <Link to="/profile">
                                    <h3>
                                        {user ? user.name : 'Profile'}
                                    </h3>
                                </Link>
                                {user && (
                                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                                )}
                            </li>
                        </>
                    ) : (
                        <button className="login-btn-unique" onClick={handleLoginRedirect}>
                            Login/Register
                        </button>
                    )}
                </nav>
            </header>
        </div>
    );
};

export default Navbar;
