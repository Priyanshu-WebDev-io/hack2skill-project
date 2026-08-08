"use client";

import { useEffect, useState } from 'react';
import { Search, Phone, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import participantService from '@/services/participantService';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await participantService.getParticipants();
      setLeads(data.data || []);
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'success') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 size={12}/> Paid</span>;
    if (status === 'pending') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><Clock size={12}/> Pending</span>;
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20"><AlertCircle size={12}/> Failed</span>;
  };

  const handleMarkAttended = async (id) => {
    try {
      await participantService.markAttendance(id);
      // Refresh the specific lead locally
      setLeads(leads.map(lead => lead._id === id ? { ...lead, attendanceStatus: 'attended' } : lead));
    } catch (error) {
      console.error("Failed to mark attendance", error);
      alert("Failed to mark attendance");
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(search.toLowerCase()) || 
    lead.email.toLowerCase().includes(search.toLowerCase()) ||
    (lead.seminarId?.weekLabel || lead.seminarId?.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Seminar Leads</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage and view all registered attendees.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..." 
              className="pl-9 pr-4 py-2 bg-neutral-900 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-sm w-64 text-white placeholder-neutral-600"
            />
          </div>
          <button onClick={fetchLeads} className="px-4 py-2 bg-white text-black font-semibold text-sm rounded-xl hover:bg-neutral-200 transition-colors">
            Refresh
          </button>
        </div>
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
                <th className="px-6 py-4 font-semibold">Payment Status</th>
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
                    {getStatusBadge(lead.paymentStatus)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${lead.attendanceStatus === 'attended' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-neutral-800 text-neutral-400'}`}>
                      {lead.attendanceStatus === 'attended' ? 'Attended' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {lead.attendanceStatus !== 'attended' && (
                      <button 
                        onClick={() => handleMarkAttended(lead._id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors"
                      >
                        Mark Attended
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
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
