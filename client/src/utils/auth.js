
// src/utils/auth.js

// Save JWT token after login
export const saveAuthToken = (token) => {
  localStorage.setItem("authToken", token);
};

// Get stored token
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Remove token (used during logout)
export const clearAuthToken = () => {
  localStorage.removeItem("authToken");
};

// Check login status
export const isLoggedIn = () => {
  return !!localStorage.getItem("authToken");
};
