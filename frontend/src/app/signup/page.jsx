"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User as UserIcon, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function SignupPage() {
  const { registerUser, verifyOtp, googleLogin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: ''
  });
  const [otp, setOtp] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await registerUser(formData.name, formData.email, formData.password, formData.mobileNumber);
      setSuccessMessage('Registration successful! Please check your email for the OTP.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await verifyOtp(formData.email, otp);
      router.push('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      router.push('/admin');
    } catch (err) {
      setError('Google signup failed.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')] bg-cover bg-center opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 via-neutral-950/80 to-neutral-950 pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-4xl font-bold tracking-tight text-white">
          {step === 1 ? 'Create an account' : 'Verify your email'}
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-500">
          {step === 1 ? 'Join SeminarPilot to automate your workflows' : 'We sent a 6-digit code to your email'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10">
        <div className="bg-neutral-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl border border-white/10 sm:rounded-3xl sm:px-10">
          
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {successMessage}
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-5" onSubmit={handleSignup}>
              <div>
                <label className="block text-sm font-medium text-neutral-300">Full Name</label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <UserIcon size={18} />
                  </div>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300">Email address</label>
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
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300">Mobile Number (Optional)</label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Phone size={18} />
                  </div>
                  <input
                    name="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300">Password</label>
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-black shadow-lg hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>Sign Up <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-sm font-medium text-neutral-300 text-center mb-4">
                  Enter OTP sent to {formData.email}
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <ShieldCheck size={18} />
                  </div>
                  <input
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="block w-full text-center tracking-[0.5em] pl-10 pr-3 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-lg font-bold"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  'Verify Account'
                )}
              </button>
            </form>
          )}

          {step === 1 && (
            <>
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
                Already have an account?{' '}
                <a href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Sign in
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
