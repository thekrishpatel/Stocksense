import React, { useEffect } from 'react';
import './Footer.css'; // Adjust the path as needed
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'aos/dist/aos.css';
import AOS from 'aos';

const Footer = () => {
    useEffect(() => {
        // Check if the animations have already been shown
        const animationsShown = localStorage.getItem('animationsShown');
        if (!animationsShown) {
            // Initialize AOS if not shown before
            AOS.init({
                duration: 1000, // Animation duration in milliseconds
                once: true, // Whether animation should happen only once - while scrolling down
            });

            // Mark animations as shown
            localStorage.setItem('animationsShown', 'true');
        } else {
            // If animations have already been shown, you might need to reinitialize AOS
            AOS.refresh();
        }
    }, []);

    return (
        <footer className="footer-unique">
            <div className="footer-container-unique" data-aos="fade-up">
                <div className="social-icons-unique" data-aos="fade-right">
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-facebook"></i>
                    </a>
                    <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-youtube"></i>
                    </a>
                    <a href="mailto:contact@StockSense.com">
                        <i className="fas fa-envelope"></i>
                    </a>
                    <a href="tel:+1234567890">
                        <i className="fas fa-phone"></i>
                    </a>
                </div>
                <div className="footer-links-unique" data-aos="fade-left">
                    <a href="/">Home</a>
                    <a href="/predict">Predict</a>
                    <a href="/predict_stocks">Recommendation</a>
                    <a href="/aboutus">About Us</a>
                    <a href="/login">Login</a>
                    <a href="/signup">Signup</a>
                </div>
                <div className="footer-info-unique" data-aos="fade-up">
                    <p>&copy; 2024 StockSense. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
