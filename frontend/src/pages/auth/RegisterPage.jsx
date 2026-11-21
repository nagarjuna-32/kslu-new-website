import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { setToast } = useNotification();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semesterId, setSemesterId] = useState('');

  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setSemesterId('');
    }
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await register({
        fullName,
        email,
        password,
        collegeName,
        courseId: courseId || null,
        semesterId: semesterId || null
      });

      if (response.success) {
        setToast({
          title: 'Account Created',
          message: 'Welcome to KSLU Circle! Your student workspace is ready.',
          type: 'APPROVAL'
        });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-lg w-full bg-white dark:bg-navy-900 rounded-3xl p-8 border border-navy-200 dark:border-navy-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group mb-1">
            <div className="p-2.5 bg-white dark:bg-navy-800/80 rounded-2xl shadow-sm border border-navy-100 dark:border-navy-700/80 group-hover:scale-105 transition-transform">
              <img src="/logo_stacked.png" alt="KSLU Circle" className="h-16 w-auto object-contain mx-auto" />
            </div>
          </Link>
          <h2 className="font-serif text-2xl font-bold text-navy-900 dark:text-white pt-2">
            Create Student Account
          </h2>
          <p className="text-xs text-navy-500">
            Join Karnataka's law student peer-learning network.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aditya Rao"
              className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
              Create Password (min. 6 characters) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
              Affiliated Law College Name
            </label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g. Bangalore Institute of Legal Studies (BILS)"
              className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                Law Course
              </label>
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
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                Current Semester
              </label>
              <select
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                disabled={!courseId}
                className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none disabled:opacity-50"
              >
                <option value="">Select Semester</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>Creating account...</span> : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Join KSLU Circle</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-navy-500">
          <span>Already have an account? </span>
          <Link to="/login" className="font-semibold text-gold-600 dark:text-gold-400 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
