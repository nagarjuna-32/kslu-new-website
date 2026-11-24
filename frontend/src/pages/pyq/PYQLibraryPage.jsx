import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Eye,
  Bookmark,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { PDFViewerModal } from '../../components/pdf/PDFViewerModal';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const PYQLibraryPage = () => {
  const { isAuthenticated } = useAuth();
  const { setToast } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schemes, setSchemes] = useState([]);

  const [pyqs, setPyqs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters state from URL query
  const courseId = searchParams.get('courseId') || '';
  const semesterId = searchParams.get('semesterId') || '';
  const subjectId = searchParams.get('subjectId') || '';
  const schemeId = searchParams.get('schemeId') || '';
  const examYear = searchParams.get('examYear') || '';
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // PDF Viewer Modal state
  const [previewModal, setPreviewModal] = useState({ isOpen: false, fileUrl: '', title: '', id: null });

  // 1. Fetch metadata filters (courses, schemes) on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          api.get('/academic/courses'),
          api.get('/academic/schemes')
        ]);
        if (cRes.success) setCourses(cRes.data.courses || []);
        if (sRes.success) setSchemes(sRes.data.schemes || []);
      } catch (err) {
        console.error('Failed to load filter metadata', err);
      }
    };
    fetchMetadata();
  }, []);

  // 2. Fetch semesters when courseId changes
  useEffect(() => {
    if (courseId) {
      api.get(`/academic/courses/${courseId}/semesters`)
        .then(res => setSemesters(res.data?.semesters || []))
        .catch(() => setSemesters([]));
    } else {
      setSemesters([]);
    }
  }, [courseId]);

  // 3. Fetch subjects when courseId / semesterId changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (semesterId) params.append('semesterId', semesterId);

    api.get(`/academic/subjects?${params.toString()}`)
      .then(res => setSubjects(res.data?.subjects || []))
      .catch(() => setSubjects([]));
  }, [courseId, semesterId]);

  // 4. Fetch PYQs list
  useEffect(() => {
    const fetchPYQs = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(searchParams);
        const response = await api.get(`/pyqs?${query.toString()}`);
        if (response.success && response.data) {
          setPyqs(response.data.items || []);
          setPagination(response.data.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      } catch (err) {
        console.error('Failed to load question papers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPYQs();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key === 'courseId') {
      next.delete('semesterId');
      next.delete('subjectId');
    } else if (key === 'semesterId') {
      next.delete('subjectId');
    }
    // Reset page to 1 on filter change
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Toggle bookmark handler
  const handleToggleBookmark = async (pyqId) => {
    if (!isAuthenticated) {
      setToast({
        title: 'Authentication Required',
        message: 'Please sign in to save question papers to your bookmarks.',
        type: 'info'
      });
      return;
    }
    try {
      const res = await api.post(`/pyqs/${pyqId}/bookmark`);
      if (res.success) {
        setPyqs(prev =>
          prev.map(p => (p.id === pyqId ? { ...p, isBookmarked: res.data.isBookmarked } : p))
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

  const handleDownload = (pyq) => {
    window.open(`/api/pyqs/${pyq.id}/download`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
          Academic Question Paper Archive
        </span>
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white mt-1">
          Previous Year Question Papers (PYQs)
        </h1>
        <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-400 mt-1">
          Browse, preview, and download authenticated KSLU semester examination question papers under Scheme 80 Marks and Scheme 100 Marks.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
        {/* Search input + Sort bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search by title, subject name, or code (e.g. 1011, Constitutional Law)..."
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
              <option value="examYear">Sort: Exam Year</option>
              <option value="downloads">Sort: Most Downloaded</option>
              <option value="views">Sort: Most Viewed</option>
            </select>

            <button
              onClick={resetFilters}
              className="p-2 text-navy-500 hover:text-rose-500 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-xl transition"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-navy-100 dark:border-navy-800 text-xs">
          {/* Course */}
          <div>
            <label className="block text-[11px] font-semibold text-navy-500 mb-1">Course</label>
            <select
              value={courseId}
              onChange={(e) => {
                updateFilter('courseId', e.target.value);
                updateFilter('semesterId', '');
                updateFilter('subjectId', '');
              }}
              className="w-full px-2.5 py-1.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-lg text-navy-800 dark:text-navy-200 focus:outline-none"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-[11px] font-semibold text-navy-500 mb-1">Semester</label>
            <select
              value={semesterId}
              onChange={(e) => {
                updateFilter('semesterId', e.target.value);
                updateFilter('subjectId', '');
              }}
              disabled={!courseId}
              className="w-full px-2.5 py-1.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-lg text-navy-800 dark:text-navy-200 focus:outline-none disabled:opacity-50"
            >
              <option value="">All Semesters</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-semibold text-navy-500 mb-1">Subject</label>
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

          {/* Scheme */}
          <div>
            <label className="block text-[11px] font-semibold text-navy-500 mb-1">Marking Scheme</label>
            <select
              value={schemeId}
              onChange={(e) => updateFilter('schemeId', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-lg text-navy-800 dark:text-navy-200 focus:outline-none"
            >
              <option value="">All Schemes</option>
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Year */}
          <div>
            <label className="block text-[11px] font-semibold text-navy-500 mb-1">Exam Year</label>
            <select
              value={examYear}
              onChange={(e) => updateFilter('examYear', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-lg text-navy-800 dark:text-navy-200 focus:outline-none"
            >
              <option value="">All Years</option>
              {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-navy-500">
        <span>Found {pagination.total} authenticated question papers</span>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
      </div>

      {/* Question Papers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : pyqs.length === 0 ? (
        <EmptyState
          title="No question papers match your filters"
          description="Try choosing a different course, clearing the subject selection, or resetting the search filters."
          action={
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-navy-900 text-gold-400 text-xs font-semibold rounded-xl"
            >
              Reset All Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pyqs.map((paper) => (
            <div
              key={paper.id}
              className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Badges bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-100 dark:bg-gold-950/60 text-gold-700 dark:text-gold-400 border border-gold-300 dark:border-gold-800/80">
                      {paper.scheme?.name || 'Scheme 80 Marks'}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
                      {paper.examType}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => handleToggleBookmark(paper.id)}
                    className={`p-1.5 rounded-lg transition ${
                      paper.isBookmarked
                        ? 'text-gold-500 bg-gold-50 dark:bg-gold-950/40'
                        : 'text-navy-400 hover:text-gold-500 hover:bg-navy-100 dark:hover:bg-navy-800'
                    }`}
                    title={paper.isBookmarked ? 'Remove Bookmark' : 'Save to Bookmarks'}
                  >
                    <Bookmark className="w-4 h-4" fill={paper.isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Title & Subject */}
                <div>
                  <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition line-clamp-2">
                    {paper.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-navy-500">
                    <span className="font-mono font-semibold text-navy-700 dark:text-navy-300">
                      Code: {paper.subject?.code}
                    </span>
                    <span>•</span>
                    <span className="truncate">{paper.subject?.name}</span>
                  </div>
                </div>

                {/* Academic Metadata */}
                <div className="bg-navy-50 dark:bg-navy-800/40 rounded-xl p-2.5 text-[11px] text-navy-600 dark:text-navy-400 grid grid-cols-2 gap-2">
                  <div>
                    <span className="block font-medium text-navy-400">Course / Sem</span>
                    <span className="text-navy-800 dark:text-navy-200 truncate block">
                      {paper.course?.code} ({paper.semester?.title})
                    </span>
                  </div>
                  <div>
                    <span className="block font-medium text-navy-400">Examination</span>
                    <span className="text-navy-800 dark:text-navy-200 block">
                      {paper.examMonth} {paper.examYear}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-navy-400 font-mono">
                  {paper.downloadCount} downloads
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPreviewModal({
                        isOpen: true,
                        fileUrl: paper.fileUrl,
                        title: paper.title,
                        id: paper.id
                      })
                    }
                    className="flex items-center gap-1 px-3 py-1.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-800 dark:text-navy-200 rounded-lg font-medium transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleDownload(paper)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white dark:bg-gold-600 dark:hover:bg-gold-500 font-medium rounded-lg transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
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

      {/* PDF Preview Modal */}
      <PDFViewerModal
        isOpen={previewModal.isOpen}
        fileUrl={previewModal.fileUrl}
        title={previewModal.title}
        onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', title: '', id: null })}
        onDownload={() => {
          if (previewModal.id) {
            window.open(`/api/pyqs/${previewModal.id}/download`, '_blank');
          }
        }}
      />
    </div>
  );
};
