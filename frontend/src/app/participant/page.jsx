"use client";

import { useState } from 'react';
import { Download, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import apiService from '@/services/apiService';

export default function ParticipantDashboard() {
  const [email, setEmail] = useState('');
  const [participant, setParticipant] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // In a real app, you'd use proper auth. For the MVP, we just lookup by email.
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Mocking a login by fetching all participants and finding the matching email
      const data = await apiService.getParticipants();
      const user = data.data?.find(p => p.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        setParticipant(user);
      } else {
        setError('No registration found with this email.');
      }
    } catch (err) {
      setError('Failed to fetch participant details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!participant || participant.attendanceStatus !== 'attended') return;
    
    // Trigger download from backend API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    window.open(`${API_URL}/participants/${participant._id}/certificate`, '_blank');
  };

  if (!participant) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-md p-8 bg-neutral-900 border border-white/10 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Participant Portal</h2>
          <p className="text-neutral-400 text-sm mb-6">Enter your registered email to access your dashboard and certificate.</p>
          
          <input 
            type="email" 
            required 
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white mb-4 focus:border-indigo-500 focus:outline-none"
          />
          
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Accessing...' : 'Access Portal'}
          </button>
        </form>
      </div>
    );
  }

  const isEligible = participant.attendanceStatus === 'attended';
  const seminar = participant.seminarId; // populated via API

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {participant.name.split(' ')[0]}</h1>
            <p className="text-neutral-400 mt-1">Manage your seminar details and certificates.</p>
          </div>
          <button onClick={() => setParticipant(null)} className="text-sm text-neutral-500 hover:text-white transition-colors">
            Sign out
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">{seminar?.title || 'Tech Seminar'}</h3>
              <p className="text-indigo-300 text-sm mt-1">
                {seminar?.date ? new Date(seminar.date).toLocaleDateString() : 'Upcoming'}
              </p>
            </div>
            {isEligible ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 size={14}/> Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                <AlertCircle size={14}/> Pending Attendance
              </span>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-indigo-500/20 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white flex items-center gap-2">
                <FileText size={18} className="text-indigo-400"/>
                Certificate of Completion
              </h4>
              <p className="text-sm text-neutral-400 mt-1 max-w-sm">
                Your certificate will automatically unlock here once the seminar is marked as completed by the host.
              </p>
            </div>
            
            <button
              onClick={handleDownloadCertificate}
              disabled={!isEligible}
              className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                isEligible 
                  ? 'bg-white text-black hover:bg-neutral-200' 
                  : 'bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
