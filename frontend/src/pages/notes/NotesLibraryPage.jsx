import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  HelpCircle,
  Library,
  Scale,
  ThumbsUp,
  ThumbsDown,
  Download,
  Eye,
  Bookmark,
  Upload,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Calendar,
  Layers,
  ArrowLeft,
  X,
  FileText,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { PDFViewerModal } from '../../components/pdf/PDFViewerModal';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

// The 4 Core Academic Resource Categories
const NOTE_CATEGORIES = [
  {
    key: 'STUDY_NOTES',
    title: 'Study Notes',
    kannadaTitle: 'ಅಧ್ಯಯನ ಟಿಪ್ಪಣಿಗಳು',
    icon: BookOpen,
    iconColor: 'text-amber-600 dark:text-amber-400',
    cardBg: 'from-amber-500/10 via-amber-500/5 to-transparent hover:border-amber-400 dark:hover:border-amber-600',
    activeBorder: 'border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/30',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800',
    description: 'Lecture summaries, chapter briefs, module-wise revisions, and synthesized classroom notes.'
  },
  {
    key: 'IMPORTANT_QUESTIONS',
    title: 'Important Questions',
    kannadaTitle: 'ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳು',
    icon: HelpCircle,
    iconColor: 'text-blue-600 dark:text-blue-400',
    cardBg: 'from-blue-500/10 via-blue-500/5 to-transparent hover:border-blue-400 dark:hover:border-blue-600',
    activeBorder: 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/30',
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800',
    description: 'Probable university exam questions, previous recurring questions, short/long-answer answer guides.'
  },
  {
    key: 'REFERENCE_BOOKS',
    title: 'Reference Books',
    kannadaTitle: 'ಉಲ್ಲೇಖ ಪುಸ್ತಕಗಳು',
    icon: Library,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    cardBg: 'from-emerald-500/10 via-emerald-500/5 to-transparent hover:border-emerald-400 dark:hover:border-emerald-600',
    activeBorder: 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/30',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800',
    description: 'Recommended curriculum textbooks, leading legal commentaries, reference PDFs, and reading guides.'
  },
  {
    key: 'CASE_LAWS',
    title: 'Case Laws',
    kannadaTitle: 'ನ್ಯಾಯಾಲಯದ ತೀರ್ಪುಗಳು',
    icon: Scale,
    iconColor: 'text-purple-600 dark:text-purple-400',
    cardBg: 'from-purple-500/10 via-purple-500/5 to-transparent hover:border-purple-400 dark:hover:border-purple-600',
    activeBorder: 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/30',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800',
    description: 'Landmark Supreme Court & High Court judgments, case summaries, ratio decidendi, and legal precedents.'
  }
];

