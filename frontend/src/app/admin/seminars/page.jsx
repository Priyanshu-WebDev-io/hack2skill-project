"use client";

import { useEffect, useState } from 'react';
import { Calendar, Plus, Clock, Video, CheckCircle2 } from 'lucide-react';
import seminarService from '@/services/seminarService';

export default function SeminarsPage() {
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    weekNumber: '',
    date: '',
    zoomLink: ''
  });

  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    setLoading(true);
    try {
      const data = await seminarService.getSeminars();
      setSeminars(data.data || []);
    } catch (error) {
      console.error("Failed to fetch seminars", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await seminarService.createSeminar({
        ...formData,
        weekNumber: parseInt(formData.weekNumber)
      });
      setShowForm(false);
      setFormData({ title: '', weekNumber: '', date: '', zoomLink: '' });
      fetchSeminars();
    } catch (error) {
      console.error("Failed to create seminar", error);
      alert("Failed to create seminar");
    }
  };

  const markCompleted = async (id) => {
    // Note: Assuming there's an API for this, or just a placeholder for now
    alert(`Mark Seminar ${id} Completed API needs to be implemented in backend.`);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Seminars</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage upcoming seminars and cohorts.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold text-sm rounded-xl hover:bg-neutral-200 transition-colors"
        >
          {showForm ? 'Cancel' : <><Plus size={16}/> Create Seminar</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl animate-in slide-in-from-top-4 fade-in duration-300">
          <h2 className="text-xl font-bold text-white mb-4">Create New Seminar</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase">Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-indigo-500 text-white" placeholder="e.g. Node.js Masterclass" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase">Week Number</label>
                <input required type="number" value={formData.weekNumber} onChange={e => setFormData({...formData, weekNumber: e.target.value})} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-indigo-500 text-white" placeholder="e.g. 1" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase">Date & Time</label>
                <input required type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-indigo-500 text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase">Zoom Link</label>
                <input value={formData.zoomLink} onChange={e => setFormData({...formData, zoomLink: e.target.value})} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-indigo-500 text-white" placeholder="https://zoom.us/j/..." />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors">
                Save Seminar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : seminars.map(seminar => (
          <div key={seminar._id} className="p-6 rounded-2xl bg-neutral-900 border border-white/5 flex flex-col group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                  Week {seminar.weekNumber}
                </div>
                <h3 className="text-lg font-bold text-white">{seminar.title}</h3>
              </div>
              {seminar.isCompleted && (
                <div className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg">
                  <CheckCircle2 size={16} />
                </div>
              )}
            </div>
            
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3 text-neutral-400 text-sm">
                <Calendar size={16} /> <span>{new Date(seminar.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-400 text-sm">
                <Clock size={16} /> <span>{new Date(seminar.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              {seminar.zoomLink && (
                <div className="flex items-center gap-3 text-blue-400 text-sm">
                  <Video size={16} /> <span className="truncate">{seminar.zoomLink}</span>
                </div>
              )}
            </div>
            
            {!seminar.isCompleted && (
              <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => markCompleted(seminar._id)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Mark Completed
                </button>
              </div>
            )}
          </div>
        ))}
        {!loading && seminars.length === 0 && (
          <div className="col-span-full p-12 text-center bg-neutral-900 rounded-2xl border border-white/5">
            <p className="text-neutral-500">No seminars found. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
