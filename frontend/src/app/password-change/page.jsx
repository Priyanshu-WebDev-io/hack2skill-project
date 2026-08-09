"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function PasswordChangeForm() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!token) {
      setError('Invalid or missing reset token.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(token, newPassword);
      setSuccessMessage('Password changed successfully! Redirecting...');
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="text-center">
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {successMessage}
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-neutral-300">
          New Password
        </label>
        <div className="mt-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
            <Lock size={18} />
          </div>
          <input
            type="password"
            required
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300">
          Confirm New Password
        </label>
        <div className="mt-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
            <Lock size={18} />
          </div>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm"
            placeholder="••••••••"
          />
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-black shadow-lg hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              Change Password
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function PasswordChangePage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')] bg-cover bg-center opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 via-neutral-950/80 to-neutral-950 pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-4xl font-bold tracking-tight text-white">
          Secure Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-500">
          Enter a strong new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10">
        <div className="bg-neutral-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl border border-white/10 sm:rounded-3xl sm:px-10">
          <Suspense fallback={<div className="flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>}>
            <PasswordChangeForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
