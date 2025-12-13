import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveAuthToken } from "../utils/auth"; // ✅ imported

const LoginStyles = () => (
  <style>
    {`
      .auth-container {
        display: flex;
        justify-content: right;
        align-items: flex-start;
        padding: 2rem 1rem;
        min-height: auto;
        height: auto;
      }

      .auth-form-wrapper {
        background: #ffffff;
        padding: 0.5rem 2rem;
        border-radius: 18px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        width: 50%;
        max-width: 350px;
        text-align: center;
        margin-top: 60px;
        margin-right: 12%;
      }

      .auth-form-wrapper h2 {
        font-size: 2rem;
        color: #333;
        margin-bottom: 0.5rem;
        font-weight: 700;
      }

      .auth-subtext {
        color: #666;
        margin-bottom: 2rem;
      }

      .error-message {
        color: #e74c3c;
        background-color: #fbecec;
        border: 1px solid #e74c3c;
        padding: 0.75rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        text-align: left;
      }

      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        text-align: left;
      }

      .input-group {
        display: flex;
        flex-direction: column;
      }

      .input-group label {
        font-weight: 600;
        color: #444;
        margin-bottom: 0.5rem;
      }

      .input-group input {
        padding: 0.6rem 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
      }

      .input-group input:focus {
        outline: none;
        border-color: #b8369a;
        box-shadow: 0 0 0 3px rgba(184, 54, 154, 0.15);
      }

      .auth-button {
        background: linear-gradient(90deg, #b8369a, #d54ca0);
        color: white;
        border: none;
        padding: 0.6rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 1rem;
      }

      .auth-switch {
        margin-top: 1.5rem;
        color: #555;
      }

      .auth-switch a {
        color: #b8369a;
        font-weight: 600;
        text-decoration: none;
      }
    `}
  </style>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch("http://172.18.24.204:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || "Invalid credentials");
      }

      // ✅ Save token properly
      saveAuthToken(data.token);

      alert("Login successful!");
      navigate("/dashboard");
      window.location.reload(); // instantly update header button
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
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

          <form onSubmit={handleLogin} className="auth-form">
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
            <button type="submit" className="auth-button">
              Log In
            </button>
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
