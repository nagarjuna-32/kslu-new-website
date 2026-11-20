import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  BookOpen,
  Clock,
  CheckCircle2,
  Download,
  Shield,
  Activity
} from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard-stats');
        if (response.success && response.data) {
          setData(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <CardSkeleton />;

  const stats = data?.stats || {};
  const courseStats = data?.courseStats || [];
  const recentLogs = data?.recentAuditLogs || [];

  return (
    <div className="space-y-8">
      {/* Overview stats header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
          Executive Control
        </span>
        <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
          KSLU Circle Administration Dashboard
        </h1>
        <p className="text-xs text-navy-500 mt-1">
          Real-time metrics on student participation, question paper repository, and moderation activity.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between text-navy-500 mb-2">
            <span className="text-xs font-semibold">Total Students</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <span className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
            {stats.totalStudents || 0}
          </span>
          <span className="text-[10px] text-navy-400 block mt-1">Registered scholars</span>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between text-navy-500 mb-2">
            <span className="text-xs font-semibold">Pending Moderation</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-serif text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pendingNotes || 0}
          </span>
          <span className="text-[10px] text-navy-400 block mt-1">Notes awaiting review</span>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between text-navy-500 mb-2">
            <span className="text-xs font-semibold">Verified PYQs</span>
            <FileText className="w-4 h-4 text-gold-500" />
          </div>
          <span className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
            {stats.totalPYQs || 0}
          </span>
          <span className="text-[10px] text-navy-400 block mt-1">Official question papers</span>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between text-navy-500 mb-2">
            <span className="text-xs font-semibold">Total Downloads</span>
            <Download className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
            {stats.totalDownloads || 0}
          </span>
          <span className="text-[10px] text-navy-400 block mt-1">Academic resources fetched</span>
        </div>
      </div>

      {/* Program Distribution */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white">
          Curriculum Distribution by Law Course
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {courseStats.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-navy-50 dark:bg-navy-800/50 border border-navy-100 dark:border-navy-700/60 space-y-2"
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="text-navy-900 dark:text-white">{c.name}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-navy-200 dark:bg-navy-700">
                  {c.code}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px] text-navy-500 pt-1">
                <div>
                  <span className="block text-navy-800 dark:text-navy-200 font-bold">{c._count?.questionPapers || 0}</span>
                  <span>PYQs</span>
                </div>
                <div>
                  <span className="block text-navy-800 dark:text-navy-200 font-bold">{c._count?.studyMaterials || 0}</span>
                  <span>Notes</span>
                </div>
                <div>
                  <span className="block text-navy-800 dark:text-navy-200 font-bold">{c._count?.users || 0}</span>
                  <span>Enrolled</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-gold-500" />
            <span>Recent System Actions (Audit Trail)</span>
          </h3>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left divide-y divide-navy-100 dark:divide-navy-800">
            <thead>
              <tr className="text-navy-400 font-medium">
                <th className="pb-3">Action</th>
                <th className="pb-3">Actor</th>
                <th className="pb-3">Resource Type</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100 dark:divide-navy-800/60 text-navy-700 dark:text-navy-300">
              {recentLogs.map((log) => (
                <tr key={log.id} className="py-2.5">
                  <td className="py-2.5 font-mono text-[11px] font-semibold text-navy-900 dark:text-white">
                    {log.action}
                  </td>
                  <td className="py-2.5">
                    {log.user ? `${log.user.fullName} (${log.user.role})` : 'System / Guest'}
                  </td>
                  <td className="py-2.5 font-mono text-[11px]">
                    {log.resourceType}
                  </td>
                  <td className="py-2.5 text-navy-400 text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
