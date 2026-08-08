"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import authService from '@/services/authService';
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(savedUser));
        // We could optionally fetch fresh user data from API here
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setLoading(false);
  }, []);

  const setAuth = (token, userData) => {
    const isProd = process.env.NODE_ENV === 'production';
    Cookies.set('token', token, { expires: 7, secure: isProd, sameSite: 'strict' });
    Cookies.set('user', JSON.stringify(userData), { expires: 7, secure: isProd, sameSite: 'strict' });
    setUser(userData);
  };

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.token) {
      setAuth(res.token, res.user);
    }
    return res;
  };

  const registerUser = async (name, email, password, mobileNumber) => {
    const res = await authService.register({ name, email, password, mobileNumber });
    if (res.success && res.token) {
      setAuth(res.token, res.user);
    }
    return res;
  };

  const googleLogin = async (credential) => {
    const res = await authService.googleLogin({ credential });
    if (res.success && res.token) {
      setAuth(res.token, res.user);
    }
    return res;
  };

  const verifyOtp = async (email, otp) => {
    const res = await authService.verifyOtp({ email, otp });
    if (res.success && res.token) {
      setAuth(res.token, res.user);
    }
    return res;
  };

  const resendOtp = async (email) => {
    const res = await authService.resendOtp({ email });
    return res;
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, registerUser, googleLogin, verifyOtp, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
