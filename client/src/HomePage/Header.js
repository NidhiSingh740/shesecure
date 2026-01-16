import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./style/Header.css";

// --- AUTH HELPERS ---
const getAuthToken = () => localStorage.getItem('token');
const clearAuthToken = () => { localStorage.removeItem('token'); };

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    clearAuthToken();
    setIsLoggedIn(false);
    navigate("/");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      {/* LEFT: Logo */}
      <Link to="/" className="logo" onClick={closeMenu}>SheSecure</Link>

      <div className="header-right">
        
        {/* NAVIGATION LINKS - The Dynamic Menu */}
        <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" onClick={closeMenu} className={location.pathname === '/dashboard' ? 'nav-item-active' : ''}>Dashboard</Link>
              <Link to="/community-map" onClick={closeMenu} className={location.pathname === '/community-map' ? 'nav-item-active' : ''}>Community Map</Link>
              <Link to="/contacts" onClick={closeMenu} className={location.pathname === '/contacts' ? 'nav-item-active' : ''}>Contacts</Link>
            </>
          ) : (
            <>
              <Link to="/#Challenges" onClick={closeMenu}>Challenges</Link>
              <Link to="/#Solution" onClick={closeMenu}>Solution</Link>
              <Link to="/#howitworks" onClick={closeMenu}>How It Works</Link>
            </>
          )}
        </nav>

        {/* ACTION GROUP: Hamburger + Button */}
        <div className="action-group">
          
          {/* HAMBURGER ICON */}
          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={menuOpen ? "bar open" : "bar"}></span>
            <span className={menuOpen ? "bar open" : "bar"}></span>
            <span className={menuOpen ? "bar open" : "bar"}></span>
          </div>

          {/* ACTION BUTTON */}
          <div className="auth-button-container">
            {isLoggedIn ? (
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            ) : (
              <Link className="btn-primary" to="/signup" onClick={closeMenu}>Get Started</Link>
            )}
          </div>

        </div>
      </div>
      
      {/* Background Overlay to click-away */}
      {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </header>
  );
};

export default Header;