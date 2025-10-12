import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Your existing page and component imports
import Header from './HomePage/Header';
import Footer from './HomePage/Footer';
import Herosection from './HomePage/Herosection';
import Challenges from './HomePage/Challenges';
import Solution from './HomePage/Solution';
import HowItWorks from './HomePage/HowItWorks';
import CTA from './HomePage/CTA';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Logout from './Pages/Logout';
import Dashboard from './Pages/Dashboard';
import ManageContacts from './Pages/ManageContacts';
// Import the security component
import PrivateRoute from './components/PrivateRoute';

const LandingPage = () => (
  <>
    <Herosection />
    <Challenges />
    <Solution />
    <HowItWorks />
    <CTA />
  </>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            
                                                                                                   {/* --- Protected Routes --- */}
            <Route 
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            {/* Corrected the syntax error by removing the invalid comment */}
            <Route 
              path="/contacts"
              element={
                <PrivateRoute>
                  <ManageContacts />
                </PrivateRoute>
              } 
            />
            
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

