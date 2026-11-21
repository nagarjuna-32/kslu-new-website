import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Download,
  AlertTriangle,
  CheckCircle2,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  User,
  ShieldCheck,
  X
} from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const NoteDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { setToast } = useNotification();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('PLAGIARISM');
  const [reportDetails, setReportDetails] = useState('');

  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/notes/${id}`);
        if (response.success && response.data?.note) {
          setNote(response.data.note);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      setToast({ title: 'Sign In Required', message: 'Please log in to vote on notes.', type: 'info' });
      return;
    }
    try {
      const res = await api.post(`/notes/${id}/vote`, { voteType });
      if (res.success && res.data) {
        setNote(prev => ({
          ...prev,
          upvotesCount: res.data.upvotesCount,
          downvotesCount: res.data.downvotesCount,
          userVote: res.data.userVote
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      setToast({ title: 'Sign In Required', message: 'Please log in to bookmark notes.', type: 'info' });
      return;
    }
    try {
      const res = await api.post(`/notes/${id}/bookmark`);
      if (res.success) {
        setNote(prev => ({ ...prev, isBookmarked: res.data.isBookmarked }));
        setToast({ title: res.data.isBookmarked ? 'Bookmarked' : 'Bookmark Removed', message: res.message, type: 'info' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setToast({ title: 'Sign In Required', message: 'Please log in to report a note.', type: 'info' });
      return;
    }
    try {
      const res = await api.post(`/notes/${id}/report`, { reason: reportReason, details: reportDetails });
      if (res.success) {
        setToast({ title: 'Report Submitted', message: 'Moderators will review this resource.', type: 'APPROVAL' });
        setReportModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-10"><CardSkeleton /></div>;
  if (!note) return <div className="text-center py-16"><h2 className="text-lg font-bold">Study Note not found</h2></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-navy-500">
        <Link to="/" className="hover:text-navy-900 dark:hover:text-white">Home</Link>
        <span>/</span>
        <Link to="/notes" className="hover:text-navy-900 dark:hover:text-white">Study Notes</Link>
        <span>/</span>
        <span className="text-navy-800 dark:text-navy-200 font-semibold truncate max-w-sm">{note.title}</span>
      </div>

      {/* Header Info Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified by Academic Moderator</span>
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
                {note.subject?.code}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
              {note.title}
            </h1>

            <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-400">
              {note.course?.name} • {note.semester?.title} • {note.subject?.name}
            </p>

            <p className="text-xs text-navy-700 dark:text-navy-300 leading-relaxed pt-2">
              {note.description}
            </p>

            {note.tags && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {note.tags.split(',').map((t, i) => (
                  <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-400 border border-navy-100 dark:border-navy-700">
                    #{t.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleBookmark}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  note.isBookmarked
                    ? 'border-gold-500 text-gold-600 bg-gold-50 dark:bg-gold-950/40'
                    : 'border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-300'
                }`}
              >
                <Bookmark className="w-4 h-4" fill={note.isBookmarked ? 'currentColor' : 'none'} />
                <span>{note.isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>

              <a
                href={`/api/notes/${id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Note</span>
              </a>
            </div>

            {/* Voting buttons */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => handleVote('UPVOTE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
                  note.userVote === 'UPVOTE'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-400'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Helpful ({note.upvotesCount})</span>
              </button>

              <button
                onClick={() => handleVote('DOWNVOTE')}
                className={`p-1.5 rounded-xl border transition ${
                  note.userVote === 'DOWNVOTE'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                    : 'border-navy-200 dark:border-navy-700 text-navy-400'
                }`}
                title="Downvote"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="p-1.5 text-navy-400 hover:text-rose-500 rounded-xl"
                title="Report Resource"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contributor Card Footer */}
        <div className="pt-4 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between text-xs text-navy-500">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-navy-900 text-gold-400 flex items-center justify-center font-bold text-xs">
              {note.uploadedBy?.fullName ? note.uploadedBy.fullName[0].toUpperCase() : 'S'}
            </div>
            <div>
              <span className="font-semibold text-navy-800 dark:text-navy-200">{note.uploadedBy?.fullName}</span>
              <span className="text-navy-400 block text-[11px]">{note.uploadedBy?.collegeName || 'Student Scholar'}</span>
            </div>
          </div>
          <span>{note.downloadCount} Total Downloads</span>
        </div>
      </div>

      {/* PDF Document Viewer */}
      <div className={`bg-white dark:bg-navy-900 rounded-3xl border border-navy-200 dark:border-navy-800 overflow-hidden shadow-lg flex flex-col ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[750px]'
      }`}>
        <div className="flex items-center justify-between px-5 py-3 bg-navy-900 text-white text-xs">
          <div className="flex items-center gap-2 truncate mr-4">
            <BookOpen className="w-4 h-4 text-gold-400 shrink-0" />
            <span className="font-semibold truncate">{note.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setZoom(prev => Math.max(prev - 25, 50))} className="p-1.5 hover:bg-navy-800 rounded-lg text-navy-300 hover:text-white"><ZoomOut className="w-4 h-4" /></button>
            <span className="font-mono text-xs text-navy-300 min-w-[40px] text-center">{zoom}%</span>
            <button onClick={() => setZoom(prev => Math.min(prev + 25, 200))} className="p-1.5 hover:bg-navy-800 rounded-lg text-navy-300 hover:text-white"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={() => setZoom(100)} className="p-1.5 hover:bg-navy-800 rounded-lg text-navy-300 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
            <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-1.5 hover:bg-navy-800 rounded-lg text-navy-300 hover:text-white ml-2">
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-navy-100 dark:bg-navy-950 overflow-auto p-4 flex items-center justify-center">
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="w-full h-full max-w-4xl bg-white shadow-xl rounded-lg overflow-hidden transition-transform duration-150"
          >
            <iframe src={`${note.fileUrl}#toolbar=0&navpanes=0`} className="w-full h-full border-0 min-h-[600px]" title={note.title} />
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-md w-full p-6 border border-navy-200 dark:border-navy-700 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Flag Study Resource</span>
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-navy-400 hover:text-navy-700"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Reason</label>
                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl">
                  <option value="PLAGIARISM">Plagiarism</option>
                  <option value="MISINFORMATION">Legal Misinformation</option>
                  <option value="INAPPROPRIATE">Inappropriate Content</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Details</label>
                <textarea rows="3" value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Provide context..." className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl"></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setReportModalOpen(false)} className="px-3 py-1.5 border border-navy-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-lg">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
