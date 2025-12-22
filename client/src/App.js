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
import TrackTripPage from './Pages/TrackTripPage';

// --- NEW IMPORTS ---
import CommunityMap from './Pages/CommunityMap'; // Step 6 Feature
import PrivateRoute from './components/PrivateRoute';
import NotificationListener from './components/NotificationListener'; // Critical for SOS

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
        
        {/* Global Listener: This ensures SOS alerts pop up on ANY page */}
        <NotificationListener />

        <main>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            
            {/* Public Tracking Link */}
            <Route path="/track/:tripId" element={<TrackTripPage />} />

            {/* --- Protected Routes --- */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/contacts" 
              element={
                <PrivateRoute>
                  <ManageContacts />
                </PrivateRoute>
              } 
            />
             {/* New Community Map Route */}
            <Route 
              path="/community-map" 
              element={
                <PrivateRoute>
                  <CommunityMap />
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