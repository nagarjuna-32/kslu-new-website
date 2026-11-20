import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const StudentProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { setToast } = useNotification();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [collegeName, setCollegeName] = useState(user?.collegeName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [courseId, setCourseId] = useState(user?.courseId || '');
  const [semesterId, setSemesterId] = useState(user?.semesterId || '');

  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/academic/courses')
      .then(res => setCourses(res.data?.courses || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (courseId) {
      api.get(`/academic/courses/${courseId}/semesters`)
        .then(res => setSemesters(res.data?.semesters || []))
        .catch(() => setSemesters([]));
    } else {
      setSemesters([]);
    }
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await api.put('/auth/profile', {
        fullName,
        collegeName,
        phone,
        courseId: courseId || null,
        semesterId: semesterId || null
      });

      if (response.success && response.data?.user) {
        updateUser(response.data.user);
        setSuccess(true);
        setToast({ title: 'Profile Updated', message: 'Your settings have been saved.', type: 'APPROVAL' });
      }
    } catch (err) {
      console.error(err);
      setToast({ title: 'Error', message: err.message, type: 'REJECTION' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-navy-200 dark:border-navy-800 shadow-sm space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
          Account Preferences
        </span>
        <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
          Student Profile & Academic Settings
        </h1>
        <p className="text-xs text-navy-500 mt-1">
          Configure your law course and affiliated college to customize your PYQ recommendations and dashboard updates.
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile changes updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Full Legal Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Email Address</label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full px-3 py-2 bg-navy-100 dark:bg-navy-800/50 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-500 cursor-not-allowed"
          />
          <span className="text-[10px] text-navy-400 mt-0.5 block">Email cannot be changed directly.</span>
        </div>

        <div>
          <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Affiliated Law College Name</label>
          <input
            type="text"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            placeholder="e.g. Bangalore Institute of Legal Studies, University Law College"
            className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Enrolled Law Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
            >
              <option value="">Select Enrolled Program</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Current Semester</label>
            <select
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              disabled={!courseId}
              className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none disabled:opacity-50"
            >
              <option value="">Select Current Semester</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Contact Phone (Optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
