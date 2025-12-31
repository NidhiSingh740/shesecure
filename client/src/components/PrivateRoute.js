// client/src/components/PrivateRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Check for the authentication token in local storage.
  const isAuthenticated = localStorage.getItem('token');

  // If the token exists, the user is logged in. Allow them to see the page.
  if (isAuthenticated) {
    return children;
  }

  // If there is no token, redirect the user to the login page.
  return <Navigate to="/login" />;
};

export default PrivateRoute;

