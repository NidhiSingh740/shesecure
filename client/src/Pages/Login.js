import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// --- Styles (Can be moved to a separate CSS file) ---
const LoginStyles = () => (
    <style>
        {`
          /* Using the same auth styles as Signup */
          .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f8f9fa; padding: 2rem; }
          .auth-form-wrapper { background: #ffffff; padding: 3rem; border-radius: 12px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08); width: 100%; max-width: 450px; text-align: center; }
          .auth-form-wrapper h2 { font-size: 2rem; color: #333; margin-bottom: 0.5rem; font-weight: 700; }
          .auth-subtext { color: #666; margin-bottom: 2rem; }
          .error-message { color: #e74c3c; background-color: #fbecec; border: 1px solid #e74c3c; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; text-align: left; }
          .auth-form { display: flex; flex-direction: column; gap: 1.25rem; text-align: left; }
          .input-group { display: flex; flex-direction: column; }
          .input-group label { font-weight: 600; color: #444; margin-bottom: 0.5rem; }
          .input-group input { padding: 0.8rem 1rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
          .input-group input:focus { outline: none; border-color: #b8369a; box-shadow: 0 0 0 3px rgba(184, 54, 154, 0.15); }
          .auth-button { background: linear-gradient(90deg, #b8369a, #d54ca0); color: white; border: none; padding: 0.9rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; }
          .auth-switch { margin-top: 1.5rem; color: #555; }
          .auth-switch a { color: #b8369a; font-weight: 600; text-decoration: none; }
        `}
    </style>
);

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            });

            // FIX: Add the success alert message upon successful login.
            alert(response.data.msg); // Shows "Login successful!"

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.role);

            // FIX: Simplified redirection. Since everyone is a 'customer',
            // we can just redirect to one place.
            navigate('/customer/dashboard'); // Or navigate('/') to go to the homepage.

        } catch (err) {
            // This provides specific error messages like "Invalid credentials".
            setError(err.response?.data?.msg || 'An unknown error occurred. Please try again.');
        }
    };

    return (
        <>
            <LoginStyles />
            <div className="auth-container">
                <div className="auth-form-wrapper">
                    <h2>Welcome Back!</h2>
                    <p className="auth-subtext">Log in to access your account.</p>

                    {error && <p className="error-message">{error}</p>}
                    
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your password"
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button">Log In</button>
                    </form>

                    <p className="auth-switch">
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Login;

