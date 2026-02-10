import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // Hydrate from localStorage
        const storedUser = localStorage.getItem('student_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
        setAuthLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('student_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('student_user');
        // Optional: Call API logout endpoint if needed, but for now we clear client state
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, authLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
