import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Assuming your main App.css is in the src folder
import './App.css'; 

// CORRECTED: The import paths have been updated to match your project structure.
import Header from './HomePage/Header';
import Footer from './HomePage/Footer';
import Herosection from './HomePage/Herosection';
import Challenges from './HomePage/Challenges';
import Solution from './HomePage/Solution';
import HowItWorks from './HomePage/HowItWorks';
import CTA from './HomePage/CTA';
import Signup from './Pages/Signup';
import Login from './Pages/Login';

// This component groups all the sections of your main landing page
const LandingPage = () => (
  <>
    <Herosection />
    <Challenges />
    <Solution />
    <HowItWorks />
    <CTA />
  </>
);

// A placeholder for the page users see after a successful login
const Dashboard = () => (
    <div style={{ textAlign: 'center', padding: '5rem', minHeight: '60vh' }}>
        <h1>Welcome to Your Dashboard</h1>
        <p>You have successfully logged in!</p>
    </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

