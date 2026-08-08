"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function VerifyPage({ params }) {
  const router = useRouter();
  const { verifyEmail } = useAuth();
  const unwrappedParams = use(params);
  const token = unwrappedParams.token;
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const res = await verifyEmail(token);
        if (res.success) {
          setStatus('success');
          setMessage(res.message);
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push(res.user.role === 'admin' ? '/admin' : '/user/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(res.message || 'Verification failed');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may be expired.');
      }
    };

    verify();
  }, [token, verifyEmail, router]);

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-indigo-500/30">
      <Navbar onAuthClick={() => router.push('/')} />
      
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Email...</h2>
              <p className="text-neutral-400">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-neutral-400 mb-6">{message}</p>
              <p className="text-sm text-neutral-500">Redirecting you automatically...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center">
                  <XCircle size={32} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-neutral-400 mb-6">{message}</p>
              <button 
                onClick={() => router.push('/')}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
              >
                Return Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
