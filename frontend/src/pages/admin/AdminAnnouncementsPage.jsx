import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Calendar, AlertCircle, ExternalLink, X } from 'lucide-react';
import api from '../../api/client';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { useNotification } from '../../contexts/NotificationContext';

export const AdminAnnouncementsPage = () => {
  const { setToast } = useNotification();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('EXAMINATION');
  const [isImportant, setIsImportant] = useState(false);
  const [officialSourceUrl, setOfficialSourceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements?limit=50');
      if (res.success && res.data) {
        setAnnouncements(res.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/announcements', {
        title,
        content,
        category,
        isImportant,
        officialSourceUrl: officialSourceUrl || null
      });

      if (res.success) {
        setToast({ title: 'Announcement Published', message: 'University update dispatched and broadcasted.', type: 'APPROVAL' });
        setModalOpen(false);
        setTitle('');
        setContent('');
        setOfficialSourceUrl('');
        setIsImportant(false);
        fetchAnnouncements();
      }
    } catch (err) {
      setToast({ title: 'Error', message: err.message, type: 'REJECTION' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, annTitle) => {
    if (!window.confirm(`Delete announcement "${annTitle}"?`)) return;
    try {
      await api.delete(`/announcements/${id}`);
      setToast({ title: 'Deleted', message: 'Announcement removed.', type: 'info' });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Official Communications
          </span>
          <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
            University Announcements Manager
          </h1>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:text-white text-xs font-bold rounded-xl shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Notification</span>
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-200 dark:border-navy-800 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-navy-100 dark:divide-navy-800">
              <thead className="bg-navy-50 dark:bg-navy-800/50 text-navy-500 font-semibold">
                <tr>
                  <th className="px-5 py-3">Announcement Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Published Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800/60">
                {announcements.map((a) => (
                  <tr key={a.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/30 transition">
                    <td className="px-5 py-3.5 max-w-sm">
                      <p className="font-semibold text-navy-900 dark:text-white truncate">{a.title}</p>
                      <p className="text-[11px] text-navy-500 line-clamp-1">{a.content}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
                        {a.category}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      {a.isImportant ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          IMPORTANT
                        </span>
                      ) : (
                        <span className="text-navy-400 text-[10px]">Standard</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-navy-400 text-[11px]">
                      {new Date(a.publishedAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(a.id, a.title)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-lg w-full p-6 border border-navy-200 dark:border-navy-700 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white">
                Publish University Notification
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-navy-400 hover:text-navy-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. KSLU Odd Semester Examination Timetable Released"
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                >
                  <option value="EXAMINATION">Examinations</option>
                  <option value="TIMETABLE">Timetables</option>
                  <option value="RESULTS">Results / Revaluation</option>
                  <option value="ACADEMIC_CALENDAR">Academic Calendar</option>
                  <option value="COMPETITION">Moot Court / Competition</option>
                  <option value="UNIVERSITY_CIRCULAR">Official Circular</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Circular Content *</label>
                <textarea
                  rows="4"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Official notification text, important instructions for students..."
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Official University Portal URL (Optional)</label>
                <input
                  type="url"
                  value={officialSourceUrl}
                  onChange={(e) => setOfficialSourceUrl(e.target.value)}
                  placeholder="https://kslu.karnataka.gov.in/notifications"
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="rounded text-gold-600 focus:ring-gold-500"
                  />
                  <span className="font-semibold text-navy-800 dark:text-navy-200">
                    Mark as Urgent / Important Broadcast (Triggers real-time notification to all students)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border border-navy-200 dark:border-navy-700 rounded-lg text-navy-700 dark:text-navy-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-navy-900 text-gold-400 dark:bg-gold-600 dark:text-white font-bold rounded-lg shadow-md"
                >
                  {submitting ? 'Publishing...' : 'Publish Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
