import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Check,
  X,
  Eye,
  AlertTriangle,
  Clock,
  Filter
} from 'lucide-react';
import api from '../../api/client';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { PDFViewerModal } from '../../components/pdf/PDFViewerModal';
import { useNotification } from '../../contexts/NotificationContext';

export const NotesModerationPage = () => {
  const { setToast } = useNotification();
  const [status, setStatus] = useState('PENDING');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reject modal state
  const [rejectModal, setRejectModal] = useState({ isOpen: false, noteId: null, noteTitle: '', reason: '' });

  // PDF Preview
  const [previewModal, setPreviewModal] = useState({ isOpen: false, fileUrl: '', title: '' });

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/notes/admin/all?status=${status}`);
      if (response.success && response.data) {
        setNotes(response.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [status]);

  const handleApprove = async (id) => {
    try {
      const res = await api.post(`/notes/admin/${id}/approve`);
      if (res.success) {
        setToast({ title: 'Note Approved', message: 'Study note has been approved and published to the academic library.', type: 'APPROVAL' });
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModal.reason.trim()) return;

    try {
      const res = await api.post(`/notes/admin/${rejectModal.noteId}/reject`, {
        reason: rejectModal.reason
      });
      if (res.success) {
        setToast({ title: 'Note Rejected', message: 'Rejection notice and reason delivered to student.', type: 'REJECTION' });
        setRejectModal({ isOpen: false, noteId: null, noteTitle: '', reason: '' });
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Quality Assurance
          </span>
          <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
            Study Notes Moderation Queue
          </h1>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl p-1 text-xs">
          {['PENDING', 'APPROVED', 'REJECTED'].map((st) => (
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

      {/* Moderation Table */}
      {loading ? (
        <TableSkeleton />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={`No ${status.toLowerCase()} study notes`}
          description="The moderation queue is currently clear for this status."
        />
      ) : (
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-200 dark:border-navy-800 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-navy-100 dark:divide-navy-800">
              <thead className="bg-navy-50 dark:bg-navy-800/50 text-navy-500 font-semibold">
                <tr>
                  <th className="px-5 py-3">Resource Details</th>
                  <th className="px-5 py-3">Subject & Course</th>
                  <th className="px-5 py-3">Student Contributor</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800/60">
                {notes.map((note) => (
                  <tr key={note.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/30 transition">
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="font-semibold text-navy-900 dark:text-white truncate">{note.title}</p>
                      <p className="text-[11px] text-navy-500 line-clamp-1 mt-0.5">{note.description}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-gold-600 dark:text-gold-400 block font-semibold">
                        {note.subject?.code}
                      </span>
                      <span className="text-navy-700 dark:text-navy-300 block">{note.subject?.name}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-navy-900 dark:text-white">{note.uploadedBy?.fullName}</p>
                      <p className="text-[11px] text-navy-500 truncate">{note.uploadedBy?.collegeName || note.uploadedBy?.email}</p>
                    </td>

                    <td className="px-5 py-3.5 text-navy-400 text-[11px]">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewModal({ isOpen: true, fileUrl: note.fileUrl, title: note.title })}
                          className="p-1.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 rounded-lg text-navy-700 dark:text-navy-300"
                          title="Preview Note Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {note.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleApprove(note.id)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm"
                            title="Approve & Publish"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {note.status !== 'REJECTED' && (
                          <button
                            onClick={() =>
                              setRejectModal({
                                isOpen: true,
                                noteId: note.id,
                                noteTitle: note.title,
                                reason: ''
                              })
                            }
                            className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm"
                            title="Reject Note"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-md w-full p-6 border border-navy-200 dark:border-navy-700 shadow-2xl space-y-4 text-xs">
            <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white">
              Reject Note Submission
            </h3>
            <p className="text-navy-500">
              Provide feedback for <strong className="text-navy-800 dark:text-navy-200">"{rejectModal.noteTitle}"</strong>. This message will be sent to the student author.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  rows="3"
                  required
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  placeholder="e.g. Incomplete case law analysis for Unit 2; unreadable scan quality; syllabus mismatch with KSLU curriculum..."
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal({ isOpen: false, noteId: null, noteTitle: '', reason: '' })}
                  className="px-3 py-1.5 border border-navy-200 dark:border-navy-700 rounded-lg text-navy-700 dark:text-navy-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg"
                >
                  Confirm Rejection
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
        onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', title: '' })}
      />
    </div>
  );
};
