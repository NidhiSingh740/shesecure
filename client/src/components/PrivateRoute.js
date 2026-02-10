// client/src/components/PrivateRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or return null, or a spinner
  }

  // If the token exists, the user is logged in. Allow them to see the page.
  if (isLoggedIn) {
    return children;
  }

  // If there is no token, redirect the user to the login page.
  return <Navigate to="/login" />;
};

export default PrivateRoute;

