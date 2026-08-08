"use client";

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  AlertCircle,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import participantService from '@/services/participantService';
import seminarService from '@/services/seminarService';

const getRelativeTime = (dateString) => {
  const diffMs = new Date(dateString) - new Date();
  const isFuture = diffMs > 0;
  const absMs = Math.abs(diffMs);
  
  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(absMs / (1000 * 60 * 60));
  const mins = Math.floor(absMs / (1000 * 60));

  if (isFuture) {
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hr${hours > 1 ? 's' : ''}`;
    if (mins > 0) return `in ${mins} min${mins > 1 ? 's' : ''}`;
    return 'Starting soon';
  } else {
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    return 'Started';
  }
};

export default function Home() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [seminars, setSeminars] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState({});
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrollError, setEnrollError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchSeminars();
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchRegistrations(user.email);
    } else {
      setMyRegistrations({});
    }
  }, [user]);

  const fetchSeminars = async () => {
    try {
      const res = await seminarService.getSeminars();
      setSeminars((res.data || []).sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (err) {
      console.error('Failed to fetch seminars', err);
    }
  };

  const fetchRegistrations = async (email) => {
    try {
      const res = await participantService.getParticipants({ search: email });
      const exactMatches = (res.data || []).filter((participant) => participant.email?.toLowerCase() === email.toLowerCase());
      const mapped = {};

      exactMatches.forEach((participant) => {
        const seminarId = participant.seminarId?._id || participant.seminarId;
        if (seminarId) {
          mapped[String(seminarId)] = participant;
        }
      });

      setMyRegistrations(mapped);
    } catch (err) {
      console.error('Failed to fetch participant registrations', err);
    }
  };

  const handleEnroll = async (seminar) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setEnrollingId(seminar._id);
    setEnrollError('');

    try {
      await participantService.registerParticipant({
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber || '',
        amount: 0,
        seminarId: seminar._id,
      });
      await fetchRegistrations(user.email);
    } catch (err) {
      setEnrollError(err.response?.data?.message || err.message || 'Enrollment failed.');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleDownload = async (participantRecord) => {
    if (!participantRecord) return;

    try {
      setDownloadingId(participantRecord._id);
      const blob = await participantService.downloadCertificate(participantRecord._id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${participantRecord.name.replace(/\s+/g, '_')}_Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      alert('Certificate not available yet. Attend the seminar first.');
    } finally {
      setDownloadingId(null);
    }
  };

  const groupedSeminars = seminars.reduce((groups, seminar) => {
    const label = seminar.weekLabel || `Week ${seminar.weekNumber}`;
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(seminar);
    return groups;
  }, {});

  const seminarGroups = Object.entries(groupedSeminars)
    .map(([weekLabel, weekSeminars]) => ({
      weekLabel,
      weekSeminars: weekSeminars.sort((a, b) => new Date(a.date) - new Date(b.date)),
      sortDate: new Date(weekSeminars[0]?.date || 0),
    }))
    .sort((a, b) => a.sortDate - b.sortDate);

  const renderCard = (seminar) => {
    const registration = myRegistrations[String(seminar._id)];
    const enrolled = Boolean(registration);
    const loading = enrollingId === seminar._id;
    const downloading = downloadingId === registration?._id;

    return (
      <div
        key={seminar._id}
        className={`relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-300 ${
          enrolled
            ? 'border-indigo-500/40 bg-linear-to-br from-indigo-950/60 to-neutral-900/80 shadow-[0_0_40px_rgba(99,102,241,0.08)]'
            : seminar.isCompleted
            ? 'border-white/5 bg-neutral-950/60 opacity-50'
            : 'border-white/10 bg-neutral-900/60 hover:border-white/20 hover:bg-neutral-900/80'
        }`}
      >
        <div className={`h-1 w-full ${enrolled ? 'bg-linear-to-r from-indigo-500 to-violet-500' : seminar.isCompleted ? 'bg-neutral-800' : 'bg-linear-to-r from-white/10 to-white/5'}`} />

        <div className="p-6 flex flex-col gap-5 flex-1">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                {seminar.weekLabel || `Week ${seminar.weekNumber}`}
              </span>
              {enrolled && (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <BadgeCheck size={10} /> Enrolled
                </span>
              )}
              {seminar.isCompleted && (
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-700">
                  Completed
                </span>
              )}
              {!seminar.isCompleted && seminar.registrationOpen && !enrolled && (
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ● Open
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">{seminar.title}</h3>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-sm text-neutral-400">
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                <Calendar size={13} className="text-indigo-400" />
              </div>
              {new Date(seminar.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-400">
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                <Clock size={13} className="text-indigo-400" />
              </div>
              <span>{new Date(seminar.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
              <span className="text-[10px] ml-auto font-semibold px-2 py-1 rounded bg-white/10 text-white/80 whitespace-nowrap">
                {seminar.isCompleted ? 'Ended' : getRelativeTime(seminar.date)}
              </span>
            </div>
          </div>

          {enrolled && (
            <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
              {!seminar.isCompleted ? (
                <>
                  {seminar.zoomLink ? (
                    <a
                      href={seminar.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition-colors"
                    >
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl shrink-0">
                        <Video size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-black mb-0.5">Meeting Link</p>
                        <p className="text-white font-semibold text-xs truncate">{seminar.zoomLink}</p>
                      </div>
                      <span className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl">
                        Join
                      </span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-neutral-500 text-sm italic">
                      <Video size={16} className="shrink-0" />
                      Link will be shared soon
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${registration?.attendanceStatus === 'attended' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'}`}>
                      {registration?.attendanceStatus === 'attended' ? 'Attended' : 'Pending Attendance'}
                    </span>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => handleDownload(registration)}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black text-sm font-bold rounded-2xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  <Download size={16} />
                  {downloading ? 'Downloading...' : 'Download Certificate'}
                </button>
              )}
            </div>
          )}

          {!enrolled && !seminar.isCompleted && (
            <div className="mt-auto pt-4 border-t border-white/5">
              <button
                onClick={() => handleEnroll(seminar)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white text-black font-bold hover:bg-neutral-200 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Enroll Now — Free
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
      <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          if (user?.email) {
            fetchRegistrations(user.email);
          }
        }}
      />

      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-b from-black via-black/80 to-black pointer-events-none" />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen space-y-16">
        <div className="text-center space-y-5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
            <Sparkles size={16} />
            <span>Weekly Masterclass Series</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white via-white to-white/50">
            Elevate Your Career.
          </h1>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Explore every seminar in card form, choose the one you want, and enroll directly in that session.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
            {[
              { icon: Calendar, text: 'Every week', sub: 'Multiple seminars can appear in the same week' },
              { icon: Clock, text: 'Mon-Sat enrollment', sub: 'Sunday sessions with automatic Zoom links' },
              { icon: MapPin, text: 'Flexible cohorts', sub: 'Enroll in the seminar you want' },
              { icon: Sparkles, text: 'Certificate Included', sub: 'After attendance and completion' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 text-left p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-indigo-400">
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="font-semibold text-white">{item.text}</p>
                  <p className="text-xs text-neutral-500 mt-1">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {!user && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-2 mt-2 px-8 py-3.5 rounded-2xl bg-white text-black font-bold hover:bg-neutral-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              Sign In to Enroll <ArrowRight size={18} />
            </button>
          )}
        </div>

        {enrollError && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-3xl mx-auto">
            <AlertCircle size={18} className="shrink-0" />
            {enrollError}
          </div>
        )}

        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
              <Users size={13} /> Available Sessions
            </h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {seminarGroups.length === 0 ? (
            <div className="text-center py-24 text-neutral-600">
              <Users size={40} className="mx-auto mb-4 opacity-30" />
              <p>No seminars scheduled yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-10">
              {seminarGroups.map(({ weekLabel, weekSeminars }) => (
                <div key={weekLabel} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-neutral-500">{weekLabel}</h3>
                    <div className="h-px flex-1 bg-white/10" />
                    {weekSeminars.length > 1 && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">
                        {weekSeminars.length} seminars
                      </span>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {weekSeminars.map(renderCard)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
