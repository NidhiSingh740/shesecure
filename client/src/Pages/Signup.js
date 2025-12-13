import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// --- Styles (Embedded for simplicity) ---
const SignupStyles = () => (
    <style>
        {`
          /* --- Authentication Page Styles --- */
         .auth-container {
  display: flex;
  justify-content: right;
  align-items: flex-start;   /* keeps it near the top instead of perfectly centered */
  padding: 2rem 1rem;        /* adjust padding to control top space */
  min-height: auto;          /* remove full screen height */
  height: auto;              /* let it shrink naturally */
}

.auth-form-wrapper {
  background: #ffffff;
  padding: 0.5rem 2rem;      /* reduced padding inside the box */
  border-radius: 18px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  width: 50%;
  max-width: 380px;
  text-align: center;
  margin-top: 60px;  
   margin-right: 12%; 
  /* distance from navbar */
}

          .auth-form-wrapper h2 { font-size: 2rem; color: #333; margin-bottom: 0.5rem; font-weight: 700; }
          .auth-subtext { color: #666; margin-bottom: 2rem; }
          .error-message { color: #e74c3c; background-color: #fbecec; border: 1px solid #e74c3c; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; text-align: left; }
          .auth-form { display: flex; flex-direction: column; gap: 1.25rem; text-align: left; }
          .input-group { display: flex; flex-direction: column; }
          .input-group label { font-weight: 600; color: #444; margin-bottom: 0.5rem; }
          .input-group input { padding: 0.6rem 1rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
          .input-group input:focus { outline: none; border-color: #b8369a; box-shadow: 0 0 0 3px rgba(184, 54, 154, 0.15); }
          .auth-button { background: linear-gradient(90deg, #b8369a, #d54ca0); color: white; border: none; padding: 0.6rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; }
          .auth-switch { margin-top: 1.5rem; color: #555; }
          .auth-switch a { color: #b8369a; font-weight: 600; text-decoration: none; }
        `}
    </style>
);

const Signup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!fullName || !email || !password) {
            setError('All fields are required.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            // FIX: The request body is now simpler, with no 'role' field.
            const response = await axios.post('172.18.24.204:5000/api/auth/signup', {
                fullName,
                email,
                password,
            });
            
            // Show a success alert and navigate immediately.
            alert(response.data.msg); // Shows "Registration successful! Please login."
            navigate('/login');

        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred. Please try again.');
        }
    };

    return (
        <>
            <SignupStyles />
            <div className="auth-container">
                <div className="auth-form-wrapper">
                    <h2>Create Your Account</h2>
                    <p className="auth-subtext">Join us and get started.</p>
                    
                    {error && <p className="error-message">{error}</p>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g., Nidhi Sharma"
                                required
                            />
                        </div>
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
                                placeholder="Minimum 6 characters"
                                required
                            />
                        </div>
                        
                        <button type="submit" className="auth-button">Sign Up</button>
                    </form>

                    <p className="auth-switch">
                        Already have an account? <Link to="/login">Log In</Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Signup;

