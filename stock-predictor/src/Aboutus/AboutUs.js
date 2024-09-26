import React from 'react';
import './AboutUs.css'; // Assuming you have a separate CSS file for styling
import Navbar from '../Navbar/navbar';
import Footer from '../Footer/footer';

const AboutUs = () => {
    return (
        <div>
            <Navbar />
            <div className="about-us-container">
                <header className="about-us-header">
                    <h1>Welcome to StockSense</h1>
                    <p>Your partner in smart investing</p>
                </header>
                <section className="about-us-content">
                    <h2>Our Story</h2>
                    <p>
                        StockSense was founded by Krish Patel with a vision to transform the way individuals and businesses approach stock market investments. With a background in software engineering and a passion for finance, Krish and the team are dedicated to developing innovative solutions that simplify the complexities of stock market analysis.
                    </p>
                    <h2>Meet the Team</h2>
                    <div className="team-member">
                        <h3>Krish Patel</h3>
                        <p>Founder & CEO</p>
                        <p>Email: <a href="mailto:krishpatel8071@gmail.com">krishpatel8071@gmail.com</a></p>
                        <p>Phone: +91 7778071999</p>
                        <p>
                            <a href="https://www.linkedin.com/in/thekrishpatel" target="_blank" rel="noopener noreferrer">LinkedIn</a> |
                            <a href="https://github.com/thekrishpatel" target="_blank" rel="noopener noreferrer">GitHub</a>
                        </p>
                    </div>
                    <h2>What We Offer</h2>
                    <ul>
                        <li><strong>Predictive Analytics:</strong> Get precise predictions on stock prices based on the latest market data and trends.</li>
                        <li><strong>User-Friendly Interface:</strong> Easily navigate our platform to access real-time stock information and forecasts.</li>
                        <li><strong>Comprehensive Insights:</strong> Make informed decisions with detailed reports and data visualizations.</li>
                    </ul>
                </section>
                <footer className="about-us-footer">
                    <h2>Get in Touch</h2>
                    <p>
                        We’re here to assist you. If you have any questions or feedback, feel free to reach out to us:
                    </p>
                    <p>Email: <a href="mailto:krishpatel8071@gmail.com">krishpatel8071@gmail.com</a></p>
                    <p>Phone: +91 7778071999</p>
                    <p>
                        Website: <a href="https://sites.google.com/view/thekrishpatel" target="_blank" rel="noopener noreferrer">www.krishpatel.com</a>
                    </p>
                    <p>
                        Follow us:
                        <a href="https://www.linkedin.com/in/thekrishpatel" target="_blank" rel="noopener noreferrer">LinkedIn</a> |
                        <a href="https://github.com/thekrishpatel" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </p>
                </footer>
            </div>
            <Footer />
        </div>
    );
};

export default AboutUs;
