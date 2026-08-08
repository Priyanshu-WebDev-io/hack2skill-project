"use client";

import { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle2, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import participantService from '@/services/participantService';
import automationService from '@/services/automationService';
import Link from 'next/link';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    successfulPayments: 0,
    totalLogs: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [leadsRes, logsRes] = await Promise.all([
          participantService.getParticipants(),
          automationService.getAutomationLogs({ limit: 5 })
        ]);
        
        const leads = leadsRes.data || [];
        const logs = logsRes.data || [];
        
        const successfulPayments = leads.filter(l => l.paymentStatus === 'success').length;

        setStats({
          totalLeads: leads.length,
          successfulPayments,
          totalLogs: logsRes.pagination?.total || 0,
        });
        setRecentLogs(logs.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const getLogIcon = (actionType) => {
    if (actionType === 'email_sent') return <span className="text-blue-400">📧</span>;
    if (actionType === 'pdf_downloaded') return <span className="text-emerald-400">📄</span>;
    if (actionType === 'zoom_meeting_created') return <span className="text-yellow-400">⚡</span>;
    if (actionType === 'seminar_created') return <CheckCircle2 size={15} className="text-indigo-400" />;
    return <FileText size={15} className="text-neutral-400" />;
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Agent Operations Hub</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Live autonomous metrics and AI operations as of {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Total Leads", value: stats.totalLeads, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { title: "Successful Registrations", value: stats.successfulPayments, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { title: "Automation Actions", value: stats.totalLogs, icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10" }
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-neutral-900 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
            <div>
              <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
              <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
            </div>
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-neutral-900 border border-white/5 rounded-3xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Live Agent Actions</h2>
            <Link href="/admin/logs" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
              View all
            </Link>
          </div>
          {recentLogs.length === 0 ? (
            <p className="text-neutral-500 text-sm py-4">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map(log => (
                <div key={log._id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="shrink-0 p-2 rounded-lg bg-white/5">
                    {getLogIcon(log.actionType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {log.actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${log.status === 'success' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                      {log.status}
                    </span>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-neutral-900 border border-white/5 rounded-3xl">
           <h2 className="text-lg font-bold text-white mb-4">Agent Controls</h2>
           <div className="space-y-3">
             <Link href="/admin/leads" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
               <div className="flex items-center gap-3">
                 <Users className="text-blue-400" size={20} />
                 <span className="font-medium text-white">Manage Leads</span>
               </div>
               <span className="text-neutral-500 text-sm">View details &rarr;</span>
             </Link>
             <Link href="/admin/logs" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
               <div className="flex items-center gap-3">
                 <FileText className="text-emerald-400" size={20} />
                 <span className="font-medium text-white">Automation Logs</span>
               </div>
               <span className="text-neutral-500 text-sm">Monitor activity &rarr;</span>
             </Link>
             <Link href="/admin/seminars" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
               <div className="flex items-center gap-3">
                 <Clock className="text-yellow-400" size={20} />
                 <span className="font-medium text-white">Seminars</span>
               </div>
               <span className="text-neutral-500 text-sm">Schedule &rarr;</span>
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
