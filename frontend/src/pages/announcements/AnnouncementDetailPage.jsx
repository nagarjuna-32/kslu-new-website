import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Bell,
  Calendar,
  ExternalLink,
  ArrowLeft,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

export const AnnouncementDetailPage = () => {
  const { slug } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/announcements/${slug}`);
        if (response.success && response.data?.announcement) {
          setAnnouncement(response.data.announcement);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();
  }, [slug]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10"><CardSkeleton /></div>;
  if (!announcement) return <div className="text-center py-16"><h2 className="text-lg font-bold">Announcement not found</h2></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/announcements"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to University Updates</span>
      </Link>

      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-10 border border-navy-200 dark:border-navy-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-navy-100 dark:bg-navy-800 text-navy-800 dark:text-navy-200 uppercase tracking-wide">
              {announcement.category.replace('_', ' ')}
            </span>
            {announcement.isImportant && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Important Official Notification</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-navy-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(announcement.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
          {announcement.title}
        </h1>

        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-navy-700 dark:text-navy-300 leading-relaxed whitespace-pre-wrap">
          {announcement.content}
        </div>

        {announcement.officialSourceUrl && (
          <div className="p-4 bg-navy-50 dark:bg-navy-800/40 rounded-2xl border border-navy-200/60 dark:border-navy-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-navy-600 dark:text-navy-400">
              <FileCheck2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Verified against Karnataka State Law University portals</span>
            </div>

            <a
              href={announcement.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white font-bold rounded-xl shadow-sm transition shrink-0 self-start sm:self-auto"
            >
              <span>View University Circular</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
