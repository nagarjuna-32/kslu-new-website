import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, ArrowLeft, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const UploadNotePage = () => {
  const { isAuthenticated } = useAuth();
  const { setToast } = useNotification();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [category, setCategory] = useState('STUDY_NOTES');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/academic/courses')
      .then(res => setCourses(res.data?.courses || []))
      .catch(console.error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a PDF or document file to upload.');
      return;
    }

    if (!courseId || !semesterId || !subjectId) {
      setError('Please select the course, semester, and subject.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('courseId', courseId);
      formData.append('semesterId', semesterId);
      formData.append('subjectId', subjectId);
      formData.append('category', category);
      formData.append('tags', tags);
      formData.append('file', file);

      const response = await api.post('/notes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.success) {
        setSuccess(true);
        setToast({
          title: 'Notes Submitted for Review',
          message: 'Your notes have been submitted and will appear in the library once verified.',
          type: 'APPROVAL'
        });
        setTimeout(() => {
          navigate('/dashboard/contributions');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload study note. Please verify file format and size.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to="/notes"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Study Notes Library</span>
      </Link>

      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-10 border border-navy-200 dark:border-navy-800 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Contribute to KSLU Circle
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white mt-1">
            Upload Law Study Notes
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Share handwritten lecture notes, case briefs, or model answer structures with your fellow students.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-12 space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">Submission Successful!</h3>
            <p className="text-xs text-navy-600 dark:text-navy-400 max-w-sm mx-auto">
              Your note has been submitted to our academic moderation queue. Redirecting you to your contributions...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Title */}
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1.5">
                Title of Study Material *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Article 21 & Due Process - Comprehensive Revision Notes"
                className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            {/* Hierarchy selection: Course -> Sem -> Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1.5">
                  Course *
                </label>
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
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1.5">
                  Semester *
                </label>
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

              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1.5">
                  Subject *
                </label>
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
            </div>

            {/* Notes Category */}
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1.5">
                Resource Category *
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="STUDY_NOTES">📖 Study Notes (General lecture notes, summaries, class notes)</option>
                <option value="IMPORTANT_QUESTIONS">❓ Important Questions (Probable examination questions, Q&A guides)</option>
                <option value="REFERENCE_BOOKS">📚 Reference Books (Recommended textbooks, reading materials)</option>
                <option value="CASE_LAWS">⚖️ Case Laws (Landmark judgments, case briefs, precedents)</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1.5">
                Description & Key Topics Covered *
              </label>
              <textarea
                rows="4"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention which landmark cases are analyzed, whether it follows Scheme 80 Marks or Scheme 100 Marks, and how it helps in exams..."
                className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              ></textarea>
            </div>

            {/* Tags */}
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1.5">
                Tags / Key Concepts (Comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. Fundamental Rights, Maneka Gandhi, Article 21, Due Process"
                className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            {/* PDF File Picker */}
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1.5">
                Attach Document / PDF File (Max 25MB) *
              </label>
              <div className="border-2 border-dashed border-navy-200 dark:border-navy-700 rounded-2xl p-6 text-center hover:border-gold-500 dark:hover:border-gold-400 transition cursor-pointer bg-navy-50 dark:bg-navy-800/40">
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.doc,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="note-file-input"
                />
                <label htmlFor="note-file-input" className="cursor-pointer space-y-2 block">
                  <FileText className="w-8 h-8 text-gold-600 dark:text-gold-400 mx-auto" />
                  <p className="text-xs font-semibold text-navy-800 dark:text-navy-200">
                    {file ? file.name : 'Click to select or drag and drop your PDF'}
                  </p>
                  <p className="text-[11px] text-navy-400">
                    PDF format preferred for seamless in-browser preview
                  </p>
                </label>
              </div>
            </div>

            {/* Submission button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white text-xs font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Uploading and processing...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Submit Notes for Academic Moderation</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
