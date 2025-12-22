import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

// --- AUTH HELPERS ---
const getAuthToken = () => localStorage.getItem('token');
const clearAuthToken = () => { localStorage.removeItem('token'); };

const HeaderStyles = () => (
  <style>{`
      .header { display: flex; justify-content: space-between; align-items: center; padding: 10px 30px; background-color: white; font-family: 'Arial', sans-serif; position: fixed; top: 0; left: 0; width: 100%; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.1); box-sizing: border-box; }
      .header .logo { font-size: 1.8rem; font-weight: bold; cursor: pointer; color: #333; text-decoration: none; }
      .header .header-right { display: flex; align-items: center; gap: 30px; }
      .nav-links { display: flex; gap: 20px; align-items: center; }
      .nav-links a { color: #555; text-decoration: none; font-size: 1rem; font-weight: 500; transition: color 0.2s; }
      .nav-links a:hover { color: #b8369a; }
      .nav-item-active { color: #b8369a !important; font-weight: 700 !important; }
      .btn-primary { background-color: #7C4DFF; color: white; padding: 8px 20px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; text-decoration: none; }
      .btn-logout { background-color: #ffe3e3; color: #dc3545; padding: 8px 20px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
    `}</style>
);

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    clearAuthToken();
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <>
      <HeaderStyles />
      <header className="header">
        <Link to="/" className="logo">SheSecure</Link>
        <div className="header-right">
          <nav className="nav-links">
            {isLoggedIn ? (
                <>
                    <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'nav-item-active' : ''}>Dashboard</Link>
                    {/* NEW LINKS */}
                    <Link to="/community-map" className={location.pathname === '/community-map' ? 'nav-item-active' : ''}>Community Map</Link>
                    <Link to="/contacts" className={location.pathname === '/contacts' ? 'nav-item-active' : ''}>Contacts</Link>
                </>
            ) : (
                <>
                    <a href="/#features">Features</a>
                    <a href="/#howitworks">How It Works</a>
                </>
            )}
          </nav>
          <div className="get-started">
            {isLoggedIn ? (
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            ) : (
              <Link className="btn-primary" to="/signup">Get Started</Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
export default Header;