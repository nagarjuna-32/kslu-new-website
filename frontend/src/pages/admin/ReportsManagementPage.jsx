import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../../api/client';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotification } from '../../contexts/NotificationContext';

export const ReportsManagementPage = () => {
  const { setToast } = useNotification();
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports?status=${status}`);
      if (res.success && res.data) {
        setReports(res.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [status]);

  const handleResolve = async (id, newStatus) => {
    try {
      const res = await api.put(`/admin/reports/${id}/resolve`, {
        status: newStatus,
        resolutionNotes: `Action taken by admin on ${new Date().toLocaleDateString()}`
      });
      if (res.success) {
        setToast({ title: 'Report Updated', message: `Marked as ${newStatus}.`, type: 'APPROVAL' });
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Safety & Academic Integrity
          </span>
          <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
            Content Reports & Moderation
          </h1>
        </div>

        <div className="flex bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl p-1 text-xs">
          {['PENDING', 'RESOLVED', 'DISMISSED', 'ALL'].map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                status === st
                  ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                  : 'text-navy-600 dark:text-navy-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={AlertOctagon}
          title="No reported items"
          description="There are currently no flagged resources in this review queue."
        />
      ) : (
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-200 dark:border-navy-800 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-navy-100 dark:divide-navy-800">
              <thead className="bg-navy-50 dark:bg-navy-800/50 text-navy-500 font-semibold">
                <tr>
                  <th className="px-5 py-3">Reported Item</th>
                  <th className="px-5 py-3">Violation Reason</th>
                  <th className="px-5 py-3">Reporter</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800/60">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/30 transition">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[10px] text-navy-500 uppercase block">{r.itemType}</span>
                      <p className="font-semibold text-navy-900 dark:text-white truncate max-w-xs">
                        {r.studyMaterial?.title || r.discussion?.title || 'Resource'}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-bold text-rose-600 dark:text-rose-400 block">{r.reason}</span>
                      {r.details && <p className="text-[11px] text-navy-500 line-clamp-1">{r.details}</p>}
                    </td>

                    <td className="px-5 py-3.5">
                      {r.reporter?.fullName}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        r.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        r.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-navy-100 text-navy-600'
                      }`}>
                        {r.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {r.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResolve(r.id, 'RESOLVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleResolve(r.id, 'DISMISSED')}
                            className="px-2.5 py-1 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 text-navy-700 dark:text-navy-300 rounded-lg font-medium"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
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
