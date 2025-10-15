// src/utils/auth.js

// Save JWT token after login
export const saveAuthToken = (token) => {
  localStorage.setItem("token", token); // unified key
};

// Get stored token
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Remove token (used during logout)
export const clearAuthToken = () => {
  localStorage.removeItem("token");
};

// Check login status
export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};
