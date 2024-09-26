import React, { useState, useEffect } from 'react';
import axios from 'axios'; // or any other HTTP client you're using
import useAuth  from './Authentication/useAuth';

const EditProfile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        // Add other fields as needed
    });

    useEffect(() => {
        // Fetch existing user data from the server
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`/api/users/${user.email}`);
                setFormData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (user && user.email) {
            fetchUserData();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/users/${user.email}`, formData);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div>
            <h1>Edit Profile</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled
                    />
                </div>
                <div>
                    <label htmlFor="phone">Phone:</label>
                    <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>
                {/* Add other fields as needed */}
                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
};

export default EditProfile;
