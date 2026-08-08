"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { Search, FileText, Send, Download, RefreshCw, ChevronLeft, ChevronRight, Zap, CheckCircle2, XCircle, Filter } from 'lucide-react';
import automationService from '@/services/automationService';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 25, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Controlled params
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState(''); // debounced separately
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(25);

  const debounceRef = useRef(null);

  // Debounce search input → committed search
  const handleSearchInput = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await automationService.getAutomationLogs({
        page,
        limit: pageSize,
        search,
        status: statusFilter,
      });
      setLogs(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, pageSize, totalPages: 1 });
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  // Fetch whenever params change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to page 1 on filter changes (not page changes)
  const handleStatusChange = (s) => { setStatusFilter(s); setPage(1); };
  const handlePageSizeChange = (n) => { setPageSize(n); setPage(1); };

  const getLogIcon = (actionType) => {
    if (actionType === 'email_sent')          return <Send size={15} className="text-blue-400" />;
    if (actionType === 'pdf_downloaded')      return <Download size={15} className="text-emerald-400" />;
    if (actionType === 'zoom_meeting_created') return <Zap size={15} className="text-yellow-400" />;
    if (actionType === 'seminar_created')     return <CheckCircle2 size={15} className="text-indigo-400" />;
    return <FileText size={15} className="text-neutral-400" />;
  };

  const { total, totalPages } = pagination;
  const safePage = Math.min(page, totalPages);
  const startEntry = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endEntry   = Math.min(safePage * pageSize, total);

  // Build page numbers with ellipsis
  const pageNumbers = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (safePage > 3) pages.push('...');
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
    if (safePage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  })();

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Automation Logs</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Monitor all automated actions — emails, Zoom meetings, seminars.
            {!loading && <span className="ml-2 text-neutral-600">{total} total entries</span>}
          </p>
        </div>
        <button
          onClick={() => fetchLogs()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-semibold text-sm rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search action, message…"
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/60 text-sm text-white placeholder-neutral-600"
          />
        </div>

        {/* Status toggle */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-white/10 rounded-xl">
          {[
            { value: 'all',     label: 'All' },
            { value: 'success', label: 'Success' },
            { value: 'failed',  label: 'Failed' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === opt.value ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Page size */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 ml-auto">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={e => handlePageSizeChange(Number(e.target.value))}
            className="bg-neutral-900 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500/60"
          >
            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 uppercase bg-black/20 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Action Type</th>
                <th className="px-6 py-4 font-semibold">Participant</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Message</th>
                <th className="px-6 py-4 font-semibold">Executed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getLogIcon(log.actionType)}
                      <span className="font-medium text-white capitalize text-xs">
                        {log.actionType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.participantId ? (
                      <>
                        <p className="font-medium text-neutral-300 text-sm">{log.participantId.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{log.participantId.email}</p>
                      </>
                    ) : (
                      <p className="text-neutral-600 text-xs italic">System</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full ${
                      log.status === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {log.status === 'success' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-[240px]">
                    <p className="text-xs text-neutral-500 truncate" title={log.details}>{log.details || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-neutral-400 text-xs whitespace-nowrap">
                    {new Date(log.executedAt || log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-neutral-600">
                    <Filter size={28} className="mx-auto mb-3 opacity-30" />
                    No logs match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination footer */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-neutral-500">
            Showing <span className="text-white font-semibold">{startEntry}–{endEntry}</span> of{' '}
            <span className="text-white font-semibold">{total}</span> entries
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1 || loading}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} /> Prev
            </button>

            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span key={`el-${i}`} className="px-2 text-neutral-600 text-xs">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  disabled={loading}
                  className={`w-9 h-9 text-xs font-bold rounded-xl transition-all ${
                    safePage === p
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                      : 'bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages || loading}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
