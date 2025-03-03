import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear user session (if any)
        // For now, just navigate back to the login page
        navigate('/');
    };

    return (
        <div>
            <div>
                <h1>Home Page</h1>
            </div>
            <p>Welcome to the home page!</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default HomePage;