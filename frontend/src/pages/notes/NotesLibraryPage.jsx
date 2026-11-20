import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Download,
  Eye,
  Bookmark,
  Upload,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { PDFViewerModal } from '../../components/pdf/PDFViewerModal';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const NotesLibraryPage = () => {
  const { isAuthenticated } = useAuth();
  const { setToast } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Report Modal state
  const [reportModal, setReportModal] = useState({ isOpen: false, noteId: null, reason: 'PLAGIARISM', details: '' });

  // PDF Preview Modal
  const [previewModal, setPreviewModal] = useState({ isOpen: false, fileUrl: '', title: '', id: null });

  const courseId = searchParams.get('courseId') || '';
  const subjectId = searchParams.get('subjectId') || '';
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          api.get('/academic/courses'),
          api.get('/academic/subjects')
        ]);
        if (cRes.success) setCourses(cRes.data.courses || []);
        if (sRes.success) setSubjects(sRes.data.subjects || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(searchParams);
        const response = await api.get(`/notes?${query.toString()}`);
        if (response.success && response.data) {
          setNotes(response.data.items || []);
          setPagination(response.data.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      } catch (err) {
        console.error('Failed to load study notes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const handleVote = async (noteId, voteType) => {
    if (!isAuthenticated) {
      setToast({
        title: 'Authentication Required',
        message: 'Please sign in to vote on academic study notes.',
        type: 'info'
      });
      return;
    }
    try {
      const res = await api.post(`/notes/${noteId}/vote`, { voteType });
      if (res.success && res.data) {
        setNotes(prev =>
          prev.map(n =>
            n.id === noteId
              ? {
                  ...n,
                  upvotesCount: res.data.upvotesCount,
                  downvotesCount: res.data.downvotesCount,
                  userVote: res.data.userVote
                }
              : n
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async (noteId) => {
    if (!isAuthenticated) {
      setToast({
        title: 'Authentication Required',
        message: 'Please sign in to bookmark notes.',
        type: 'info'
      });
      return;
    }
    try {
      const res = await api.post(`/notes/${noteId}/bookmark`);
      if (res.success) {
        setNotes(prev =>
          prev.map(n => (n.id === noteId ? { ...n, isBookmarked: res.data.isBookmarked } : n))
        );
        setToast({
          title: res.data.isBookmarked ? 'Bookmarked' : 'Removed Bookmark',
          message: res.message,
          type: 'info'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setToast({ title: 'Sign In Required', message: 'Please log in to report a resource.', type: 'info' });
      return;
    }
    try {
      const res = await api.post(`/notes/${reportModal.noteId}/report`, {
        reason: reportModal.reason,
        details: reportModal.details
      });
      if (res.success) {
        setToast({
          title: 'Report Submitted',
          message: 'Thank you. Moderators will review this material.',
          type: 'APPROVAL'
        });
        setReportModal({ isOpen: false, noteId: null, reason: 'PLAGIARISM', details: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Student Peer-Knowledge Repository
          </span>
          <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white mt-1">
            Verified Study Notes Library
          </h1>
          <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-400 mt-1">
            Student-contributed lecture summaries, doctrine syntheses, and exam preparation notes reviewed for curriculum accuracy.
          </p>
        </div>

        <Link
          to="/notes/upload"
          className="flex items-center gap-2 px-4 py-2.5 bg-gold-600 hover:bg-gold-500 text-white text-xs font-bold rounded-xl shadow-md transition shrink-0 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Contribute Notes</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search by note topic, keywords (e.g. Article 21, Strict Liability, Puttaswamy)..."
              className="w-full pl-10 pr-4 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <select
              value={sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-800 dark:text-navy-200 focus:outline-none"
            >
              <option value="createdAt">Sort: Latest Uploaded</option>
              <option value="upvotes">Sort: Most Upvoted</option>
              <option value="downloads">Sort: Most Downloaded</option>
            </select>

            <button
              onClick={() => setSearchParams(new URLSearchParams())}
              className="p-2 text-navy-500 hover:text-rose-500 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-xl transition"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-navy-100 dark:border-navy-800 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-navy-500 mb-1">Filter by Course</label>
            <select
              value={courseId}
              onChange={(e) => updateFilter('courseId', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-lg text-navy-800 dark:text-navy-200 focus:outline-none"
            >
              <option value="">All Law Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-navy-500 mb-1">Filter by Subject</label>
            <select
              value={subjectId}
              onChange={(e) => updateFilter('subjectId', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-lg text-navy-800 dark:text-navy-200 focus:outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-navy-500">
        <span>Displaying {pagination.total} approved study notes</span>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          title="No study notes found"
          description="Be the first student to upload study notes for this subject and assist your peers."
          action={
            <Link
              to="/notes/upload"
              className="px-4 py-2 bg-gold-600 text-white text-xs font-semibold rounded-xl inline-block"
            >
              Upload Notes Now
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Note</span>
                  </span>

                  <button
                    onClick={() => handleToggleBookmark(note.id)}
                    className={`p-1.5 rounded-lg transition ${
                      note.isBookmarked
                        ? 'text-gold-500 bg-gold-50 dark:bg-gold-950/40'
                        : 'text-navy-400 hover:text-gold-500 hover:bg-navy-100 dark:hover:bg-navy-800'
                    }`}
                    title={note.isBookmarked ? 'Remove Bookmark' : 'Save to Bookmarks'}
                  >
                    <Bookmark className="w-4 h-4" fill={note.isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Title & Subject */}
                <div>
                  <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition line-clamp-2">
                    {note.title}
                  </h3>
                  <p className="text-xs text-navy-500 mt-1">
                    {note.subject?.name} ({note.subject?.code})
                  </p>
                </div>

                <p className="text-xs text-navy-600 dark:text-navy-400 line-clamp-3 leading-relaxed">
                  {note.description}
                </p>

                {/* Author attribution */}
                <div className="pt-2 text-[11px] text-navy-500 flex items-center justify-between">
                  <span className="truncate">By {note.uploadedBy?.fullName || 'Student Contributor'}</span>
                  <span className="shrink-0">{note.downloadCount} downloads</span>
                </div>
              </div>

              {/* Voting and Actions Footer */}
              <div className="pt-4 mt-4 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between text-xs">
                {/* Upvote & Downvote buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleVote(note.id, 'UPVOTE')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
                      note.userVote === 'UPVOTE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold'
                        : 'hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-600 dark:text-navy-400'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{note.upvotesCount}</span>
                  </button>

                  <button
                    onClick={() => handleVote(note.id, 'DOWNVOTE')}
                    className={`p-1 rounded-lg transition ${
                      note.userVote === 'DOWNVOTE'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        : 'hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-400'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setPreviewModal({
                        isOpen: true,
                        fileUrl: note.fileUrl,
                        title: note.title,
                        id: note.id
                      })
                    }
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-800 dark:text-navy-200 rounded-lg font-medium transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <a
                    href={`/api/notes/${note.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-white dark:bg-gold-600 dark:hover:bg-gold-500 font-medium rounded-lg transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>

                  <button
                    onClick={() => setReportModal({ isOpen: true, noteId: note.id, reason: 'PLAGIARISM', details: '' })}
                    className="p-1.5 text-navy-400 hover:text-rose-500 rounded-lg transition"
                    title="Report Resource"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => updateFilter('page', String(pagination.page - 1))}
            disabled={!pagination.hasPrevPage}
            className="p-2 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-700 dark:text-navy-300 disabled:opacity-40 hover:bg-navy-100 dark:hover:bg-navy-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-4 py-2 bg-navy-100 dark:bg-navy-800 rounded-xl text-navy-800 dark:text-navy-200">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => updateFilter('page', String(pagination.page + 1))}
            disabled={!pagination.hasNextPage}
            className="p-2 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-700 dark:text-navy-300 disabled:opacity-40 hover:bg-navy-100 dark:hover:bg-navy-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Report Resource Modal */}
      {reportModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-md w-full p-6 border border-navy-200 dark:border-navy-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-navy-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Report Study Resource</span>
              </h3>
              <button
                onClick={() => setReportModal({ isOpen: false, noteId: null, reason: 'PLAGIARISM', details: '' })}
                className="text-navy-400 hover:text-navy-700 dark:hover:text-navy-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-navy-700 dark:text-navy-300 mb-1">Reason for Report</label>
                <select
                  value={reportModal.reason}
                  onChange={(e) => setReportModal({ ...reportModal, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white"
                >
                  <option value="PLAGIARISM">Plagiarism / Uncredited Content</option>
                  <option value="INAPPROPRIATE">Inappropriate / Harmful Content</option>
                  <option value="MISINFORMATION">Substantial Legal Inaccuracy</option>
                  <option value="COPYRIGHT">Copyright Violation</option>
                  <option value="OTHER">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-navy-700 dark:text-navy-300 mb-1">Additional Details (Optional)</label>
                <textarea
                  rows="3"
                  value={reportModal.details}
                  onChange={(e) => setReportModal({ ...reportModal, details: e.target.value })}
                  placeholder="Provide any context that helps the academic moderators..."
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModal({ isOpen: false, noteId: null, reason: 'PLAGIARISM', details: '' })}
                  className="px-3 py-1.5 rounded-lg border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      <PDFViewerModal
        isOpen={previewModal.isOpen}
        fileUrl={previewModal.fileUrl}
        title={previewModal.title}
        onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', title: '', id: null })}
        onDownload={() => {
          if (previewModal.id) {
            window.open(`/api/notes/${previewModal.id}/download`, '_blank');
          }
        }}
      />
    </div>
  );
};
