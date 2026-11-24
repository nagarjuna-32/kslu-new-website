import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Library,
  Scale,
  ThumbsUp,
  Download,
  Eye,
  Bookmark,
  Upload,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText
} from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { PDFViewerModal } from '../../components/pdf/PDFViewerModal';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

// The 4 Core Academic Resource Categories with consistent styling
const NOTE_CATEGORIES = [
  {
    key: 'STUDY_NOTES',
    title: 'Study Notes',
    icon: BookOpen,
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/80',
  },
  {
    key: 'IMPORTANT_QUESTIONS',
    title: 'Important Questions',
    icon: HelpCircle,
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-800/80',
  },
  {
    key: 'REFERENCE_BOOKS',
    title: 'Reference Books',
    icon: Library,
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80',
  },
  {
    key: 'CASE_LAWS',
    title: 'Case Laws',
    icon: Scale,
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-400 border border-purple-300 dark:border-purple-800/80',
  }
];

export const NotesLibraryPage = () => {
  const { isAuthenticated } = useAuth();
  const { setToast } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters state from URL query
  const courseId = searchParams.get('courseId') || '';
  const semesterId = searchParams.get('semesterId') || '';
  const subjectId = searchParams.get('subjectId') || '';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // PDF Viewer Modal state
  const [previewModal, setPreviewModal] = useState({ isOpen: false, fileUrl: '', title: '', id: null });

  // 1. Fetch metadata filters (courses) on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/academic/courses');
        if (res.success && res.data?.courses) {
          const order = ['3YR-LLB', '5YR-BALLB', '5YR-BBALLB', '5YR-BCOMLLB', '5YR-BSCLB'];
          const sorted = [...res.data.courses].sort((a, b) => {
            const idxA = order.indexOf(a.code);
            const idxB = order.indexOf(b.code);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.name.localeCompare(b.name);
          });
          setCourses(sorted);
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      }
    };
    fetchCourses();
  }, []);

  // 2. Fetch semesters when courseId changes
  useEffect(() => {
    if (courseId) {
      api.get(`/academic/courses/${courseId}/semesters`)
        .then(res => {
          if (res.success && res.data?.semesters) {
            const sorted = (res.data.semesters || []).sort((a, b) => a.semesterNumber - b.semesterNumber);
            setSemesters(sorted);
          }
        })
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

  // 4. Fetch Study Notes list
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(searchParams);
        if (!query.has('limit')) query.set('limit', '12');
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

  const updateFilters = (updates) => {
    setSearchParams((prevParams) => {
      const next = new URLSearchParams(prevParams);
      Object.entries(updates).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          next.set(key, String(val));
        } else {
          next.delete(key);
        }
      });
      if (!('page' in updates)) {
        next.set('page', '1');
      }
      return next;
    });
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Upvote handler
  const handleVote = async (noteId) => {
    if (!isAuthenticated) {
      setToast({
        title: 'Authentication Required',
        message: 'Please sign in to upvote study notes.',
        type: 'info'
      });
      return;
    }
    try {
      const res = await api.post(`/notes/${noteId}/vote`, { voteType: 'UPVOTE' });
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

  // Toggle bookmark handler
  const handleToggleBookmark = async (noteId) => {
    if (!isAuthenticated) {
      setToast({
        title: 'Authentication Required',
        message: 'Please sign in to save study notes to your bookmarks.',
        type: 'info'
      });
      return;
    }
    try {
      const res = await api.post(`/notes/${noteId}/bookmark`);
      if (res.success) {
        setNotes(prev =>
          prev.map(p => (p.id === noteId ? { ...p, isBookmarked: res.data.isBookmarked } : p))
        );
        setToast({
          title: res.data.isBookmarked ? 'Bookmarked' : 'Removed Bookmark',
          message: res.message || (res.data.isBookmarked ? 'Saved to bookmarks.' : 'Removed from bookmarks.'),
          type: 'info'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = (note) => {
    if (note.isExternalLink && note.fileUrl) {
      window.open(note.fileUrl, '_blank');
      return;
    }
    window.open(`/api/notes/${note.id}/download`, '_blank');
  };

  const getCategoryDetails = (catKey) => {
    return NOTE_CATEGORIES.find(c => c.key === catKey) || {
      key: catKey,
      title: catKey ? catKey.replace('_', ' ') : 'General Notes',
      icon: BookOpen,
      badgeBg: 'bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300'
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Academic Resource Archive
          </span>
          <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white mt-1">
            Study Notes & Academic Materials
          </h1>
          <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-400 mt-1">
            Browse, preview, and download authenticated KSLU semester study materials, lecture summaries, important questions, reference books, and case laws.
          </p>
        </div>

        <Link
          to="/notes/upload"
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-600 hover:bg-gold-500 text-white text-xs font-bold rounded-xl shadow-md transition shrink-0 self-start sm:self-auto transform hover:-translate-y-0.5"
        >
          <Upload className="w-4 h-4" />
          <span>Contribute Notes</span>
        </Link>
      </div>

      {/* Filter Toolbar (Unified box matching PYQ Library) */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
        {/* Search input + Sort bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              placeholder="Search by title, subject name, topic, or code (e.g. Constitutional Law, KSLU-3Y-101)..."
              className="w-full pl-10 pr-4 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <select
              value={sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              className="px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-800 dark:text-navy-200 focus:outline-none"
            >
              <option value="createdAt">Sort: Latest Uploaded</option>
              <option value="upvotes">Sort: Highest Rated</option>
              <option value="downloads">Sort: Most Downloaded</option>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-navy-100 dark:border-navy-800 text-xs">
          {/* Course */}
          <div>
            <label className="block text-[11px] font-semibold text-navy-500 mb-1">Course</label>
            <select
              value={courseId}
              onChange={(e) => updateFilters({ courseId: e.target.value, semesterId: '', subjectId: '' })}
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
              onChange={(e) => updateFilters({ semesterId: e.target.value, subjectId: '' })}
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
              onChange={(e) => updateFilters({ subjectId: e.target.value })}
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

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-navy-500 mb-1">Resource Category</label>
            <select
              value={category}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-lg text-navy-800 dark:text-navy-200 focus:outline-none"
            >
              <option value="">All Categories</option>
              {NOTE_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => updateFilters({ category: '' })}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition shrink-0 ${
            !category
              ? 'bg-navy-900 text-gold-400 dark:bg-navy-800 dark:text-gold-400 shadow-sm'
              : 'bg-white dark:bg-navy-900 text-navy-700 dark:text-navy-300 border border-navy-200 dark:border-navy-800 hover:bg-navy-100 dark:hover:bg-navy-800'
          }`}
        >
          All Categories
        </button>
        {NOTE_CATEGORIES.map((cat) => {
          const isSelected = category === cat.key;
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => updateFilters({ category: cat.key })}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                isSelected
                  ? 'bg-navy-900 text-gold-400 dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                  : 'bg-white dark:bg-navy-900 text-navy-700 dark:text-navy-300 border border-navy-200 dark:border-navy-800 hover:bg-navy-100 dark:hover:bg-navy-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-navy-500">
        <span>Found {pagination.total} authenticated study materials</span>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
      </div>

      {/* Study Materials Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          title="No study materials match your filters"
          description="Try choosing a different course or semester, clearing the subject filter, or resetting search keywords."
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
          {notes.map((note) => {
            const catDetails = getCategoryDetails(note.category);
            return (
              <div
                key={note.id}
                className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Badges bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${catDetails.badgeBg}`}>
                        {catDetails.title}
                      </span>
                      {note.isExternalLink ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                          External Ref
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
                          PDF Document
                        </span>
                      )}
                    </div>

                    {/* Bookmark Button */}
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
                    <Link
                      to={`/notes/${note.id}`}
                      className="font-serif font-bold text-base text-navy-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition line-clamp-2 block"
                    >
                      {note.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-navy-500">
                      <span className="font-mono font-semibold text-navy-700 dark:text-navy-300">
                        {note.subject?.code}
                      </span>
                      <span>•</span>
                      <span className="truncate">{note.subject?.name}</span>
                    </div>
                    {note.description && (
                      <p className="text-xs text-navy-600 dark:text-navy-400 mt-2 line-clamp-2 leading-relaxed">
                        {note.description}
                      </p>
                    )}
                  </div>

                  {/* Academic Metadata */}
                  <div className="bg-navy-50 dark:bg-navy-800/40 rounded-xl p-2.5 text-[11px] text-navy-600 dark:text-navy-400 grid grid-cols-2 gap-2">
                    <div>
                      <span className="block font-medium text-navy-400">Course / Sem</span>
                      <span className="text-navy-800 dark:text-navy-200 truncate block">
                        {note.course?.code || note.course?.name} ({note.semester?.title || `Sem ${note.semester?.semesterNumber}`})
                      </span>
                    </div>
                    <div>
                      <span className="block font-medium text-navy-400">Contributor</span>
                      <span className="text-navy-800 dark:text-navy-200 truncate block">
                        {note.uploadedBy?.fullName || 'Verified Contributor'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVote(note.id)}
                      className={`flex items-center gap-1 font-mono transition ${
                        note.userVote === 'UPVOTE'
                          ? 'text-gold-600 dark:text-gold-400 font-bold'
                          : 'text-navy-500 hover:text-gold-600 dark:text-navy-400'
                      }`}
                      title="Upvote this study note"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" fill={note.userVote === 'UPVOTE' ? 'currentColor' : 'none'} />
                      <span>{note.upvotesCount || 0}</span>
                    </button>
                    <span className="text-[11px] text-navy-400 font-mono">
                      {note.downloadCount || 0} downloads
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setPreviewModal({
                          isOpen: true,
                          fileUrl: note.fileUrl,
                          title: note.title,
                          id: note.id
                        })
                      }
                      className="flex items-center gap-1 px-3 py-1.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-800 dark:text-navy-200 rounded-lg font-medium transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleDownload(note)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white dark:bg-gold-600 dark:hover:bg-gold-500 font-medium rounded-lg transition"
                    >
                      {note.isExternalLink ? (
                        <>
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Link</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => updateFilters({ page: String(pagination.page - 1) })}
            disabled={!pagination.hasPrevPage}
            className="p-2 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-700 dark:text-navy-300 disabled:opacity-40 hover:bg-navy-100 dark:hover:bg-navy-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-4 py-2 bg-navy-100 dark:bg-navy-800 rounded-xl text-navy-800 dark:text-navy-200">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => updateFilters({ page: String(pagination.page + 1) })}
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
            window.open(`/api/notes/${previewModal.id}/download`, '_blank');
          }
        }}
      />
    </div>
  );
};
