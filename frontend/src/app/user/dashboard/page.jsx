"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, Clock, MapPin, Video, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import apiService from '@/services/apiService';

export default function UserDashboard() {
  const searchParams = useSearchParams();
  const participantId = searchParams.get('id');

  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (participantId) {
      fetchParticipant();
    } else {
      setLoading(false);
      setError('No participant ID provided. Please register first or use a valid link.');
    }
  }, [participantId]);

  const fetchParticipant = async () => {
    try {
      setLoading(true);
      const data = await apiService.getParticipantById(participantId);
      if (data && data.success) {
        setParticipant(data.data);
      } else {
        setError('Participant not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!participant) return;
    try {
      setDownloading(true);
      const blob = await apiService.downloadCertificate(participant._id);
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${participant.name.replace(/\s+/g, '_')}_Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download certificate. Ensure you have attended the seminar and it is marked completed.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-300 p-8">
        <div className="max-w-md w-full bg-neutral-900 border border-white/10 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-white">Oops!</h2>
          <p className="text-neutral-500">{error}</p>
        </div>
      </div>
    );
  }

  const seminar = participant?.seminarId;
  const isAttended = participant?.attendanceStatus === 'attended';
  const isCompleted = seminar?.isCompleted;
  const canDownload = isAttended && isCompleted;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans p-8">
      <div className="max-w-4xl mx-auto space-y-8 mt-12">
        
        {/* Welcome Header */}
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Welcome, {participant.name}!</h1>
          <p className="text-lg text-neutral-500 mt-2">Here are your seminar details and resources.</p>
        </div>

        {/* Seminar Card */}
        {seminar ? (
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
              <div className="space-y-6 flex-1">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
                    Week {seminar.weekNumber} Cohort
                  </div>
                  <h2 className="text-2xl font-bold text-white">{seminar.title}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-neutral-400">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <Calendar size={18} />
                    </div>
                    <span className="font-medium">{new Date(seminar.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-400">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <Clock size={18} />
                    </div>
                    <span className="font-medium">{new Date(seminar.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>

                {/* Zoom Link Section */}
                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Meeting Details</h3>
                  {seminar.zoomLink ? (
                    <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                      <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                        <Video size={24} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-white font-medium truncate">{seminar.zoomLink}</p>
                        <p className="text-xs text-neutral-500 mt-1">Join 5 minutes early</p>
                      </div>
                      <a href={seminar.zoomLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors">
                        Join Now
                      </a>
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-sm">Zoom link will be emailed to you shortly before the seminar starts.</p>
                  )}
                </div>
              </div>

              {/* Certificate Section */}
              <div className="md:w-72 bg-black/20 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${canDownload ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500'}`}>
                  {canDownload ? <CheckCircle2 size={32} /> : <Download size={32} />}
                </div>
                <div>
                  <h3 className="text-white font-bold">Certificate of Completion</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {canDownload 
                      ? "Your certificate is ready to download!" 
                      : "Available after you attend the seminar."}
                  </p>
                </div>
                
                <button 
                  onClick={handleDownload}
                  disabled={!canDownload || downloading}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    canDownload 
                      ? 'bg-white text-black hover:bg-neutral-200' 
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {downloading ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download size={16} />
                      {canDownload ? 'Download PDF' : 'Locked'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-neutral-900 border border-white/5 rounded-3xl text-center">
            <p className="text-neutral-500">You are not registered for any upcoming seminars.</p>
          </div>
        )}

      </div>
    </div>
  );
}
