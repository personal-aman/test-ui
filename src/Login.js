import React from 'react';
import './Login.css';

const Login = () => {
    const handleLogin = () => {
        // Implement login functionality
        console.log('Logged in');
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Username" required />
                <input type="password" placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;