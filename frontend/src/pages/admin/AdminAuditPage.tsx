import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLogItem } from '../../types';
import { Shield, Clock, User, ArrowRight, RefreshCw } from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAudit = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs();
      setLogs(res.logs);
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
            Institutional Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Immutable log of state transitions, security events, role changes, and transactions
          </p>
        </div>

        <button
          onClick={loadAudit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-primary text-xs font-semibold hover:bg-slate-50 shadow-glass-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-ink-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Actor</th>
                <th className="px-6 py-3.5">Event</th>
                <th className="px-6 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-sans">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-sans">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3 text-ink-secondary whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 font-semibold text-ink-primary">
                      {log.actorName || 'System'}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px]">
                        {log.event}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-ink-secondary max-w-xs truncate">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
