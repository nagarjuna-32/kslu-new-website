import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, CheckCircle2, AlertTriangle, Clock, Plus, Eye } from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { PDFViewerModal } from '../../components/pdf/PDFViewerModal';

export const MyContributionsPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, fileUrl: '', title: '' });

  useEffect(() => {
    const fetchMyNotes = async () => {
      try {
        const response = await api.get('/notes/my-submissions');
        if (response.success && response.data) {
          setNotes(response.data.notes || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyNotes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Student Contributions
          </span>
          <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
            My Uploaded Study Notes
          </h1>
        </div>

        <Link
          to="/notes/upload"
          className="flex items-center gap-2 px-3.5 py-2 bg-gold-600 hover:bg-gold-500 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Notes</span>
        </Link>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="No study notes submitted yet"
          description="Help build Karnataka's largest peer law library by uploading lecture summaries, case briefs, and revision charts."
          action={
            <Link
              to="/notes/upload"
              className="px-4 py-2 bg-gold-600 text-white text-xs font-bold rounded-xl inline-block"
            >
              Upload Your First Note
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {note.status === 'APPROVED' && (
                    <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved & Live</span>
                    </span>
                  )}
                  {note.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Moderator Review</span>
                    </span>
                  )}
                  {note.status === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Changes Requested / Rejected</span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-navy-400">
                  Submitted on {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white">
                  {note.title}
                </h3>
                <p className="text-[11px] text-navy-500 mt-0.5">
                  {note.course?.name} • {note.semester?.title} • {note.subject?.name} ({note.subject?.code})
                </p>
              </div>

              <p className="text-navy-600 dark:text-navy-400 leading-relaxed">
                {note.description}
              </p>

              {note.status === 'REJECTED' && note.rejectionReason && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-300">
                  <span className="font-semibold block mb-0.5">Moderator Feedback:</span>
                  <span>{note.rejectionReason}</span>
                </div>
              )}

              <div className="pt-3 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between text-navy-500">
                <span>
                  {note.status === 'APPROVED' ? `${note.downloadCount} downloads • ${note.upvotesCount} upvotes` : 'Under review'}
                </span>
                <button
                  onClick={() => setPreviewModal({ isOpen: true, fileUrl: note.fileUrl, title: note.title })}
                  className="flex items-center gap-1 text-gold-600 dark:text-gold-400 font-semibold hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview PDF</span>
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
        onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', title: '' })}
      />
    </div>
  );
};
