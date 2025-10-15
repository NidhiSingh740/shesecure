// src/Homepage/Header.js

import React from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, clearAuthToken } from "../utils/auth";

const HeaderStyles = () => (
  <style>
    {`
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 30px;
        background-color: white;
        color: rgb(87, 85, 85);
        font-family: 'Arial', sans-serif;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 100;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        box-sizing: border-box;
      }

      .header .logo {
        font-size: 1.8rem;
        font-weight: bold;
        cursor: pointer;
      }

      .header .header-right {
        display: flex;
        align-items: center;
        gap: 40px;
      }

      .header .nav-links {
        display: flex;
        gap: 30px;
      }

      .header .nav-links a {
        color: rgb(61, 61, 61);
        text-decoration: none;
        font-size: 1rem;
        font-weight: 500;
        transition: color 0.3s ease;
      }

      .header .nav-links a:hover {
        color: #212120;
      }

      .header .get-started .btn-primary,
      .header .get-started .btn-logout {
        background-color: #df2c14;
        color: white;
        padding: 10px 25px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1rem;
        text-decoration: none;
        display: inline-block;
      }

      .header .get-started .btn-primary:hover,
      .header .get-started .btn-logout:hover {
        background-color: #6c40e0;
        box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
      }
    `}
  </style>
);

const Header = () => {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  const handleGetStartedClick = () => {
    navigate("/signup");
  };

  const handleLogout = () => {
    clearAuthToken();
    navigate("/");
    window.location.reload(); // to instantly update button
  };

  return (
    <>
      <HeaderStyles />
      <header className="header">
        <div className="logo" onClick={() => navigate("/")}>
          Shesecure
        </div>
        <div className="header-right">
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#howitworks">How It Works</a>
            <a href="#about">About</a>
          </nav>
          <div className="get-started">
            {loggedIn ? (
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <button className="btn-primary" onClick={handleGetStartedClick}>
                Get Started
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
