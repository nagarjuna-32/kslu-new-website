import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, FileText, BookOpen, Download, Eye, Trash2 } from 'lucide-react';
import api from '../../api/client';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { PDFViewerModal } from '../../components/pdf/PDFViewerModal';
import { useNotification } from '../../contexts/NotificationContext';

export const MyBookmarksPage = () => {
  const { setToast } = useNotification();
  const [activeTab, setActiveTab] = useState('pyqs'); // 'pyqs' or 'notes'
  const [bookmarkedPyqs, setBookmarkedPyqs] = useState([]);
  const [bookmarkedNotes, setBookmarkedNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // PDF Preview
  const [previewModal, setPreviewModal] = useState({ isOpen: false, fileUrl: '', title: '', id: null });

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const [pyqRes, notesRes] = await Promise.all([
        api.get('/pyqs'),
        api.get('/notes')
      ]);

      if (pyqRes.success && pyqRes.data?.items) {
        setBookmarkedPyqs(pyqRes.data.items.filter(p => p.isBookmarked));
      }
      if (notesRes.success && notesRes.data?.items) {
        setBookmarkedNotes(notesRes.data.items.filter(n => n.isBookmarked));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (id, type) => {
    try {
      const endpoint = type === 'pyq' ? `/pyqs/${id}/bookmark` : `/notes/${id}/bookmark`;
      await api.post(endpoint);
      setToast({ title: 'Bookmark Removed', message: 'Item removed from your bookmarks.', type: 'info' });
      fetchBookmarks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Saved Academic Materials
          </span>
          <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
            My Bookmarked Resources
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('pyqs')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'pyqs'
                ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                : 'text-navy-600 dark:text-navy-400'
            }`}
          >
            Question Papers ({bookmarkedPyqs.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'notes'
                ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                : 'text-navy-600 dark:text-navy-400'
            }`}
          >
            Study Notes ({bookmarkedNotes.length})
          </button>
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : activeTab === 'pyqs' ? (
        bookmarkedPyqs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No question papers bookmarked"
            description="Browse the PYQ library and click the bookmark icon on any exam paper to save it here for fast revision."
            action={
              <Link to="/pyqs" className="px-4 py-2 bg-navy-900 text-gold-400 text-xs font-bold rounded-xl inline-block">
                Browse Question Papers
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {bookmarkedPyqs.map((paper) => (
              <div
                key={paper.id}
                className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-navy-200 dark:border-navy-800 shadow-sm flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-100 dark:bg-gold-950/60 text-gold-700 dark:text-gold-400">
                      {paper.scheme?.name}
                    </span>
                    <span className="font-mono text-navy-400">{paper.examMonth} {paper.examYear}</span>
                  </div>
                  <h4 className="font-semibold text-navy-900 dark:text-white truncate text-sm">
                    {paper.title}
                  </h4>
                  <p className="text-[11px] text-navy-500">{paper.subject?.name} ({paper.subject?.code})</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      setPreviewModal({
                        isOpen: true,
                        fileUrl: paper.fileUrl,
                        title: paper.title,
                        id: paper.id
                      })
                    }
                    className="p-2 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 rounded-lg text-navy-700 dark:text-navy-300"
                    title="Preview PDF"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={`/api/pyqs/${paper.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-navy-900 hover:bg-navy-800 text-white dark:bg-gold-600 rounded-lg"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleRemoveBookmark(paper.id, 'pyq')}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : bookmarkedNotes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No study notes bookmarked"
          description="Explore our student study notes library and bookmark high-yield lecture summaries."
          action={
            <Link to="/notes" className="px-4 py-2 bg-navy-900 text-gold-400 text-xs font-bold rounded-xl inline-block">
              Browse Study Notes
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {bookmarkedNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-navy-200 dark:border-navy-800 shadow-sm flex items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="font-semibold text-navy-900 dark:text-white truncate text-sm">
                  {note.title}
                </h4>
                <p className="text-[11px] text-navy-500">{note.subject?.name} • By {note.uploadedBy?.fullName}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    setPreviewModal({
                      isOpen: true,
                      fileUrl: note.fileUrl,
                      title: note.title,
                      id: note.id
                    })
                  }
                  className="p-2 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 rounded-lg text-navy-700 dark:text-navy-300"
                  title="Preview PDF"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <a
                  href={`/api/notes/${note.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-navy-900 hover:bg-navy-800 text-white dark:bg-gold-600 rounded-lg"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleRemoveBookmark(note.id, 'note')}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Preview Modal */}
      <PDFViewerModal
        isOpen={previewModal.isOpen}
        fileUrl={previewModal.fileUrl}
        title={previewModal.title}
        onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', title: '', id: null })}
      />
    </div>
  );
};
