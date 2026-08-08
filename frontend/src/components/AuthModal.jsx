"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { login, registerUser, googleLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await registerUser(formData.name, formData.email, formData.password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError('Google login failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-neutral-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-sm text-neutral-400 mb-8">
          {isLogin ? 'Sign in to reserve your seat.' : 'Sign up to register for the seminar.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <User size={16} />
                </div>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-indigo-500 text-white placeholder-neutral-600 text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Mail size={16} />
              </div>
              <input
                required
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-indigo-500 text-white placeholder-neutral-600 text-sm"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Lock size={16} />
              </div>
              <input
                required
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-indigo-500 text-white placeholder-neutral-600 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>{isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-neutral-500">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              theme="filled_black"
              shape="pill"
            />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-indigo-400 font-semibold hover:text-indigo-300"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