export const NotesLibraryPage = () => {
  const { isAuthenticated } = useAuth();
  const { setToast } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  // Master Data
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({
    STUDY_NOTES: 0,
    IMPORTANT_QUESTIONS: 0,
    REFERENCE_BOOKS: 0,
    CASE_LAWS: 0,
    TOTAL: 0
  });

  // Resources
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Loaders
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Subject search filter
  const [subjectSearch, setSubjectSearch] = useState('');

  // Selected State from Query Params
  const courseId = searchParams.get('courseId') || '';
  const semesterId = searchParams.get('semesterId') || '';
  const subjectId = searchParams.get('subjectId') || '';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';

  // Modals
  const [previewModal, setPreviewModal] = useState({ isOpen: false, fileUrl: '', title: '', id: null });
  const [reportModal, setReportModal] = useState({ isOpen: false, noteId: null, reason: 'PLAGIARISM', details: '' });

  // 1. Fetch available Courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await api.get('/academic/courses');
        if (res.success && res.data?.courses) {
          // Filter to the 3 main courses required: 3-Year LL.B, B.A. LL.B, B.B.A. LL.B
          // while supporting other law programs if available
          setCourses(res.data.courses);
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // Filtered official courses for display cards (3-Year LL.B & 4 Integrated 5-Year programmes)
  const displayCourses = useMemo(() => {
    if (!courses.length) return [];
    const order = ['3YR-LLB', '5YR-BALLB', '5YR-BBALLB', '5YR-BCOMLLB', '5YR-BSCLB'];
    const matched = [];
    order.forEach(code => {
      const found = courses.find(c => c.code === code);
      if (found) matched.push(found);
    });
    // Add any remaining courses
    courses.forEach(c => {
      if (!matched.some(m => m.id === c.id)) {
        matched.push(c);
      }
    });
    return matched;
  }, [courses]);

  // Selected entities for breadcrumbs & displays
  const selectedCourse = useMemo(() => courses.find(c => c.id === courseId), [courses, courseId]);
  const selectedSemester = useMemo(() => semesters.find(s => s.id === semesterId), [semesters, semesterId]);
  const selectedSubject = useMemo(() => subjects.find(s => s.id === subjectId), [subjects, subjectId]);
  const selectedCategoryObj = useMemo(() => NOTE_CATEGORIES.find(c => c.key === category), [category]);

  // 2. Fetch Semesters whenever Course changes
  useEffect(() => {
    if (!courseId) {
      setSemesters([]);
      return;
    }
    const fetchSemesters = async () => {
      setLoadingSemesters(true);
      try {
        const res = await api.get(`/academic/courses/${courseId}/semesters`);
        if (res.success && res.data?.semesters) {
          // Sort semesters ascending by semesterNumber
          const sems = (res.data.semesters || []).sort((a, b) => a.semesterNumber - b.semesterNumber);
          setSemesters(sems);
        }
      } catch (err) {
        console.error('Failed to load semesters', err);
        setSemesters([]);
      } finally {
        setLoadingSemesters(false);
      }
    };
    fetchSemesters();
  }, [courseId]);

  // 3. Fetch Subjects ONLY after both Course AND Semester are selected
  useEffect(() => {
    if (!courseId || !semesterId) {
      setSubjects([]);
      return;
    }
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const res = await api.get(`/academic/subjects?courseId=${courseId}&semesterId=${semesterId}`);
        if (res.success && res.data?.subjects) {
          setSubjects(res.data.subjects);
        }
      } catch (err) {
        console.error('Failed to load subjects', err);
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [courseId, semesterId]);

  // 4. Fetch Category Counts whenever Subject is selected
  useEffect(() => {
    if (!courseId || !semesterId || !subjectId) {
      setCategoryCounts({
        STUDY_NOTES: 0,
        IMPORTANT_QUESTIONS: 0,
        REFERENCE_BOOKS: 0,
        CASE_LAWS: 0,
        TOTAL: 0
      });
      return;
    }
    const fetchCounts = async () => {
      setLoadingCounts(true);
      try {
        const res = await api.get(`/notes/categories-count?courseId=${courseId}&semesterId=${semesterId}&subjectId=${subjectId}`);
        if (res.success && res.data?.counts) {
          setCategoryCounts(res.data.counts);
        }
      } catch (err) {
        console.error('Failed to load category counts', err);
      } finally {
        setLoadingCounts(false);
      }
    };
    fetchCounts();
  }, [courseId, semesterId, subjectId]);

  // 5. Fetch Notes / Resources when hierarchy and parameters change
  useEffect(() => {
    // Only fetch notes if at least courseId and semesterId are selected
    if (!courseId || !semesterId) {
      setNotes([]);
      setPagination({ page: 1, totalPages: 1, total: 0 });
      return;
    }

    const fetchNotes = async () => {
      setLoadingNotes(true);
      try {
        const params = new URLSearchParams();
        if (courseId) params.set('courseId', courseId);
        if (semesterId) params.set('semesterId', semesterId);
        if (subjectId) params.set('subjectId', subjectId);
        if (category) params.set('category', category);
        if (search) params.set('search', search);
        if (sortBy) params.set('sortBy', sortBy);
        const page = searchParams.get('page') || '1';
        params.set('page', page);
        params.set('limit', '12');

        const response = await api.get(`/notes?${params.toString()}`);
        if (response.success && response.data) {
          setNotes(response.data.items || []);
          setPagination(response.data.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      } catch (err) {
        console.error('Failed to load study notes', err);
      } finally {
        setLoadingNotes(false);
      }
    };
    fetchNotes();
  }, [courseId, semesterId, subjectId, category, search, sortBy, searchParams]);

  // Hierarchy Navigation Handlers & Reset Rules
  const handleSelectCourse = (newCourseId) => {
    if (newCourseId === courseId) return;
    const next = new URLSearchParams();
    next.set('courseId', newCourseId);
    // Reset semester, subject, category, and page
    setSearchParams(next);
  };

  const handleSelectSemester = (newSemId) => {
    if (newSemId === semesterId) return;
    const next = new URLSearchParams();
    if (courseId) next.set('courseId', courseId);
    next.set('semesterId', newSemId);
    // Reset subject, category, and page
    setSearchParams(next);
  };

  const handleSelectSubject = (newSubId) => {
    const next = new URLSearchParams(searchParams);
    next.set('subjectId', newSubId);
    next.delete('category'); // Show all 4 categories initially
    next.delete('search');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSelectCategory = (catKey) => {
    const next = new URLSearchParams(searchParams);
    if (catKey) {
      next.set('category', catKey);
    } else {
      next.delete('category');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleResetToCourses = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleResetToSemesters = () => {
    const next = new URLSearchParams();
    if (courseId) next.set('courseId', courseId);
    setSearchParams(next);
  };

  const handleResetToSubjects = () => {
    const next = new URLSearchParams();
    if (courseId) next.set('courseId', courseId);
    if (semesterId) next.set('semesterId', semesterId);
    setSearchParams(next);
  };

  const handleResetToCategories = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    next.delete('page');
    setSearchParams(next);
  };

  const updateSearch = (query) => {
    const next = new URLSearchParams(searchParams);
    if (query) next.set('search', query);
    else next.delete('search');
    next.set('page', '1');
    setSearchParams(next);
  };

  const updateSort = (sort) => {
    const next = new URLSearchParams(searchParams);
    next.set('sortBy', sort);
    next.set('page', '1');
    setSearchParams(next);
  };

  // Voting
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

  // Bookmarks
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

  // Report Modal submission
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

  // Filtered subject list based on local subject search
  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return subjects;
    const q = subjectSearch.toLowerCase();
    return subjects.filter(s =>
      s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [subjects, subjectSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-navy-200 dark:border-navy-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KSLU Circle Verified Legal Repository</span>
            <span className="text-navy-300 dark:text-navy-700">•</span>
            <span className="text-navy-500 dark:text-navy-400">ಕರ್ನಾಟಕ ರಾಜ್ಯ ಕಾನೂನು ವಿಶ್ವವಿದ್ಯಾಲಯ</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mt-1.5 tracking-tight">
            Academic Notes & Legal Resources Library
          </h1>
          <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-400 mt-2 max-w-3xl leading-relaxed">
            Curriculum-verified study notes, probable examination questions, leading reference books, and landmark judgments organized strictly by program, semester, and legal discipline.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {(courseId || semesterId || subjectId || category) && (
            <button
              onClick={handleResetToCourses}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-navy-700 dark:text-navy-300 hover:text-navy-950 dark:hover:text-white bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 rounded-xl transition shadow-sm"
              title="Reset entire navigation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Hierarchy</span>
            </button>
          )}

          <Link
            to="/notes/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-gold-600 hover:bg-gold-500 text-white text-xs font-bold rounded-xl shadow-md transition shrink-0 transform hover:-translate-y-0.5"
          >
            <Upload className="w-4 h-4" />
            <span>Contribute Notes</span>
          </Link>
        </div>
      </div>

      {/* 2. Interactive Step Breadcrumb Bar */}
      <nav aria-label="Hierarchy Breadcrumb" className="bg-white dark:bg-navy-900/90 border border-navy-200 dark:border-navy-800 rounded-2xl p-3 sm:p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Step 1: Courses */}
          <button
            onClick={handleResetToCourses}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
              !courseId
                ? 'bg-navy-900 text-gold-400 dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                : 'text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-gold-500" />
            <span>1. Courses</span>
          </button>

          {courseId && (
            <>
              <ChevronRight className="w-4 h-4 text-navy-400 shrink-0" />
              <button
                onClick={handleResetToSemesters}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                  courseId && !semesterId
                    ? 'bg-navy-900 text-gold-400 dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                    : 'text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-gold-500" />
                <span>{selectedCourse?.name || 'Selected Course'}</span>
              </button>
            </>
          )}

          {semesterId && (
            <>
              <ChevronRight className="w-4 h-4 text-navy-400 shrink-0" />
              <button
                onClick={handleResetToSubjects}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                  semesterId && !subjectId
                    ? 'bg-navy-900 text-gold-400 dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                    : 'text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-gold-500" />
                <span>{selectedSemester?.title || `Semester ${selectedSemester?.semesterNumber}`}</span>
              </button>
            </>
          )}

          {subjectId && (
            <>
              <ChevronRight className="w-4 h-4 text-navy-400 shrink-0" />
              <button
                onClick={handleResetToCategories}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                  subjectId && !category
                    ? 'bg-navy-900 text-gold-400 dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                    : 'text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-gold-500" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{selectedSubject?.code}: {selectedSubject?.name}</span>
              </button>
            </>
          )}

          {category && (
            <>
              <ChevronRight className="w-4 h-4 text-navy-400 shrink-0" />
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-navy-900 text-gold-400 dark:bg-navy-800 dark:text-gold-400 shadow-sm">
                <span>{selectedCategoryObj?.title || category}</span>
              </span>
            </>
          )}
        </div>
      </nav>

      {/* =========================================================================
          STEP 1: COURSE SELECTION
          Display the three required course cards
      ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-500 text-navy-950 font-bold text-xs">1</span>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white">
              Select Law Degree Programme
            </h2>
          </div>
          {courseId && (
            <span className="text-xs text-navy-500 dark:text-navy-400">
              Selected: <strong className="text-gold-600 dark:text-gold-400">{selectedCourse?.name}</strong>
            </span>
          )}
        </div>

        {loadingCourses ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {displayCourses.map((c) => {
              const isSelected = c.id === courseId;
              const is3Yr = c.code === '3YR-LLB';
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCourse(c.id)}
                  className={`group relative cursor-pointer rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-navy-900 via-navy-900 to-navy-950 text-white border-gold-500 shadow-lg ring-2 ring-gold-500/40 transform -translate-y-1'
                      : 'bg-white dark:bg-navy-900 text-navy-900 dark:text-white border-navy-200 dark:border-navy-800 hover:border-gold-400/60 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                        isSelected
                          ? 'bg-gold-500/20 text-gold-300 border-gold-500/40'
                          : 'bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 border-navy-200 dark:border-navy-700'
                      }`}>
                        {c.code}
                      </span>

                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-gold-50 dark:bg-gold-950/40 text-gold-600 dark:text-gold-400'
                      }`}>
                        {c.totalSemesters} Semesters
                      </span>
                    </div>

                    <div>
                      <h3 className={`font-serif text-xl font-bold transition ${
                        isSelected ? 'text-white' : 'group-hover:text-gold-600 dark:group-hover:text-gold-400'
                      }`}>
                        {c.name}
                      </h3>
                      <p className={`text-xs mt-1 leading-relaxed ${
                        isSelected ? 'text-navy-200' : 'text-navy-600 dark:text-navy-400'
                      }`}>
                        {c.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-navy-100/10 dark:border-navy-800/80 flex items-center justify-between text-xs">
                    <span className={isSelected ? 'text-gold-400 font-semibold' : 'text-navy-500'}>
                      {is3Yr ? 'Graduate Entry (6 Sems)' : '5-Yr Integrated (10 Sems)'}
                    </span>

                    <span className={`flex items-center gap-1 font-bold ${
                      isSelected ? 'text-gold-400' : 'text-navy-400 group-hover:text-navy-800 dark:group-hover:text-white'
                    }`}>
                      <span>{isSelected ? 'Active' : 'Choose'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================================
          STEP 2: SEMESTER SELECTION
          Dynamically generated for the selected course:
          - 3-Year LL.B: Semester 1 to Semester 6 ONLY (Never 7, 8, 9, 10)
          - B.A. LL.B: Semester 1 to Semester 10
          - B.B.A. LL.B: Semester 1 to Semester 10
      ========================================================================= */}
      {courseId && (
        <section className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-500 text-navy-950 font-bold text-xs">2</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white">
                Select Semester ({selectedCourse?.name})
              </h2>
            </div>
            <span className="text-xs text-navy-500 dark:text-navy-400">
              {semesters.length} Semesters available for this course
            </span>
          </div>

          {loadingSemesters ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-navy-100 dark:bg-navy-800/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {semesters.map((sem) => {
                const isSelected = sem.id === semesterId;
                const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][sem.semesterNumber - 1] || sem.semesterNumber;
                return (
                  <button
                    key={sem.id}
                    onClick={() => handleSelectSemester(sem.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 border-gold-500 shadow-md ring-2 ring-gold-500/30'
                        : 'bg-white dark:bg-navy-900 text-navy-900 dark:text-white border-navy-200 dark:border-navy-800 hover:border-gold-400 hover:bg-gold-50/30 dark:hover:bg-navy-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-gold-500/20 text-gold-300'
                          : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-400'
                      }`}>
                        SEM {sem.semesterNumber}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />}
                    </div>

                    <div className="mt-2">
                      <span className="font-serif text-sm font-bold block">
                        Semester {roman}
                      </span>
                      <span className="text-[10px] text-navy-500 dark:text-navy-400">
                        {sem.semesterNumber <= 2 ? 'Foundation' : sem.semesterNumber <= 6 ? 'Core Legal' : 'Specialization'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          STEP 3: SUBJECT SELECTION
          Subjects appear ONLY after course AND semester are selected.
          Filtered strictly by selected courseId and semesterId.
      ========================================================================= */}
      {courseId && semesterId && (
        <section className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-500 text-navy-950 font-bold text-xs">3</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white">
                Select Subject ({selectedCourse?.name} → {selectedSemester?.title})
              </h2>
            </div>

            {/* In-Semester Subject Search */}
            {subjects.length > 0 && (
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  placeholder="Filter subjects in this semester..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            )}
          </div>

          {loadingSubjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-navy-100 dark:bg-navy-800/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredSubjects.length === 0 ? (
            <EmptyState
              title="No subjects configured for this semester"
              description="No curriculum subjects found for the selected semester. If you are an administrator, configure subjects in the Academic Curriculum module."
              action={
                <button
                  onClick={handleResetToSemesters}
                  className="px-4 py-2 bg-navy-900 dark:bg-gold-600 text-white text-xs font-semibold rounded-xl"
                >
                  Choose Another Semester
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredSubjects.map((sub) => {
                const isSelected = sub.id === subjectId;
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSubject(sub.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 border-gold-500 shadow-md ring-2 ring-gold-500/30 transform -translate-y-0.5'
                        : 'bg-white dark:bg-navy-900 text-navy-900 dark:text-white border-navy-200 dark:border-navy-800 hover:border-gold-400/80 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isSelected
                            ? 'bg-gold-500/20 text-gold-300'
                            : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-400'
                        }`}>
                          {sub.code}
                        </span>

                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          sub.isCore
                            ? isSelected
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-navy-100 dark:bg-navy-800 text-navy-500'
                        }`}>
                          {sub.isCore ? 'Core Subject' : 'Elective'}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm leading-snug line-clamp-2">
                        {sub.name}
                      </h4>
                      {sub.description && (
                        <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                          isSelected ? 'text-navy-200' : 'text-navy-500 dark:text-navy-400'
                        }`}>
                          {sub.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-navy-100/10 dark:border-navy-800/80 flex items-center justify-between text-[11px]">
                      <span className={isSelected ? 'text-gold-400' : 'text-navy-400'}>
                        {sub.credits ? `${sub.credits} Credits` : 'KSLU Subject'}
                      </span>
                      <span className={`font-semibold flex items-center gap-1 ${
                        isSelected ? 'text-gold-400' : 'text-gold-600 dark:text-gold-400'
                      }`}>
                        <span>{isSelected ? 'Selected' : 'Open Notes'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          STEP 4: SUBJECT-WISE NOTES HIERARCHY
          The 4 Categories: Study Notes, Important Questions, Reference Books, Case Laws
          Displayed once Subject is selected.
      ========================================================================= */}
      {courseId && semesterId && subjectId && (
        <section className="space-y-5 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-500 text-navy-950 font-bold text-xs">4</span>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white">
                  Notes Categories for {selectedSubject?.name}
                </h2>
                <span className="text-xs text-navy-500 dark:text-navy-400">
                  Select a category to view specialized curriculum study materials
                </span>
              </div>
            </div>

            {category && (
              <button
                onClick={() => handleSelectCategory('')}
                className="text-xs font-semibold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>View All Categories</span>
                <span>({categoryCounts.TOTAL})</span>
              </button>
            )}
          </div>

          {/* The 4 Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {NOTE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.key;
              const count = categoryCounts[cat.key] || 0;

              return (
                <div
                  key={cat.key}
                  onClick={() => handleSelectCategory(cat.key)}
                  className={`group relative cursor-pointer rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between bg-gradient-to-br ${cat.cardBg} ${
                    isSelected
                      ? `bg-white dark:bg-navy-900 ${cat.activeBorder} shadow-lg -translate-y-1`
                      : 'bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-800 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl bg-white dark:bg-navy-800 shadow-xs border border-navy-100 dark:border-navy-700 ${cat.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cat.badgeBg}`}>
                        {count} {count === 1 ? 'Resource' : 'Resources'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition">
                        {cat.title}
                      </h3>
                      <span className="text-[11px] font-medium text-navy-400 dark:text-navy-500 block">
                        {cat.kannadaTitle}
                      </span>
                      <p className="text-xs text-navy-600 dark:text-navy-400 mt-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-navy-100 dark:border-navy-800/80 flex items-center justify-between text-xs font-semibold">
                    <span className={isSelected ? 'text-gold-600 dark:text-gold-400' : 'text-navy-500'}>
                      {isSelected ? 'Filtered' : 'Browse'}
                    </span>
                    <span className="flex items-center gap-1 text-gold-600 dark:text-gold-400">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================================
          STEP 5: RESOURCE LISTING & SEARCH
          Displays notes for the selected subject and optional category
      ========================================================================= */}
      {courseId && semesterId && subjectId && (
        <section className="space-y-6 pt-6 border-t border-navy-200 dark:border-navy-800 animate-in fade-in duration-300">
          {/* Active Filter & Category Header */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                  {category ? selectedCategoryObj?.title : 'All Categories'} • {selectedSubject?.code}
                </span>
                <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                  {selectedSubject?.name} Study Materials
                </h3>
              </div>

              {/* Category Quick Pills */}
              <div className="flex items-center flex-wrap gap-1.5 text-xs">
                <button
                  onClick={() => handleSelectCategory('')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                    !category
                      ? 'bg-navy-900 text-white dark:bg-gold-600 dark:text-navy-950 shadow-sm'
                      : 'bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-200'
                  }`}
                >
                  All ({categoryCounts.TOTAL})
                </button>
                {NOTE_CATEGORIES.map((cat) => {
                  const isCat = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => handleSelectCategory(cat.key)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                        isCat
                          ? 'bg-navy-900 text-white dark:bg-gold-600 dark:text-navy-950 shadow-sm'
                          : 'bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-200'
                      }`}
                    >
                      <span>{cat.title}</span>
                      <span className="text-[10px] opacity-75">({categoryCounts[cat.key] || 0})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search and Sort Toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-navy-100 dark:border-navy-800">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => updateSearch(e.target.value)}
                  placeholder="Search in these materials (topic, landmark judgments, doctrines, keywords)..."
                  className="w-full pl-10 pr-4 py-2 bg-navy-50 dark:bg-navy-800/60 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => updateSort(e.target.value)}
                  className="px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-800 dark:text-navy-200 focus:outline-none"
                >
                  <option value="createdAt">Sort: Latest Uploaded</option>
                  <option value="upvotes">Sort: Most Upvoted</option>
                  <option value="downloads">Sort: Most Downloaded</option>
                </select>

                {search && (
                  <button
                    onClick={() => updateSearch('')}
                    className="p-2 text-navy-500 hover:text-rose-500 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-xl transition"
                    title="Clear search"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results count & status */}
          <div className="flex items-center justify-between text-xs text-navy-500 dark:text-navy-400 px-1">
            <span>
              Displaying {pagination.total} verified {category ? selectedCategoryObj?.title.toLowerCase() : 'academic'} resources
            </span>
            {pagination.totalPages > 1 && (
              <span>Page {pagination.page} of {pagination.totalPages}</span>
            )}
          </div>

          {/* Resources Cards Grid */}
          {loadingNotes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : notes.length === 0 ? (
            <EmptyState
              title={`No ${category ? selectedCategoryObj?.title : 'notes'} found for this subject`}
              description="Be the first student or educator to upload verified study notes, questions, or commentaries for this topic to assist your peers across KSLU."
              action={
                <Link
                  to="/notes/upload"
                  className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-sm transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Resource Now</span>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => {
                const catMeta = NOTE_CATEGORIES.find(c => c.key === note.category) || NOTE_CATEGORIES[0];
                const CatIcon = catMeta.icon;

                return (
                  <div
                    key={note.id}
                    className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges Row */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-lg ${catMeta.badgeBg}`}>
                          <CatIcon className="w-3 h-3" />
                          <span>{catMeta.title}</span>
                        </span>

                        <div className="flex items-center gap-1">
                          {note.isExternalLink ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                              External Resource
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          )}

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
                      </div>

                      {/* Title & Subject Info */}
                      <div>
                        <h4 className="font-serif font-bold text-base text-navy-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition line-clamp-2">
                          {note.title}
                        </h4>
                        <p className="text-[11px] text-navy-500 mt-1">
                          {note.subject?.name} • {note.course?.code} {note.semester?.title}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-navy-600 dark:text-navy-400 line-clamp-3 leading-relaxed">
                        {note.description}
                      </p>

                      {/* Tags */}
                      {note.tags && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {note.tags.split(',').slice(0, 3).map((t, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300">
                              #{t.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Author attribution */}
                      <div className="pt-2 text-[11px] text-navy-500 dark:text-navy-400 flex items-center justify-between border-t border-navy-100/50 dark:border-navy-800/50">
                        <span className="truncate">By {note.uploadedBy?.fullName || 'Academic Contributor'}</span>
                        <span className="shrink-0">{note.downloadCount} views/downloads</span>
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

                        {note.isExternalLink ? (
                          <a
                            href={note.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-white dark:bg-gold-600 dark:hover:bg-gold-500 font-medium rounded-lg transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open</span>
                          </a>
                        ) : (
                          <a
                            href={`/api/notes/${note.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-white dark:bg-gold-600 dark:hover:bg-gold-500 font-medium rounded-lg transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                        )}

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
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(pagination.page - 1));
                  setSearchParams(next);
                }}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1.5 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-700 dark:text-navy-300 disabled:opacity-40 hover:bg-navy-100 dark:hover:bg-navy-800 transition"
              >
                Previous
              </button>
              <span className="text-xs font-semibold px-4 py-1.5 bg-navy-100 dark:bg-navy-800 rounded-xl text-navy-800 dark:text-navy-200">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(pagination.page + 1));
                  setSearchParams(next);
                }}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1.5 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-700 dark:text-navy-300 disabled:opacity-40 hover:bg-navy-100 dark:hover:bg-navy-800 transition"
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {/* PDF Viewer Modal */}
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

      {/* Report Modal */}
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
    </div>
  );
};
