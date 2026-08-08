"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '@/services/apiService';
import Cookies from 'js-cookie';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in cookies on mount
    const token = Cookies.get('token');
    const savedUser = Cookies.get('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // We could optionally fetch fresh user data from API here
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setLoading(false);
  }, []);

  const setAuth = (token, userData) => {
    Cookies.set('token', token, { expires: 7 }); // 7 days
    Cookies.set('user', JSON.stringify(userData), { expires: 7 });
    setUser(userData);
  };

  const login = async (email, password) => {
    const res = await apiService.login({ email, password });
    if (res.success && res.token) {
      setAuth(res.token, res.user);
    }
    return res;
  };

  const registerUser = async (name, email, password) => {
    const res = await apiService.register({ name, email, password });
    if (res.success && res.token) {
      setAuth(res.token, res.user);
    }
    return res;
  };

  const googleLogin = async (credential) => {
    const res = await apiService.googleLogin({ token: credential });
    if (res.success && res.token) {
      setAuth(res.token, res.user);
    }
    return res;
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, registerUser, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
