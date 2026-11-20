import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, BookOpen, Trash2, X } from 'lucide-react';
import api from '../../api/client';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { useNotification } from '../../contexts/NotificationContext';

export const AcademicManagementPage = () => {
  const { setToast } = useNotification();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add subject modal
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [credits, setCredits] = useState(4);
  const [isCore, setIsCore] = useState(true);

  useEffect(() => {
    api.get('/academic/courses').then((res) => {
      if (res.success && res.data?.courses?.length > 0) {
        setCourses(res.data.courses);
        setSelectedCourseId(res.data.courses[0].id);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    setLoading(true);
    Promise.all([
      api.get(`/academic/courses/${selectedCourseId}/semesters`),
      api.get(`/academic/subjects?courseId=${selectedCourseId}`)
    ]).then(([semRes, subRes]) => {
      setSemesters(semRes.data?.semesters || []);
      setSubjects(subRes.data?.subjects || []);
      setLoading(false);
    });
  }, [selectedCourseId]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/academic/subjects', {
        courseId: selectedCourseId,
        semesterId,
        code,
        name,
        description: desc,
        credits: parseInt(credits, 10),
        isCore
      });

      if (res.success) {
        setToast({ title: 'Subject Created', message: `${name} (${code}) added to curriculum.`, type: 'APPROVAL' });
        setModalOpen(false);
        setCode('');
        setName('');
        setDesc('');
        // Refresh subjects
        api.get(`/academic/subjects?courseId=${selectedCourseId}`).then(r => setSubjects(r.data?.subjects || []));
      }
    } catch (err) {
      setToast({ title: 'Error', message: err.message, type: 'REJECTION' });
    }
  };

  const handleDeleteSubject = async (subId, subName) => {
    if (!window.confirm(`Delete subject "${subName}" from curriculum?`)) return;
    try {
      await api.delete(`/academic/subjects/${subId}`);
      setToast({ title: 'Subject Removed', message: 'Subject deleted.', type: 'info' });
      setSubjects(prev => prev.filter(s => s.id !== subId));
    } catch (err) {
      setToast({ title: 'Cannot Delete', message: err.message, type: 'REJECTION' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Curriculum Administration
          </span>
          <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
            Academic Programs & Subjects
          </h1>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:text-white text-xs font-bold rounded-xl shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject to Program</span>
        </button>
      </div>

      {/* Course selector tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1">
        {courses.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCourseId(c.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCourseId === c.id
                ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                : 'bg-white dark:bg-navy-900 text-navy-600 dark:text-navy-400 border border-navy-200 dark:border-navy-800 hover:bg-navy-50'
            }`}
          >
            {c.name} ({c.code})
          </button>
        ))}
      </div>

      {/* Subjects Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-200 dark:border-navy-800 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-navy-100 dark:divide-navy-800">
              <thead className="bg-navy-50 dark:bg-navy-800/50 text-navy-500 font-semibold">
                <tr>
                  <th className="px-5 py-3">Subject Code</th>
                  <th className="px-5 py-3">Subject Title</th>
                  <th className="px-5 py-3">Semester</th>
                  <th className="px-5 py-3">Credits</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800/60">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/30 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-gold-600 dark:text-gold-400">
                      {sub.code}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-navy-900 dark:text-white max-w-sm">
                      {sub.name}
                      {sub.description && (
                        <p className="text-[11px] font-normal text-navy-500 line-clamp-1 mt-0.5">{sub.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-navy-700 dark:text-navy-300">
                      {sub.semester?.title}
                    </td>
                    <td className="px-5 py-3.5 text-navy-700 dark:text-navy-300">
                      {sub.credits} Credits
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${sub.isCore ? 'bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-300' : 'bg-gold-100 text-gold-700'}`}>
                        {sub.isCore ? 'Core' : 'Elective'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteSubject(sub.id, sub.name)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-md w-full p-6 border border-navy-200 dark:border-navy-700 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white">
                Add Subject to Curriculum
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-navy-400 hover:text-navy-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. 1011"
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Semester *</label>
                  <select
                    required
                    value={semesterId}
                    onChange={(e) => setSemesterId(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  >
                    <option value="">Select Sem</option>
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Official Subject Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Constitutional Law I"
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Syllabus Overview / Units</label>
                <textarea
                  rows="3"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Core syllabus overview, units covered..."
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCore}
                      onChange={(e) => setIsCore(e.target.checked)}
                      className="rounded text-gold-600 focus:ring-gold-500"
                    />
                    <span className="font-semibold text-navy-800 dark:text-navy-200">Core Subject</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border border-navy-200 dark:border-navy-700 rounded-lg text-navy-700 dark:text-navy-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-navy-900 text-gold-400 dark:bg-gold-600 dark:text-white font-bold rounded-lg shadow-md"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
