"use client";

import { useEffect, useState } from 'react';
import { Search, MapPin, Phone, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import apiService from '@/services/apiService';

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await apiService.getParticipants();
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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Seminar Leads</h1>
            <p className="text-sm text-neutral-500 mt-1">Manage and view all registered attendees for upcoming seminars.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                placeholder="Search leads..." 
                className="pl-9 pr-4 py-2 bg-neutral-900 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-sm w-64 placeholder-neutral-600"
              />
            </div>
            <button onClick={fetchLeads} className="px-4 py-2 bg-white text-black font-semibold text-sm rounded-xl hover:bg-neutral-200 transition-colors">
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Total Leads", value: leads.length, icon: Users, color: "text-blue-400" },
            { title: "Successful Registrations", value: leads.filter(l => l.paymentStatus === 'success').length, icon: CheckCircle2, color: "text-emerald-400" },
            { title: "Revenue", value: `₹${leads.filter(l => l.paymentStatus === 'success').reduce((sum, l) => sum + (l.amount||0), 0)}`, icon: CheckCircle2, color: "text-indigo-400" }
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl bg-neutral-900 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
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
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{lead.name}</p>
                      <p className="text-xs text-neutral-500 mt-1">{lead.email}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{lead.currentOccupation}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Phone size={14} /> <span>{lead.mobileNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(lead.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 text-neutral-400 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                      No leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
