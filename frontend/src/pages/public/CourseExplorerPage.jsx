import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ChevronRight,
  BookOpen,
  FileText,
  Layers,
  Award,
  ChevronDown
} from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

export const CourseExplorerPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [openSemesters, setOpenSemesters] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/academic/courses');
        if (response.success && response.data?.courses) {
          setCourses(response.data.courses);
          if (response.data.courses.length > 0) {
            setSelectedCourse(response.data.courses[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    const fetchCourseDetails = async () => {
      setDetailsLoading(true);
      try {
        const response = await api.get(`/academic/courses/${selectedCourse.id}`);
        if (response.success && response.data?.course) {
          setCourseDetails(response.data.course);
          // Auto-expand Semester 1
          if (response.data.course.semesters?.length > 0) {
            setOpenSemesters({ [response.data.course.semesters[0].id]: true });
          }
        }
      } catch (err) {
        console.error('Failed to load course details', err);
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchCourseDetails();
  }, [selectedCourse]);

  const toggleSemester = (semId) => {
    setOpenSemesters(prev => ({ ...prev, [semId]: !prev[semId] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
          Academic Structure
        </span>
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white mt-1">
          KSLU Curriculum & Syllabus Explorer
        </h1>
        <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-400 mt-1">
          Official academic hierarchy: Course → Semester → Subject → Marking Scheme.
        </p>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Course Selector List */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-500 mb-2 px-1">
              Law Programs
            </h3>
            {courses.map((c) => {
              const isSelected = selectedCourse?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourse(c)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-navy-900 text-white border-navy-900 dark:bg-navy-800 dark:border-gold-500/50 shadow-md font-semibold'
                      : 'bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-800 text-navy-800 dark:text-navy-200 hover:bg-navy-50 dark:hover:bg-navy-800/60'
                  }`}
                >
                  <div>
                    <span className="block font-bold">{c.name}</span>
                    <span className="text-[11px] opacity-75">{c.durationYears} Years ({c.totalSemesters} Semesters)</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-gold-400' : 'text-navy-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Semester & Subject Hierarchy */}
          <div className="lg:col-span-3 space-y-6">
            {detailsLoading ? (
              <CardSkeleton />
            ) : courseDetails ? (
              <div className="space-y-6">
                {/* Course Header card */}
                <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-navy-100 dark:bg-navy-800 text-navy-800 dark:text-navy-200">
                      Code: {courseDetails.code}
                    </span>
                    <span className="text-xs text-gold-600 dark:text-gold-400 font-semibold">
                      Scheme 80 Marks & Scheme 100 Marks
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
                    {courseDetails.name}
                  </h2>
                  <p className="text-xs text-navy-600 dark:text-navy-400 mt-2">
                    {courseDetails.description}
                  </p>
                </div>

                {/* Semesters Accordion */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-navy-500">
                    Semesters & Core Syllabi ({courseDetails.semesters?.length || 0} Semesters)
                  </h3>

                  {courseDetails.semesters?.map((sem) => {
                    const isOpen = !!openSemesters[sem.id];
                    return (
                      <div
                        key={sem.id}
                        className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-200 dark:border-navy-800 overflow-hidden shadow-sm"
                      >
                        <button
                          onClick={() => toggleSemester(sem.id)}
                          className="w-full px-5 py-4 flex items-center justify-between hover:bg-navy-50 dark:hover:bg-navy-800/40 transition text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-navy-100 dark:bg-navy-800 text-navy-800 dark:text-gold-400 font-bold text-xs flex items-center justify-center">
                              {sem.semesterNumber}
                            </span>
                            <div>
                              <h4 className="font-semibold text-sm text-navy-900 dark:text-white">
                                {sem.title}
                              </h4>
                              <p className="text-[11px] text-navy-500">
                                {sem.subjects?.length || 0} Prescribed Subjects
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-navy-400 transition-transform ${
                              isOpen ? 'rotate-180 text-gold-500' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-5 pt-2 border-t border-navy-100 dark:border-navy-800/60 divide-y divide-navy-100 dark:divide-navy-800/60">
                            {sem.subjects?.length === 0 ? (
                              <p className="text-xs text-navy-400 py-3 italic">
                                Syllabi subjects being cataloged by academic team.
                              </p>
                            ) : (
                              sem.subjects?.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-gold-100 dark:bg-gold-950/60 text-gold-700 dark:text-gold-400">
                                        {sub.code}
                                      </span>
                                      <span className="font-semibold text-navy-900 dark:text-white">
                                        {sub.name}
                                      </span>
                                      {sub.isCore && (
                                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300">
                                          Core
                                        </span>
                                      )}
                                    </div>
                                    {sub.description && (
                                      <p className="text-[11px] text-navy-500 line-clamp-2 max-w-xl">
                                        {sub.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                                    <Link
                                      to={`/pyqs?subjectId=${sub.id}`}
                                      className="px-2.5 py-1.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-800 dark:text-navy-200 rounded-lg text-[11px] font-medium transition flex items-center gap-1"
                                    >
                                      <FileText className="w-3 h-3 text-gold-500" />
                                      <span>View PYQs</span>
                                    </Link>
                                    <Link
                                      to={`/notes?subjectId=${sub.id}`}
                                      className="px-2.5 py-1.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-800 dark:text-navy-200 rounded-lg text-[11px] font-medium transition flex items-center gap-1"
                                    >
                                      <BookOpen className="w-3 h-3 text-gold-500" />
                                      <span>Notes</span>
                                    </Link>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
