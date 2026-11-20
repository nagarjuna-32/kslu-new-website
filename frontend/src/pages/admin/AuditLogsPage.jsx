import React, { useState, useEffect } from 'react';
import { ScrollText, Shield, Search } from 'lucide-react';
import api from '../../api/client';
import { TableSkeleton } from '../../components/common/SkeletonLoader';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit-logs?limit=50')
      .then(res => {
        if (res.success && res.data) {
          setLogs(res.data.items || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
          Security Trail
        </span>
        <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
          System Audit Logs
        </h1>
        <p className="text-xs text-navy-500 mt-1">
          Immutable event log tracking administrative actions, user logins, role modifications, and moderation approvals.
        </p>
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-200 dark:border-navy-800 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-navy-100 dark:divide-navy-800">
              <thead className="bg-navy-50 dark:bg-navy-800/50 text-navy-500 font-semibold">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Event Action</th>
                  <th className="px-5 py-3">Operator</th>
                  <th className="px-5 py-3">Target Entity</th>
                  <th className="px-5 py-3">IP Address</th>
                  <th className="px-5 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800/60 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/30 transition">
                    <td className="px-5 py-3 text-navy-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-bold text-navy-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="px-5 py-3 font-sans text-navy-700 dark:text-navy-300">
                      {log.user ? `${log.user.fullName} (${log.user.role})` : 'System / Guest'}
                    </td>
                    <td className="px-5 py-3 text-navy-600 dark:text-navy-400">
                      {log.resourceType} {log.resourceId ? `#${log.resourceId.slice(0, 8)}` : ''}
                    </td>
                    <td className="px-5 py-3 text-navy-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="px-5 py-3 font-sans text-navy-500 max-w-xs truncate" title={log.details}>
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
