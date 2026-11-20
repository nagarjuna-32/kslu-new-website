import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  ExternalLink,
  Search,
  Filter,
  AlertCircle,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';

export const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const categories = [
    { key: '', label: 'All Updates' },
    { key: 'EXAMINATION', label: 'Examinations' },
    { key: 'TIMETABLE', label: 'Timetables' },
    { key: 'RESULTS', label: 'Results' },
    { key: 'ACADEMIC_CALENDAR', label: 'Academic Calendar' },
    { key: 'COMPETITION', label: 'Moot & Competitions' },
    { key: 'UNIVERSITY_CIRCULAR', label: 'Circulars' }
  ];

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);

        const response = await api.get(`/announcements?${params.toString()}`);
        if (response.success && response.data) {
          setAnnouncements(response.data.items || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
          Official University Updates
        </span>
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white mt-1">
          Announcements & Academic Notifications
        </h1>
        <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-400 mt-1">
          Stay informed on KSLU odd and even semester timetables, revaluation portals, syllabus notifications, and university circulars with direct verified source links.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-navy-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search circulars, examination notifications, revaluation..."
            className="w-full pl-10 pr-4 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                category === c.key
                  ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400'
                  : 'text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <CardSkeleton />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications found"
          description="There are currently no active circulars matching your search."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white dark:bg-navy-900 rounded-2xl p-6 border shadow-sm transition space-y-3 ${
                ann.isImportant
                  ? 'border-gold-400/60 dark:border-gold-500/40 bg-gold-50/20 dark:bg-gold-950/10'
                  : 'border-navy-200 dark:border-navy-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-navy-800 dark:text-navy-200 uppercase tracking-wide">
                    {ann.category.replace('_', ' ')}
                  </span>
                  {ann.isImportant && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                      <AlertCircle className="w-3 h-3" />
                      <span>Important Notice</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-navy-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(ann.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-white">
                {ann.title}
              </h3>

              <p className="text-xs text-navy-700 dark:text-navy-300 leading-relaxed whitespace-pre-wrap">
                {ann.content}
              </p>

              {ann.officialSourceUrl && (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-navy-400 flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Cross-referenced from university portals</span>
                  </span>
                  <a
                    href={ann.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-800 dark:text-navy-200 text-xs font-semibold rounded-lg transition"
                  >
                    <span>View Official Portal Notification</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
