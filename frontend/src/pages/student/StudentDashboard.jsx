import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Upload,
  BookOpen,
  FileText,
  Bot,
  MessageSquare,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Bell
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [notesRes, notifRes] = await Promise.all([
          api.get('/notes/my-submissions'),
          api.get('/notifications')
        ]);
        if (notesRes.success) setContributions(notesRes.data?.notes || []);
        if (notifRes.success) setNotifications(notifRes.data?.notifications?.slice(0, 4) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-950 rounded-3xl p-6 sm:p-8 text-white border border-gold-500/30 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-800/80 border border-gold-500/30 text-gold-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KSLU Scholar Workspace</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Welcome back, {user?.fullName || 'Law Student'}!
          </h1>
          <p className="text-xs sm:text-sm text-navy-300">
            {user?.course?.name ? `${user.course.name} • ${user.semester?.title || 'Semester I'}` : 'Karnataka Law Studies'}
            {user?.collegeName ? ` • ${user.collegeName}` : ''}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-navy-500">My Study Notes</span>
            <span className="block font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
              {contributions.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-100 dark:bg-gold-950/60 text-gold-600 dark:text-gold-400 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-navy-500">Approved Notes</span>
            <span className="block font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {contributions.filter(c => c.status === 'APPROVED').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-navy-500">Active Notifications</span>
            <span className="block font-serif text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {notifications.filter(n => !n.isRead).length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Launchpad */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white">
          Academic Quick Launchpad
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Link
            to="/pyqs"
            className="p-4 rounded-xl bg-navy-50 dark:bg-navy-800/60 hover:bg-navy-100 dark:hover:bg-navy-800 border border-navy-200/60 dark:border-navy-700 transition flex flex-col items-center text-center gap-2 group"
          >
            <FileText className="w-6 h-6 text-gold-600 dark:text-gold-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-navy-900 dark:text-white">Question Papers</span>
            <span className="text-[10px] text-navy-400">Scheme 80 & 100 Marks</span>
          </Link>

          <Link
            to="/notes"
            className="p-4 rounded-xl bg-navy-50 dark:bg-navy-800/60 hover:bg-navy-100 dark:hover:bg-navy-800 border border-navy-200/60 dark:border-navy-700 transition flex flex-col items-center text-center gap-2 group"
          >
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-navy-900 dark:text-white">Study Notes</span>
            <span className="text-[10px] text-navy-400">Verified Peer Summaries</span>
          </Link>

          <Link
            to="/ai-tutor"
            className="p-4 rounded-xl bg-navy-50 dark:bg-navy-800/60 hover:bg-navy-100 dark:hover:bg-navy-800 border border-navy-200/60 dark:border-navy-700 transition flex flex-col items-center text-center gap-2 group"
          >
            <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-navy-900 dark:text-white">AI Study Assistant</span>
            <span className="text-[10px] text-navy-400">Case Explanations & Drafts</span>
          </Link>

          <Link
            to="/community"
            className="p-4 rounded-xl bg-navy-50 dark:bg-navy-800/60 hover:bg-navy-100 dark:hover:bg-navy-800 border border-navy-200/60 dark:border-navy-700 transition flex flex-col items-center text-center gap-2 group"
          >
            <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-navy-900 dark:text-white">Student Forum</span>
            <span className="text-[10px] text-navy-400">Q&A and Discussions</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity & Submissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contributed Notes */}
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-navy-900 dark:text-white">
              My Recent Submissions
            </h3>
            <Link to="/dashboard/contributions" className="text-xs text-gold-600 dark:text-gold-400 font-semibold hover:underline">
              View All
            </Link>
          </div>

          {contributions.length === 0 ? (
            <p className="text-xs text-navy-500 py-4 text-center">
              You haven't submitted any study notes yet.
            </p>
          ) : (
            <div className="divide-y divide-navy-100 dark:divide-navy-800 text-xs">
              {contributions.slice(0, 3).map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-navy-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-[11px] text-navy-500">{item.subject?.name}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide shrink-0 ${
                      item.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : item.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-navy-900 dark:text-white">
              Recent Academic Notifications
            </h3>
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-navy-500 py-4 text-center">No notifications yet.</p>
          ) : (
            <div className="divide-y divide-navy-100 dark:divide-navy-800 text-xs">
              {notifications.map((n) => (
                <div key={n.id} className="py-3 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-navy-900 dark:text-white">{n.title}</span>
                    <span className="text-[10px] text-navy-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-navy-600 dark:text-navy-400 line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
