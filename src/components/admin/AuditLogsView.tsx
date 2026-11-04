import React, { useState, useEffect } from 'react';
import { History, Shield, Search, Filter, Clock, User } from 'lucide-react';
import { AuditLog } from '../../types';
import { getAuditLogs } from '../../firebase/services';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const list = await getAuditLogs();
    setLogs(list);
  };

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.record_id.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (moduleFilter === 'all') return true;
    return l.module === moduleFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#153B65]">System Security & Audit Logs</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Immutable log trail of all proposal submissions, evaluator reviews, administrative status transitions, and grant approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Firestore Cryptographic Audit Trail</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by user, action, tracking number..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs overflow-x-auto">
          {['all', 'PROPOSAL', 'REVIEW', 'EVALUATION', 'MONITORING'].map((m) => (
            <button
              key={m}
              onClick={() => setModuleFilter(m)}
              className={`px-3 py-1.5 rounded-lg uppercase text-[10px] font-bold tracking-wider transition-all ${
                moduleFilter === m
                  ? 'bg-white text-[#153B65] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Responsible User</th>
              <th className="p-3.5">Module</th>
              <th className="p-3.5">Action Code</th>
              <th className="p-3.5">Event Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-3.5 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                </td>
                <td className="p-3.5 font-semibold text-[#153B65] whitespace-nowrap">
                  {log.user_name}
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold uppercase">
                    {log.module}
                  </span>
                </td>
                <td className="p-3.5 font-mono text-[11px] font-bold text-gray-800 whitespace-nowrap">
                  {log.action}
                </td>
                <td className="p-3.5 text-gray-700 leading-relaxed">
                  {log.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
