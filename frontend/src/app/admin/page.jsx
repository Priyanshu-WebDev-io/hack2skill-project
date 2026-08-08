"use client";

import { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle2, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import apiService from '@/services/apiService';
import Link from 'next/link';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    successfulPayments: 0,
    revenue: 0,
    totalLogs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [leadsRes, logsRes] = await Promise.all([
        apiService.getParticipants(),
        apiService.getAutomationLogs()
      ]);
      
      const leads = leadsRes.data || [];
      const logs = logsRes.data || [];
      
      const successfulPayments = leads.filter(l => l.paymentStatus === 'success').length;
      const revenue = leads.filter(l => l.paymentStatus === 'success').reduce((sum, l) => sum + (l.amount||0), 0);

      setStats({
        totalLeads: leads.length,
        successfulPayments,
        revenue,
        totalLogs: logs.length,
      });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
        <p className="text-sm text-neutral-500 mt-1">High-level metrics for your seminars and automation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: "Total Leads", value: stats.totalLeads, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { title: "Successful Registrations", value: stats.successfulPayments, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { title: "Total Revenue", value: `₹${stats.revenue}`, icon: TrendingUp, color: "text-indigo-400", bg: "bg-indigo-500/10" },
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-neutral-900 border border-white/5 rounded-3xl">
           <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
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
                 <span className="font-medium text-white">View Automation Logs</span>
               </div>
               <span className="text-neutral-500 text-sm">Monitor activity &rarr;</span>
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
