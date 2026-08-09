"use client";

import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const res = await forgotPassword(email);
      setSuccessMessage(res.message || 'If an account with that email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')] bg-cover bg-center opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 via-neutral-950/80 to-neutral-950 pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-4xl font-bold tracking-tight text-white">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-500">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10">
        <div className="bg-neutral-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl border border-white/10 sm:rounded-3xl sm:px-10">
          
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {successMessage ? (
            <div className="text-center">
              <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {successMessage}
              </div>
              <a href="/login" className="inline-block mt-4 font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                Return to Login
              </a>
            </div>
          ) : (
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
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-black shadow-lg hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-neutral-400">
                Remember your password?{' '}
                <a href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Log in
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
