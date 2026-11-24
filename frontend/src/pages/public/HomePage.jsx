import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  FileText,
  Bot,
  GraduationCap,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Download,
  Users,
  CheckCircle,
  ExternalLink,
  Bell
} from 'lucide-react';
import api from '../../api/client';
import { useLanguage } from '../../contexts/LanguageContext';

export const HomePage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [recentPYQs, setRecentPYQs] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [stats, setStats] = useState({
    totalPYQs: 0,
    totalNotes: 0,
    totalStudents: 0,
    totalDownloads: 0
  });

  useEffect(() => {
    // Fetch courses & recent PYQs & announcements & live stats
    const loadHomeData = async () => {
      try {
        const [courseRes, pyqRes, annRes, statsRes] = await Promise.all([
          api.get('/academic/courses'),
          api.get('/pyqs?page=1&limit=4'),
          api.get('/announcements?limit=3'),
          api.get('/academic/stats')
        ]);

        if (courseRes.success) setCourses(courseRes.data.courses || []);
        if (pyqRes.success) setRecentPYQs(pyqRes.data.items || []);
        if (annRes.success) setRecentAnnouncements(annRes.data.items || []);
        if (statsRes.success && statsRes.data?.stats) setStats(statsRes.data.stats);
      } catch (err) {
        console.error('Failed to load home data', err);
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/pyqs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-navy-900 via-navy-900 to-navy-950 text-white border-b border-navy-800">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 border border-gold-500/30 text-gold-400 text-xs font-medium shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Independent Law Peer-Learning Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              {t('home.heroTitle')}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-navy-300 leading-relaxed font-normal">
              {t('home.heroSubtitle')}
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 flex items-center max-w-2xl mx-auto bg-white dark:bg-navy-800 rounded-2xl p-2 shadow-2xl border border-navy-200 dark:border-navy-700"
            >
              <div className="pl-3 text-navy-400">
                <Search className="w-5 h-5 text-gold-600 dark:text-gold-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.searchPlaceholder')}
                className="w-full px-3 py-2.5 bg-transparent text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none text-sm"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white text-xs font-semibold rounded-xl transition shrink-0"
              >
                {t('common.search')}
              </button>
            </form>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-navy-400">Popular Subjects:</span>
              {['Constitutional Law I', 'Law of Torts', 'Criminal Law (IPC)', 'Jurisprudence', 'Contracts'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => navigate(`/pyqs?search=${encodeURIComponent(sub)}`)}
                  className="px-2.5 py-1 rounded-lg bg-navy-800/80 hover:bg-navy-700/80 text-xs text-navy-300 hover:text-white border border-navy-700 transition"
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto pt-8 border-t border-navy-800/80">
            <div className="text-center p-3">
              <span className="block font-serif text-2xl sm:text-3xl font-bold text-gold-400">
                {stats.totalPYQs > 0 ? `${stats.totalPYQs}+` : '0'}
              </span>
              <span className="text-xs text-navy-400 mt-1 block">{t('home.statPyqs')}</span>
            </div>
            <div className="text-center p-3">
              <span className="block font-serif text-2xl sm:text-3xl font-bold text-gold-400">
                {stats.totalNotes > 0 ? `${stats.totalNotes}+` : '0'}
              </span>
              <span className="text-xs text-navy-400 mt-1 block">{t('home.statNotes')}</span>
            </div>
            <div className="text-center p-3">
              <span className="block font-serif text-2xl sm:text-3xl font-bold text-gold-400">
                {stats.totalStudents > 0 ? `${stats.totalStudents}+` : '0'}
              </span>
              <span className="text-xs text-navy-400 mt-1 block">{t('home.statStudents')}</span>
            </div>
            <div className="text-center p-3">
              <span className="block font-serif text-2xl sm:text-3xl font-bold text-gold-400">
                {stats.totalDownloads > 0 ? `${stats.totalDownloads}+` : '0'}
              </span>
              <span className="text-xs text-navy-400 mt-1 block">{t('home.statDownloads')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. University Updates & Announcements Ticker */}
      {recentAnnouncements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 sm:p-5 border border-navy-200 dark:border-navy-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gold-100 dark:bg-gold-950/60 text-gold-600 dark:text-gold-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-white">
                  University Notifications
                </span>
                <p className="text-[11px] text-navy-500">Official updates & examination circulars</p>
              </div>
            </div>

            <div className="flex-1 w-full overflow-hidden">
              <div className="space-y-1">
                {recentAnnouncements.map((ann) => (
                  <Link
                    key={ann.id}
                    to={`/announcements/${ann.slug}`}
                    className="flex items-center justify-between text-xs text-navy-700 dark:text-navy-300 hover:text-gold-600 dark:hover:text-gold-400 transition py-0.5 truncate"
                  >
                    <span className="truncate mr-2 font-medium">
                      • {ann.title}
                    </span>
                    <span className="text-[10px] text-navy-400 shrink-0">
                      {new Date(ann.publishedAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/announcements"
              className="text-xs font-semibold text-gold-600 dark:text-gold-400 hover:underline shrink-0 flex items-center gap-1"
            >
              <span>{t('common.viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* 3. Academic Programs / Course Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
              Curriculum Hierarchy
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white mt-1">
              Affiliated Law Programs
            </h2>
            <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-400 mt-1">
              Organized systematically: Course → Semester → Subject → Marking Scheme.
            </p>
          </div>
          <Link
            to="/courses"
            className="text-xs font-semibold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1"
          >
            <span>{t('home.exploreCurriculum')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-navy-100 dark:bg-navy-800 text-navy-800 dark:text-navy-200">
                    {course.code}
                  </span>
                  <span className="text-xs text-navy-500">
                    {course.durationYears} Years ({course.totalSemesters} Sems)
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition">
                  {course.name}
                </h3>
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-2 line-clamp-2">
                  {course.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between">
                <span className="text-xs text-navy-500 font-medium">
                  {course._count?.subjects || 0} Core Subjects
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/notes?courseId=${course.id}`}
                    className="text-xs font-semibold text-navy-900 dark:text-gold-400 flex items-center gap-1 hover:underline"
                  >
                    <span>Notes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/pyqs?courseId=${course.id}`}
                    className="text-xs text-navy-500 hover:text-navy-900 dark:hover:text-white flex items-center gap-1"
                  >
                    <span>PYQs</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Feature Cards: Four Pillars of KSLU Circle */}
      <section className="bg-navy-100/60 dark:bg-navy-900/40 py-16 border-y border-navy-200/80 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
              Complete Academic Support for Law Students
            </h2>
            <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-400 mt-2">
              Everything required to excel in semester exams, clinical courses, and moot court competitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-950/60 text-gold-600 dark:text-gold-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-navy-900 dark:text-white text-base">
                Authentic PYQ Archive
              </h3>
              <p className="text-xs text-navy-600 dark:text-navy-400 leading-relaxed">
                Filter question papers by Scheme 80 Marks and Scheme 100 Marks, download or preview instantly with built-in PDF viewer.
              </p>
              <Link to="/pyqs" className="inline-block text-xs font-semibold text-gold-600 dark:text-gold-400 hover:underline pt-2">
                Search Papers &rarr;
              </Link>
            </div>

            <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-navy-900 dark:text-white text-base">
                Moderated Study Notes
              </h3>
              <p className="text-xs text-navy-600 dark:text-navy-400 leading-relaxed">
                Peer notes reviewed for accuracy and curriculum relevance before public approval. Upvote and bookmark top materials.
              </p>
              <Link to="/notes" className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-2">
                Browse Notes &rarr;
              </Link>
            </div>

            <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-navy-900 dark:text-white text-base">
                AI Law Study Assistant
              </h3>
              <p className="text-xs text-navy-600 dark:text-navy-400 leading-relaxed">
                Ask legal concept questions, draft 16-mark answer outlines, generate model practice questions, and clarify doctrines.
              </p>
              <Link to="/ai-tutor" className="inline-block text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline pt-2">
                Consult AI Tutor &rarr;
              </Link>
            </div>

            <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-navy-900 dark:text-white text-base">
                Student Community Forum
              </h3>
              <p className="text-xs text-navy-600 dark:text-navy-400 leading-relaxed">
                Subject-specific discussions, past exam doubts, moot memorial tips, and collaborative peer learning.
              </p>
              <Link to="/community" className="inline-block text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-2">
                Join Discussions &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Recent Question Papers Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
              Examination Papers
            </span>
            <h2 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
              Recently Added Question Papers
            </h2>
          </div>
          <Link
            to="/pyqs"
            className="text-xs font-semibold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1"
          >
            <span>{t('common.viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPYQs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentPYQs.map((pyq) => (
              <div
                key={pyq.id}
                className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
                      {pyq.scheme?.name || 'Scheme 80 Marks'}
                    </span>
                    <span className="text-[11px] font-mono text-navy-500">
                      {pyq.examMonth} {pyq.examYear}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-navy-900 dark:text-white line-clamp-2">
                    {pyq.title}
                  </h4>
                  <p className="text-xs text-navy-500 mt-1">
                    {pyq.subject?.name} ({pyq.subject?.code})
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between">
                  <span className="text-[11px] text-navy-500">
                    {pyq.downloadCount} downloads
                  </span>
                  <Link
                    to={`/pyqs/${pyq.id}`}
                    className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white dark:bg-gold-600 dark:hover:bg-gold-500 text-xs font-medium rounded-lg transition"
                  >
                    View Paper
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-8 border border-navy-200 dark:border-navy-800 shadow-sm text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-navy-50 dark:bg-navy-800/80 text-navy-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-white">
              No Question Papers Uploaded Yet
            </h3>
            <p className="text-xs text-navy-600 dark:text-navy-400 leading-relaxed">
              The question paper repository is ready for official semester papers. Explore curriculum streams or contribute past university examination papers.
            </p>
            <div className="pt-2">
              <Link
                to="/courses"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 text-xs font-semibold rounded-xl shadow transition"
              >
                <span>Explore Courses & Syllabi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 6. Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-900 to-navy-950 rounded-3xl p-8 sm:p-12 text-white border border-gold-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              Join the KSLU Circle Academic Community
            </h3>
            <p className="text-xs sm:text-sm text-navy-300 leading-relaxed">
              Bookmark question papers, share lecture notes, participate in subject debates, and prepare confidently for university examinations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/register"
              className="px-6 py-3 bg-gold-600 hover:bg-gold-500 text-white text-xs font-bold rounded-xl shadow-lg transition text-center"
            >
              Create Student Account
            </Link>
            <Link
              to="/pyqs"
              className="px-6 py-3 bg-navy-800 hover:bg-navy-700 text-navy-200 text-xs font-bold rounded-xl border border-navy-700 transition text-center"
            >
              Browse Library
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
