"use client";

import { useEffect, useState } from 'react';
import { Search, Phone, CheckCircle2, Clock, AlertCircle, Calendar, Users, Filter, RefreshCcw } from 'lucide-react';
import seminarService from '@/services/seminarService';
import participantService from '@/services/participantService';

export default function LeadsPage() {
  const [seminars, setSeminars] = useState([]);
  const [selectedSeminarId, setSelectedSeminarId] = useState('all');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSeminars();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [selectedSeminarId]);

  const fetchSeminars = async () => {
    try {
      const data = await seminarService.getSeminars();
      const allSeminars = data.data || [];
      setSeminars(allSeminars.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (error) {
      console.error('Failed to fetch seminars', error);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const filters = selectedSeminarId !== 'all' ? { seminarId: selectedSeminarId } : {};
      const data = await participantService.getParticipants(filters);
      setLeads(data.data || []);
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  };



  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(search.toLowerCase()) || 
    lead.email.toLowerCase().includes(search.toLowerCase()) ||
    (lead.seminarId?.weekLabel || lead.seminarId?.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectedSeminar = selectedSeminarId === 'all'
    ? null
    : seminars.find((seminar) => seminar._id === selectedSeminarId);

  const totalLabel = selectedSeminar
    ? `${filteredLeads.length} lead${filteredLeads.length === 1 ? '' : 's'}`
    : `${filteredLeads.length} total leads`;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Seminar Leads</h1>
          <p className="text-sm text-neutral-500 mt-1">Select a seminar card to view only its registered leads.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..." 
              className="pl-9 pr-4 py-2 bg-neutral-900 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-sm w-64 text-white placeholder-neutral-600"
            />
          </div>
          <button onClick={fetchLeads} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold text-sm rounded-xl hover:bg-neutral-200 transition-colors">
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
          <Filter size={13} /> Seminar Cards
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <button
            onClick={() => setSelectedSeminarId('all')}
            className={`text-left p-5 rounded-2xl border transition-all ${selectedSeminarId === 'all' ? 'border-indigo-500/40 bg-indigo-500/10 text-white' : 'border-white/10 bg-neutral-900 text-neutral-400 hover:border-white/20 hover:bg-neutral-900/80'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">All Seminars</p>
                <p className="text-xs text-neutral-500 mt-1">View every lead across all cohorts</p>
              </div>
              <Users size={18} className="text-indigo-400 shrink-0" />
            </div>
          </button>

          {seminars.map((seminar) => {
            const active = selectedSeminarId === seminar._id;
            return (
              <button
                key={seminar._id}
                onClick={() => setSelectedSeminarId(seminar._id)}
                className={`text-left p-5 rounded-2xl border transition-all ${active ? 'border-indigo-500/40 bg-indigo-500/10 text-white' : 'border-white/10 bg-neutral-900 text-neutral-400 hover:border-white/20 hover:bg-neutral-900/80'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{seminar.weekLabel || seminar.title}</p>
                    <p className="text-xs text-neutral-500 mt-1 truncate">{seminar.title}</p>
                    <p className="text-[11px] text-neutral-600 mt-2 flex items-center gap-1.5">
                      <Calendar size={12} /> {new Date(seminar.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300">
                    Week {seminar.weekNumber}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>
          {selectedSeminar ? (
            <>Showing leads for <span className="text-indigo-300 font-semibold">{selectedSeminar.weekLabel || selectedSeminar.title}</span></>
          ) : (
            'Showing leads for all seminars'
          )}
        </span>
        <span>{totalLabel}</span>
      </div>

      <div className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 uppercase bg-black/20 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Attendee Details</th>
                <th className="px-6 py-4 font-semibold">Registered Seminar</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Attendance</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map((lead) => (
                <tr key={lead._id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">{lead.name}</p>
                    <p className="text-xs text-neutral-500 mt-1">{lead.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-medium text-indigo-300">
                        {lead.seminarId?.weekLabel || lead.seminarId?.title || 'Not assigned'}
                      </p>
                      {lead.seminarId?.date && (
                        <p className="text-xs text-neutral-500">
                          {new Date(lead.seminarId.date).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Phone size={14} /> <span>{lead.mobileNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${lead.attendanceStatus === 'attended' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-neutral-800 text-neutral-400'}`}>
                      {lead.attendanceStatus === 'attended' ? 'Attended' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/50 flex items-center justify-end gap-1.5">
                      <Clock size={11} /> Auto-tracked
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
