"use client";

import { useState } from 'react';
import { Sparkles, Calendar, Clock, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import apiService from '@/services/apiService';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    whatsappNumber: '',
    currentOccupation: '',
    highestQualification: '',
  });
  
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    
    try {
      await apiService.registerParticipant({
        ...formData,
        amount: 500, // example amount
        seminarId: process.env.NEXT_PUBLIC_DEFAULT_SEMINAR_ID,
      });
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.response?.data?.message || err.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary-500/30">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background pointer-events-none" />
      
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Side: Copy */}
        <div className="flex-1 space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium">
            <Sparkles size={16} />
            <span>Upcoming Masterclass</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
            Elevate Your <br className="hidden lg:block"/> Career Trajectory.
          </h1>
          
          <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
            Join our exclusive seminar to learn advanced tech skills, industry insights, and network with leading professionals. 
            Limited seats available.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-6 pt-4">
            {[
              { icon: Calendar, text: "October 15, 2026" },
              { icon: Clock, text: "10:00 AM - 02:00 PM" },
              { icon: MapPin, text: "Tech Hub, Virtual" },
              { icon: Sparkles, text: "Certificate Included" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-text-secondary">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-primary-400">
                  <item.icon size={20} />
                </div>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full max-w-md z-10">
          <div className="bg-surface/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
            {/* Subtle gradient hover effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            {status === 'success' ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-success-500/20 text-success-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary">Registration Complete!</h3>
                <p className="text-text-secondary">We've received your details. Check your email for the invite link.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-primary font-medium transition-colors border border-white/10"
                >
                  Register Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="space-y-1 mb-6">
                  <h3 className="text-2xl font-bold text-text-primary">Reserve Your Seat</h3>
                  <p className="text-sm text-text-secondary">Fill in your details below.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Full Name</label>
                    <input required name="name" value={formData.name} onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-text-primary placeholder-text-tertiary" placeholder="John Doe" />
                  </div>
                  
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-text-primary placeholder-text-tertiary" placeholder="john@example.com" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Mobile</label>
                    <input required name="mobileNumber" value={formData.mobileNumber} onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-text-primary placeholder-text-tertiary" placeholder="10-digit number" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Occupation</label>
                    <input required name="currentOccupation" value={formData.currentOccupation} onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-text-primary placeholder-text-tertiary" placeholder="Student, Engineer..." />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-400 text-sm">
                    {errorMsg}
                  </div>
                )}

                <button 
                  disabled={status === 'loading'}
                  type="submit" 
                  className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 mt-4 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Pay ₹500 & Register</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
