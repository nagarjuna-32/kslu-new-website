import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Check,
  X,
  Eye,
  AlertTriangle,
  Clock,
  Filter,
  Plus,
  BookOpen,
  HelpCircle,
  Library,
  Scale,
  Edit2,
  Trash2,
  Upload,
  ExternalLink,
  Layers,
  GraduationCap,
  Calendar,
  Save,
  CheckCircle2,
  FileText
} from 'lucide-react';
import api from '../../api/client';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { PDFViewerModal } from '../../components/pdf/PDFViewerModal';
import { useNotification } from '../../contexts/NotificationContext';

export const NotesModerationPage = () => {
  const { setToast } = useNotification();
  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'queue'

  // Queue state
  const [status, setStatus] = useState('PENDING');
  const [queueNotes, setQueueNotes] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // Resource Manager state
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Filter state for Resources Tab
  const [filterCourseId, setFilterCourseId] = useState('');
  const [filterSemesterId, setFilterSemesterId] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Create / Edit Resource Modal
  const [resourceModal, setResourceModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    id: null,
    title: '',
    description: '',
    courseId: '',
    semesterId: '',
    subjectId: '',
    category: 'STUDY_NOTES',
    status: 'APPROVED',
    isExternalLink: false,
    fileUrl: '',
    file: null,
    tags: '',
    submitting: false,
    formSemesters: [],
    formSubjects: []
  });

  // Reject modal state for queue
  const [rejectModal, setRejectModal] = useState({ isOpen: false, noteId: null, noteTitle: '', reason: '' });

  // PDF Preview
  const [previewModal, setPreviewModal] = useState({ isOpen: false, fileUrl: '', title: '' });

  // 1. Fetch initial Courses
  useEffect(() => {
    api.get('/academic/courses')
      .then(res => {
        if (res.success && res.data?.courses) {
          setCourses(res.data.courses);
        }
      })
      .catch(console.error);
  }, []);

  // 2. Fetch queue notes
  const fetchQueueNotes = async () => {
    setLoadingQueue(true);
    try {
      const response = await api.get(`/notes/admin/all?status=${status}`);
      if (response.success && response.data) {
        setQueueNotes(response.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'queue') {
      fetchQueueNotes();
    }
  }, [activeTab, status]);

  // 3. Filter Semesters whenever filterCourseId changes
  useEffect(() => {
    setFilterSemesterId('');
    setFilterSubjectId('');
    setSubjects([]);
    if (!filterCourseId) {
      setSemesters([]);
      return;
    }
    api.get(`/academic/courses/${filterCourseId}/semesters`)
      .then(res => {
        if (res.success && res.data?.semesters) {
          const sorted = (res.data.semesters || []).sort((a, b) => a.semesterNumber - b.semesterNumber);
          setSemesters(sorted);
        }
      })
      .catch(() => setSemesters([]));
  }, [filterCourseId]);

  // 4. Filter Subjects whenever filterCourseId or filterSemesterId changes
  useEffect(() => {
    setFilterSubjectId('');
    if (!filterCourseId || !filterSemesterId) {
      setSubjects([]);
      return;
    }
    api.get(`/academic/subjects?courseId=${filterCourseId}&semesterId=${filterSemesterId}`)
      .then(res => {
        if (res.success && res.data?.subjects) {
          setSubjects(res.data.subjects);
        }
      })
      .catch(() => setSubjects([]));
  }, [filterCourseId, filterSemesterId]);

  // 5. Fetch resources list
  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const params = new URLSearchParams();
      if (filterCourseId) params.set('courseId', filterCourseId);
      if (filterSemesterId) params.set('semesterId', filterSemesterId);
      if (filterSubjectId) params.set('subjectId', filterSubjectId);
      if (filterCategory) params.set('category', filterCategory);
      params.set('limit', '50');

      const res = await api.get(`/notes/admin/all?${params.toString()}`);
      if (res.success && res.data) {
        setResources(res.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'resources') {
      fetchResources();
    }
  }, [activeTab, filterCourseId, filterSemesterId, filterSubjectId, filterCategory]);

  // Handle Form Cascading in Create/Edit Modal
  const handleModalCourseChange = async (cId) => {
    setResourceModal(prev => ({
      ...prev,
      courseId: cId,
      semesterId: '',
      subjectId: '',
      formSemesters: [],
      formSubjects: []
    }));

    if (!cId) return;
    try {
      const res = await api.get(`/academic/courses/${cId}/semesters`);
      if (res.success && res.data?.semesters) {
        const sorted = (res.data.semesters || []).sort((a, b) => a.semesterNumber - b.semesterNumber);
        setResourceModal(prev => ({ ...prev, formSemesters: sorted }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleModalSemesterChange = async (sId) => {
    setResourceModal(prev => ({
      ...prev,
      semesterId: sId,
      subjectId: '',
      formSubjects: []
    }));

    if (!sId || !resourceModal.courseId) return;
    try {
      const res = await api.get(`/academic/subjects?courseId=${resourceModal.courseId}&semesterId=${sId}`);
      if (res.success && res.data?.subjects) {
        setResourceModal(prev => ({ ...prev, formSubjects: res.data.subjects }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Create Resource Modal
  const openCreateModal = () => {
    setResourceModal({
      isOpen: true,
      mode: 'create',
      id: null,
      title: '',
      description: '',
      courseId: filterCourseId || '',
      semesterId: filterSemesterId || '',
      subjectId: filterSubjectId || '',
      category: filterCategory || 'STUDY_NOTES',
      status: 'APPROVED',
      isExternalLink: false,
      fileUrl: '',
      file: null,
      tags: '',
      submitting: false,
      formSemesters: semesters,
      formSubjects: subjects
    });

    if (filterCourseId && !semesters.length) {
      handleModalCourseChange(filterCourseId);
    }
  };

  // Open Edit Resource Modal
  const openEditModal = async (resItem) => {
    let modalSemesters = [];
    let modalSubjects = [];

    try {
      const semRes = await api.get(`/academic/courses/${resItem.courseId}/semesters`);
      if (semRes.success) modalSemesters = semRes.data.semesters || [];

      const subRes = await api.get(`/academic/subjects?courseId=${resItem.courseId}&semesterId=${resItem.semesterId}`);
      if (subRes.success) modalSubjects = subRes.data.subjects || [];
    } catch (e) {
      console.error(e);
    }

    setResourceModal({
      isOpen: true,
      mode: 'edit',
      id: resItem.id,
      title: resItem.title,
      description: resItem.description,
      courseId: resItem.courseId,
      semesterId: resItem.semesterId,
      subjectId: resItem.subjectId,
      category: resItem.category || 'STUDY_NOTES',
      status: resItem.status || 'APPROVED',
      isExternalLink: resItem.isExternalLink || false,
      fileUrl: resItem.fileUrl || '',
      file: null,
      tags: resItem.tags || '',
      submitting: false,
      formSemesters: modalSemesters,
      formSubjects: modalSubjects
    });
  };

  // Submit Create or Edit Resource
  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    const { mode, id, title, description, courseId, semesterId, subjectId, category, status, isExternalLink, fileUrl, file, tags } = resourceModal;

    if (!courseId || !semesterId || !subjectId) {
      setToast({ title: 'Validation Error', message: 'Course, Semester, and Subject are all required.', type: 'info' });
      return;
    }

    if (!isExternalLink && !file && mode === 'create') {
      setToast({ title: 'File Required', message: 'Please attach a PDF file or select external resource link.', type: 'info' });
      return;
    }

    if (isExternalLink && !fileUrl.trim()) {
      setToast({ title: 'URL Required', message: 'Please provide the external resource URL.', type: 'info' });
      return;
    }

    setResourceModal(prev => ({ ...prev, submitting: true }));

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('courseId', courseId);
      formData.append('semesterId', semesterId);
      formData.append('subjectId', subjectId);
      formData.append('category', category);
      formData.append('status', status);
      formData.append('isExternalLink', String(isExternalLink));
      if (fileUrl) formData.append('fileUrl', fileUrl);
      if (tags) formData.append('tags', tags);
      if (file) formData.append('file', file);

      let res;
      if (mode === 'create') {
        res = await api.post('/notes/admin/resource', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.put(`/notes/admin/resource/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.success) {
        setToast({
          title: mode === 'create' ? 'Resource Published' : 'Resource Updated',
          message: mode === 'create' ? 'Curriculum study material added successfully.' : 'Resource updated successfully.',
          type: 'APPROVAL'
        });
        setResourceModal(prev => ({ ...prev, isOpen: false }));
        fetchResources();
      }
    } catch (err) {
      setToast({ title: 'Error', message: err.message || 'Operation failed. Please verify academic hierarchy.', type: 'REJECTION' });
    } finally {
      setResourceModal(prev => ({ ...prev, submitting: false }));
    }
  };

  // Delete Resource
  const handleDeleteResource = async (id, resTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${resTitle}"? This will remove the resource from student access.`)) {
      return;
    }
    try {
      const res = await api.delete(`/notes/admin/resource/${id}`);
      if (res.success) {
        setToast({ title: 'Resource Deleted', message: 'Study material removed successfully.', type: 'APPROVAL' });
        fetchResources();
      }
    } catch (err) {
      setToast({ title: 'Error', message: err.message || 'Failed to delete resource.', type: 'REJECTION' });
    }
  };

  // Queue actions
  const handleApprove = async (id) => {
    try {
      const res = await api.post(`/notes/admin/${id}/approve`);
      if (res.success) {
        setToast({ title: 'Note Approved', message: 'Study note approved and published to academic library.', type: 'APPROVAL' });
        fetchQueueNotes();
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
        fetchQueueNotes();
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
            Academic Management & Moderation
          </span>
          <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
            Notes & Curriculum Resources Management
          </h1>
          <p className="text-xs text-navy-500 dark:text-navy-400 mt-1">
            Manage course-wise, semester-wise, and subject-wise academic study materials across all 4 categories.
          </p>
        </div>

        {/* Primary Tabs */}
        <div className="flex bg-navy-100 dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl p-1 text-xs shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition ${
              activeTab === 'resources'
                ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                : 'text-navy-600 dark:text-navy-400 hover:text-navy-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curriculum Resources</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition ${
              activeTab === 'queue'
                ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                : 'text-navy-600 dark:text-navy-400 hover:text-navy-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Student Submissions Queue</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: CURRICULUM RESOURCE MANAGER
      ========================================================================= */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Action & Filter Toolbar */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gold-500" />
                <h3 className="font-serif font-bold text-sm text-navy-900 dark:text-white">
                  Filter Academic Materials by Hierarchy
                </h3>
              </div>

              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-500 text-white text-xs font-bold rounded-xl shadow-md transition shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Study Resource</span>
              </button>
            </div>

            {/* Cascading Filter Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-navy-100 dark:border-navy-800 text-xs">
              {/* Course */}
              <div>
                <label className="block text-[11px] font-semibold text-navy-500 mb-1">Degree Programme</label>
                <select
                  value={filterCourseId}
                  onChange={(e) => setFilterCourseId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                >
                  <option value="">All Law Courses</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-[11px] font-semibold text-navy-500 mb-1">Semester</label>
                <select
                  disabled={!filterCourseId}
                  value={filterSemesterId}
                  onChange={(e) => setFilterSemesterId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none disabled:opacity-50"
                >
                  <option value="">All Semesters</option>
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-semibold text-navy-500 mb-1">Subject</label>
                <select
                  disabled={!filterSemesterId}
                  value={filterSubjectId}
                  onChange={(e) => setFilterSubjectId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none disabled:opacity-50"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-navy-500 mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-2.5 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                >
                  <option value="">All 4 Categories</option>
                  <option value="STUDY_NOTES">📖 Study Notes</option>
                  <option value="IMPORTANT_QUESTIONS">❓ Important Questions</option>
                  <option value="REFERENCE_BOOKS">📚 Reference Books</option>
                  <option value="CASE_LAWS">⚖️ Case Laws</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resources Table */}
          {loadingResources ? (
            <TableSkeleton />
          ) : resources.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No study resources found"
              description="No resources match the selected filters. Click 'Add Study Resource' above to add verified materials."
              action={
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-gold-600 text-white text-xs font-bold rounded-xl"
                >
                  Add First Resource
                </button>
              }
            />
          ) : (
            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-200 dark:border-navy-800 shadow-sm overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left divide-y divide-navy-100 dark:divide-navy-800">
                  <thead className="bg-navy-50 dark:bg-navy-800/50 text-navy-500 font-semibold">
                    <tr>
                      <th className="px-5 py-3">Title & Category</th>
                      <th className="px-5 py-3">Academic Hierarchy</th>
                      <th className="px-5 py-3">Format</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Uploaded By</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100 dark:divide-navy-800/60">
                    {resources.map((res) => {
                      const catBadge = {
                        STUDY_NOTES: { label: '📖 Study Notes', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' },
                        IMPORTANT_QUESTIONS: { label: '❓ Imp Questions', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300' },
                        REFERENCE_BOOKS: { label: '📚 Ref Books', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' },
                        CASE_LAWS: { label: '⚖️ Case Laws', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300' }
                      }[res.category] || { label: res.category, bg: 'bg-navy-100 text-navy-800' };

                      return (
                        <tr key={res.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/30 transition">
                          <td className="px-5 py-3.5 max-w-xs">
                            <p className="font-semibold text-navy-900 dark:text-white truncate">{res.title}</p>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${catBadge.bg}`}>
                              {catBadge.label}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="font-mono text-[11px] text-gold-600 dark:text-gold-400 block font-semibold">
                              {res.course?.code} • {res.semester?.title}
                            </span>
                            <span className="text-navy-700 dark:text-navy-300 block truncate max-w-xs">{res.subject?.code} - {res.subject?.name}</span>
                          </td>

                          <td className="px-5 py-3.5">
                            {res.isExternalLink ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                                <ExternalLink className="w-3 h-3" />
                                <span>External Link</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-navy-600 dark:text-navy-400">
                                <FileText className="w-3 h-3 text-gold-500" />
                                <span>PDF Document</span>
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              res.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : res.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}>
                              {res.status === 'APPROVED' ? 'PUBLISHED' : res.status}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-navy-500 text-[11px]">
                            {res.uploadedBy?.fullName || 'Administrator'}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setPreviewModal({ isOpen: true, fileUrl: res.fileUrl, title: res.title })}
                                className="p-1.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 rounded-lg text-navy-700 dark:text-navy-300 transition"
                                title="Preview Resource"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => openEditModal(res)}
                                className="p-1.5 bg-navy-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-white rounded-lg text-navy-700 dark:text-navy-300 transition"
                                title="Edit Resource"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteResource(res.id, res.title)}
                                className="p-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition"
                                title="Delete Resource"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: MODERATION QUEUE (Student Submissions)
      ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-navy-900 dark:text-white">
              Student Contribution Review Queue
            </h3>

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

          {loadingQueue ? (
            <TableSkeleton />
          ) : queueNotes.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title={`No ${status.toLowerCase()} student submissions`}
              description="The student submission queue is clear for this status."
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
                    {queueNotes.map((note) => (
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
                              className="p-1.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 rounded-lg text-navy-700 dark:text-navy-300 transition"
                              title="Preview Note Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {note.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleApprove(note.id)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition"
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
                                className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm transition"
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
        </div>
      )}

      {/* =========================================================================
          CREATE / EDIT RESOURCE MODAL
      ========================================================================= */}
      {resourceModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-navy-200 dark:border-navy-700 shadow-2xl space-y-5 text-xs my-8">
            <div className="flex items-center justify-between pb-3 border-b border-navy-100 dark:border-navy-800">
              <div>
                <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-white">
                  {resourceModal.mode === 'create' ? 'Add Curriculum Study Resource' : 'Edit Study Resource'}
                </h3>
                <p className="text-[11px] text-navy-500 mt-0.5">
                  Ensure strict academic hierarchy (Course → Semester → Subject) before publishing.
                </p>
              </div>
              <button
                onClick={() => setResourceModal(prev => ({ ...prev, isOpen: false }))}
                className="text-navy-400 hover:text-navy-700 dark:hover:text-navy-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResourceSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={resourceModal.title}
                  onChange={(e) => setResourceModal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Constitutional Law I - Fundamental Rights Complete Notes"
                  className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              {/* Dynamic Cascading Hierarchy: Course -> Semester -> Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Course */}
                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                    Course *
                  </label>
                  <select
                    required
                    value={resourceModal.courseId}
                    onChange={(e) => handleModalCourseChange(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                    Semester *
                  </label>
                  <select
                    required
                    disabled={!resourceModal.courseId}
                    value={resourceModal.semesterId}
                    onChange={(e) => handleModalSemesterChange(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Select Semester</option>
                    {resourceModal.formSemesters.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                    Subject *
                  </label>
                  <select
                    required
                    disabled={!resourceModal.semesterId}
                    value={resourceModal.subjectId}
                    onChange={(e) => setResourceModal(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Select Subject</option>
                    {resourceModal.formSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                    Notes Category *
                  </label>
                  <select
                    required
                    value={resourceModal.category}
                    onChange={(e) => setResourceModal(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  >
                    <option value="STUDY_NOTES">📖 Study Notes</option>
                    <option value="IMPORTANT_QUESTIONS">❓ Important Questions</option>
                    <option value="REFERENCE_BOOKS">📚 Reference Books</option>
                    <option value="CASE_LAWS">⚖️ Case Laws</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                    Publication Status *
                  </label>
                  <select
                    required
                    value={resourceModal.status}
                    onChange={(e) => setResourceModal(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  >
                    <option value="APPROVED">Published (Live to Students)</option>
                    <option value="PENDING">Draft / Pending Review</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                  Description & Key Topics Covered *
                </label>
                <textarea
                  rows="3"
                  required
                  value={resourceModal.description}
                  onChange={(e) => setResourceModal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Outline topics covered, key statutes, relevance to examination scheme..."
                  className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                ></textarea>
              </div>

              {/* Resource Mode: Upload PDF vs External Link */}
              <div className="space-y-3 pt-2 border-t border-navy-100 dark:border-navy-800">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-navy-800 dark:text-navy-200">
                    <input
                      type="radio"
                      name="resourceMode"
                      checked={!resourceModal.isExternalLink}
                      onChange={() => setResourceModal(prev => ({ ...prev, isExternalLink: false }))}
                      className="text-gold-600 focus:ring-gold-500"
                    />
                    <span>Upload PDF Document</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-navy-800 dark:text-navy-200">
                    <input
                      type="radio"
                      name="resourceMode"
                      checked={resourceModal.isExternalLink}
                      onChange={() => setResourceModal(prev => ({ ...prev, isExternalLink: true }))}
                      className="text-gold-600 focus:ring-gold-500"
                    />
                    <span>External Resource URL (e.g. Google Drive, Portal)</span>
                  </label>
                </div>

                {!resourceModal.isExternalLink ? (
                  <div>
                    <label className="block font-semibold text-navy-700 dark:text-navy-300 mb-1">
                      PDF Document File {resourceModal.mode === 'create' ? '*' : '(Leave empty to keep existing)'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setResourceModal(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                      className="w-full text-xs text-navy-600 dark:text-navy-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white dark:file:bg-gold-600 dark:file:text-navy-950 hover:file:opacity-90"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-navy-700 dark:text-navy-300 mb-1">
                      External Resource URL *
                    </label>
                    <input
                      type="url"
                      required={resourceModal.isExternalLink}
                      value={resourceModal.fileUrl}
                      onChange={(e) => setResourceModal(prev => ({ ...prev, fileUrl: e.target.value }))}
                      placeholder="https://drive.google.com/... or https://..."
                      className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={resourceModal.tags}
                  onChange={(e) => setResourceModal(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g. Fundamental Rights, Article 14, Golden Rule, Kesavananda"
                  className="w-full px-3.5 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-navy-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setResourceModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-700 dark:text-navy-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resourceModal.submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-gold-600 hover:bg-gold-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{resourceModal.submitting ? 'Saving...' : resourceModal.mode === 'create' ? 'Publish Resource' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal for Queue */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-md w-full p-6 border border-navy-200 dark:border-navy-700 shadow-2xl space-y-4 text-xs">
            <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white">
              Reject Note Submission
            </h3>
            <p className="text-navy-500">
              Provide feedback for <strong className="text-navy-800 dark:text-navy-200">"{rejectModal.noteTitle}"</strong>. This will be sent to the student author.
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
                  placeholder="e.g. Incomplete syllabus coverage; missing Unit 3 & 4; unreadable scan quality..."
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
