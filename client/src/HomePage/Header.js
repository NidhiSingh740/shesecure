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
    <>
      <header className="header">
        {/* LEFT: Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>SheSecure</Link>

        <div className="header-right">

          {/* NAVIGATION LINKS - Desktop Normal */}
          <nav className="nav-links">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard"
                  className={location.pathname === '/dashboard' ? 'nav-item-active' : ''}>
                  Dashboard
                </Link>
                <Link to="/community-map"
                  className={location.pathname === '/community-map' ? 'nav-item-active' : ''}>
                  Community Map
                </Link>
                <Link to="/contacts"
                  className={location.pathname === '/contacts' ? 'nav-item-active' : ''}>
                  Contacts
                </Link>
              </>
            ) : (
              <>
                <Link to="/#Challenges">Challenges</Link>
                <Link to="/#Solution">Solution</Link>
                <Link to="/#howitworks">How It Works</Link>
              </>
            )}
          </nav>

          {/* ACTION GROUP */}
          <div className="action-group">

            {/* HAMBURGER ICON */}
            <div className="hamburger" onClick={() => setMenuOpen(true)}>
              <span></span>
              <span></span>
              <span></span>
            </div>

            {/* ACTION BUTTON */}
            <div className="auth-button-container">
              {isLoggedIn ? (
                <button className="btn-logout" onClick={handleLogout}>Logout</button>
              ) : (
                <Link className="btn-primary" to="/signup">Get Started</Link>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR ONLY */}
      
      {/* MOBILE SIDEBAR ONLY */}
<div className={`mobile-sidebar ${menuOpen ? "active" : ""}`}>
  <div className="sidebar-header">
    <span className="close-btn" onClick={closeMenu}>✕</span>
  </div>

  <div className="sidebar-links">
    {isLoggedIn ? (
      <>
        <Link
          to="/dashboard"
          onClick={closeMenu}
          className={location.pathname === "/dashboard" ? "active-link" : ""}
        >
          Dashboard
        </Link>

        <Link
          to="/community-map"
          onClick={closeMenu}
          className={location.pathname === "/community-map" ? "active-link" : ""}
        >
          Community Map
        </Link>

        <Link
          to="/contacts"
          onClick={closeMenu}
          className={location.pathname === "/contacts" ? "active-link" : ""}
        >
          Contacts
        </Link>
      </>
    ) : (
      <>
        <Link to="/#Challenges" onClick={closeMenu}>
          Challenges
        </Link>

        <Link to="/#Solution" onClick={closeMenu}>
          Solution
        </Link>

        <Link to="/#howitworks" onClick={closeMenu}>
          How It Works
        </Link>
      </>
    )}
  </div>
</div>


      {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </>
  );
};

export default Header;
