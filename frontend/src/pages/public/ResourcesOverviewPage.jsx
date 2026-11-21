import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Scale,
  Award,
  Layers,
  Search,
  ArrowRight,
  ShieldCheck,
  Download,
  Users
} from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

export const ResourcesOverviewPage = () => {
  const [courses, setCourses] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/academic/courses'),
      api.get('/academic/schemes')
    ])
      .then(([cRes, sRes]) => {
        if (cRes.success) setCourses(cRes.data.courses || []);
        if (sRes.success) setSchemes(sRes.data.schemes || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
          Academic Architecture
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white">
          KSLU Academic Resources Overview
        </h1>
        <p className="text-sm text-navy-600 dark:text-navy-300 leading-relaxed">
          Comprehensive, centralized repository of official law course curricula, semester examination question papers, verified student lecture syntheses, and academic schemes for Karnataka State Law University.
        </p>
      </div>

      {/* Resource Category Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-100 dark:bg-gold-950/60 text-gold-600 dark:text-gold-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-white">
              Previous Year Question Papers
            </h3>
            <p className="text-xs text-navy-600 dark:text-navy-400 leading-relaxed">
              Archived question papers for 3-Year LL.B and 5-Year Integrated law courses covering both Scheme 80 Marks and Scheme 100 Marks. Filter by semester, exam month, and subject.
            </p>
          </div>
          <Link
            to="/pyqs"
            className="flex items-center justify-between text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline pt-2 border-t border-navy-100 dark:border-navy-800"
          >
            <span>Browse PYQ Archive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-white">
              Verified Study Notes
            </h3>
            <p className="text-xs text-navy-600 dark:text-navy-400 leading-relaxed">
              Student-contributed lecture notes, statutory definitions, case summaries, and exam revision materials approved by academic moderators.
            </p>
          </div>
          <Link
            to="/notes"
            className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-2 border-t border-navy-100 dark:border-navy-800"
          >
            <span>Explore Notes Library</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-white">
              Curriculum Explorer
            </h3>
            <p className="text-xs text-navy-600 dark:text-navy-400 leading-relaxed">
              Complete semester-by-semester subject catalogs, official syllabus codes, core vs. elective subjects, and credit allotments across all 5 KSLU law courses.
            </p>
          </div>
          <Link
            to="/courses"
            className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline pt-2 border-t border-navy-100 dark:border-navy-800"
          >
            <span>View Full Curriculum</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Marking Schemes Breakdown */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-navy-200 dark:border-navy-800 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Examination Structure
          </span>
          <h2 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
            KSLU Examination Marking Schemes
          </h2>
          <p className="text-xs text-navy-500 mt-1">
            Understanding the question pattern and internal assessment distribution for Karnataka State Law University.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="p-5 rounded-2xl bg-navy-50 dark:bg-navy-800/40 border border-navy-100 dark:border-navy-700/60 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-navy-900 dark:text-white">{scheme.name}</span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-gold-100 dark:bg-gold-950/80 text-gold-800 dark:text-gold-300 font-bold">
                  Max: {scheme.maxMarks} Marks
                </span>
              </div>
              <p className="text-navy-600 dark:text-navy-400 leading-relaxed">
                {scheme.description}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-navy-200/60 dark:border-navy-700/60 text-navy-500">
                <span>Passing Minimum: <strong>{scheme.passingMarks} Marks</strong></span>
                <Link to={`/pyqs?schemeId=${scheme.id}`} className="text-gold-600 dark:text-gold-400 font-semibold hover:underline">
                  Filter PYQs for this scheme &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Law Programs Catalog */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
          Supported Law Programs (KSLU Affiliated)
        </h2>

        {loading ? (
          <CardSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-navy-800 dark:text-navy-200">
                      {course.code}
                    </span>
                    <span className="text-navy-500">{course.durationYears} Years</span>
                  </div>
                  <h3 className="font-bold text-sm text-navy-900 dark:text-white">{course.name}</h3>
                  <p className="text-navy-600 dark:text-navy-400 mt-1 line-clamp-2">{course.description}</p>
                </div>

                <div className="pt-3 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between">
                  <span className="text-navy-500">{course.totalSemesters} Semesters</span>
                  <Link
                    to={`/courses`}
                    className="text-gold-600 dark:text-gold-400 font-semibold hover:underline"
                  >
                    View Subjects &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
