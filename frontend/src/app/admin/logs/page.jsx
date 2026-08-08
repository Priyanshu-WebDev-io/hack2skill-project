"use client";

import { useEffect, useState } from 'react';
import { Search, FileText, Send, Download } from 'lucide-react';
import apiService from '@/services/apiService';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAutomationLogs();
      setLogs(data.data || []);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (actionType) => {
    if (actionType === 'email_sent') return <Send size={16} className="text-blue-400" />;
    if (actionType === 'pdf_downloaded') return <Download size={16} className="text-emerald-400" />;
    return <FileText size={16} className="text-neutral-400" />;
  };

  const filteredLogs = logs.filter(log => 
    log.actionType.toLowerCase().includes(search.toLowerCase()) || 
    (log.participantId?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Automation Logs</h1>
          <p className="text-sm text-neutral-500 mt-1">Monitor all automated actions like emails and PDF generation.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..." 
              className="pl-9 pr-4 py-2 bg-neutral-900 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-sm w-64 text-white placeholder-neutral-600"
            />
          </div>
          <button onClick={fetchLogs} className="px-4 py-2 bg-white text-black font-semibold text-sm rounded-xl hover:bg-neutral-200 transition-colors">
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
                <th className="px-6 py-4 font-semibold">Action Type</th>
                <th className="px-6 py-4 font-semibold">Participant</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Executed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getLogIcon(log.actionType)}
                      <span className="font-medium text-white capitalize">{log.actionType.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-neutral-300">{log.participantId?.name || 'Unknown'}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{log.participantId?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-400 text-xs">
                    {new Date(log.executedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                    No automation logs found.
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
