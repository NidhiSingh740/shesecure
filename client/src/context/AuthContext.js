import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuthToken, saveAuthToken, clearAuthToken } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getAuthToken();
        setIsLoggedIn(!!token);
        setLoading(false);
    }, []);

    const login = (token) => {
        saveAuthToken(token);
        setIsLoggedIn(true);
    };

    const logout = () => {
        clearAuthToken();
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
