import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';
import { useAccessibility } from './AccessibilityContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { syncPreferencesFromServer, announce } = useAccessibility();

  // Load authenticated user on app boot if token exists
  useEffect(() => {
    const loadSession = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getMe();
        if (response.success) {
          setUser(response.user);
          if (response.preferences) {
            syncPreferencesFromServer(response.preferences);
          }
        }
      } catch (err) {
        console.warn('Session expired or invalid, clearing credentials.');
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (email, password) => {
    const response = await api.login({ email, password });
    if (response.success) {
      setAuthToken(response.token);
      setUser(response.user);
      if (response.preferences) {
        syncPreferencesFromServer(response.preferences);
      }
      announce(`Logged in successfully as ${response.user.fullName}`);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await api.register(userData);
    if (response.success) {
      setAuthToken(response.token);
      setUser(response.user);
      announce(`Welcome to CareConnect, ${response.user.fullName}!`);
    }
    return response;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    announce('You have been logged out.');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

