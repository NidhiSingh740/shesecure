import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

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
// import Dashboard from './Pages/Dashboard';

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
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
