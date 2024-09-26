import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import image from './image.png'; // Adjust the path to your image
import './SuccessPage.css'; // Import the CSS file for styling
import Navbar from '../Navbar/navbar';
import Footer from '../Footer/footer';

const Success = () => {
    const navigate = useNavigate(); // Initialize useNavigate hook
    const [hasVisited, setHasVisited] = useState(false);

    useEffect(() => {
        // Check if user has visited the page before
        const visited = localStorage.getItem('hasVisitedSuccessPage');
        if (!visited) {
            setHasVisited(true);
            localStorage.setItem('hasVisitedSuccessPage', 'true');
        }

        // Redirect to the dashboard after 1 second
        const timer = setTimeout(() => {
            navigate('/dashboard'); // Navigate to dashboard
        }, 4000);

        // Cleanup function to clear the timeout if the component unmounts
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className={hasVisited ? '' : 'page-animation'}>
            <Navbar />
            <div className="success-container">
                <div className="success-content">
                    <div className="success-left">
                        <img src={image} alt="Success Illustration" className="success-image" />
                    </div>
                    <div className="success-right">
                        <h2>Logged In Successfully!</h2>
                        <p>Logged in Successfully. You can now access your dashboard and start exploring.</p>
                        <h3 className="redirecttodashboard">
                            Redirecting to Dashboard...
                        </h3>

                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Success;
