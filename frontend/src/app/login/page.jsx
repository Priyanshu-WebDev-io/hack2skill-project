"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(formData.email, formData.password);
      router.push('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      router.push('/admin');
    } catch (err) {
      setError('Google login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')] bg-cover bg-center opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 via-neutral-950/80 to-neutral-950 pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-4xl font-bold tracking-tight text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-500">
          Sign in to your account to access the dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10">
        <div className="bg-neutral-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl border border-white/10 sm:rounded-3xl sm:px-10">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-neutral-300">
                Email address
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="block w-full pl-10 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300">
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="block w-full pl-10 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/10 bg-black/40 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-neutral-900"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-400">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="/forgot-password" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-black shadow-lg hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-neutral-900/50 px-2 text-neutral-500">Or continue with</span>
              </div>
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
          <div className="mt-6 text-center text-sm text-neutral-400">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
