import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle2,
  X,
  Cloud
} from 'lucide-react';
import api from '../../api/client';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { PDFViewerModal } from '../../components/pdf/PDFViewerModal';
import { useNotification } from '../../contexts/NotificationContext';

export const PYQManagementPage = () => {
  const { setToast } = useNotification();
  const [pyqs, setPyqs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [schemeId, setSchemeId] = useState('');
  const [examYear, setExamYear] = useState('2024');
  const [examMonth, setExamMonth] = useState('December');
  const [examType, setExamType] = useState('REGULAR');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Preview modal
  const [previewModal, setPreviewModal] = useState({ isOpen: false, fileUrl: '', title: '' });

  const fetchPYQs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pyqs?limit=50');
      if (res.success && res.data) {
        setPyqs(res.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPYQs();
    api.get('/academic/courses').then(res => setCourses(res.data?.courses || []));
    api.get('/academic/schemes').then(res => setSchemes(res.data?.schemes || []));
  }, []);

  useEffect(() => {
    setSemesterId('');
    setSubjectId('');
    setSubjects([]);
    if (courseId) {
      api.get(`/academic/courses/${courseId}/semesters`)
        .then(res => setSemesters(res.data?.semesters || []))
        .catch(() => setSemesters([]));
    } else {
      setSemesters([]);
    }
  }, [courseId]);

  useEffect(() => {
    setSubjectId('');
    if (courseId && semesterId) {
      api.get(`/academic/subjects?courseId=${courseId}&semesterId=${semesterId}`)
        .then(res => setSubjects(res.data?.subjects || []))
        .catch(() => setSubjects([]));
    } else {
      setSubjects([]);
    }
  }, [courseId, semesterId]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a PDF file.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('courseId', courseId);
      formData.append('semesterId', semesterId);
      formData.append('subjectId', subjectId);
      formData.append('schemeId', schemeId);
      formData.append('examYear', examYear);
      formData.append('examMonth', examMonth);
      formData.append('examType', examType);
      formData.append('file', file);

      const res = await api.post('/pyqs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        setToast({ title: 'PYQ Published', message: 'Question paper added to archive.', type: 'APPROVAL' });
        setUploadModalOpen(false);
        setTitle('');
        setFile(null);
        fetchPYQs();
      }
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, pyqTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${pyqTitle}"?`)) return;
    try {
      await api.delete(`/pyqs/${id}`);
      setToast({ title: 'Deleted', message: 'Question paper removed.', type: 'info' });
      fetchPYQs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Repository Management
          </span>
          <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
            Question Papers (PYQ) Management
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/admin/drive-sync"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-800 dark:text-navy-200 text-xs font-bold rounded-xl border border-navy-200 dark:border-navy-700 transition"
          >
            <Cloud className="w-4 h-4 text-gold-500" />
            <span>Google Drive Sync</span>
          </Link>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Official Question Paper</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-200 dark:border-navy-800 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-navy-100 dark:divide-navy-800">
              <thead className="bg-navy-50 dark:bg-navy-800/50 text-navy-500 font-semibold">
                <tr>
                  <th className="px-5 py-3">Paper Title</th>
                  <th className="px-5 py-3">Subject & Code</th>
                  <th className="px-5 py-3">Course / Sem</th>
                  <th className="px-5 py-3">Scheme</th>
                  <th className="px-5 py-3">Exam Session</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800/60">
                {pyqs.map((p) => (
                  <tr key={p.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/30 transition">
                    <td className="px-5 py-3.5 font-semibold text-navy-900 dark:text-white max-w-xs truncate">
                      {p.title}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-gold-600 dark:text-gold-400 block font-semibold">{p.subject?.code}</span>
                      <span className="text-navy-600 dark:text-navy-400">{p.subject?.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.course?.code} ({p.semester?.title})
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-[10px] font-semibold">
                        {p.scheme?.name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.examMonth} {p.examYear} ({p.examType})
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewModal({
                            isOpen: true,
                            fileUrl: p.driveFileId ? `/api/pyqs/${p.id}/stream` : p.fileUrl,
                            title: p.title
                          })}
                          className="p-1.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 rounded-lg text-navy-700 dark:text-navy-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-lg w-full p-6 border border-navy-200 dark:border-navy-700 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white">
                Upload Question Paper
              </h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-navy-400 hover:text-navy-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Paper Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Constitutional Law I - December 2024 (Regular)"
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Course *</label>
                  <select
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Semester *</label>
                  <select
                    required
                    disabled={!courseId}
                    value={semesterId}
                    onChange={(e) => setSemesterId(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Subject *</label>
                  <select
                    required
                    disabled={!semesterId}
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Scheme *</label>
                  <select
                    required
                    value={schemeId}
                    onChange={(e) => setSchemeId(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  >
                    <option value="">Select Scheme</option>
                    {schemes.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Exam Year *</label>
                  <input
                    type="number"
                    required
                    value={examYear}
                    onChange={(e) => setExamYear(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Month *</label>
                  <input
                    type="text"
                    required
                    value={examMonth}
                    onChange={(e) => setExamMonth(e.target.value)}
                    placeholder="December"
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="REVALUATION">Revaluation</option>
                    <option value="SUPPLEMENTARY">Supplementary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">PDF File *</label>
                <input
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3 py-1.5 border border-navy-200 dark:border-navy-700 rounded-lg text-navy-700 dark:text-navy-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-navy-900 text-gold-400 dark:bg-gold-600 dark:text-white font-bold rounded-lg shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Uploading...' : 'Publish Question Paper'}
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
