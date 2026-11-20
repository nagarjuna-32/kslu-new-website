import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle, Shield, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const { setToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password });
      if (response.success) {
        setToast({
          title: 'Welcome to KSLU Circle',
          message: 'Signed in successfully.',
          type: 'APPROVAL'
        });
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Accounts Fill
  const fillCredentials = (role) => {
    if (role === 'student') {
      setEmail('student@kslucircle.org');
      setPassword('Student@2025!');
    } else if (role === 'admin') {
      setEmail('admin@kslucircle.org');
      setPassword('Admin@2025!');
    } else if (role === 'superadmin') {
      setEmail('superadmin@kslucircle.org');
      setPassword('SuperAdmin@2025!');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white dark:bg-navy-900 rounded-3xl p-8 border border-navy-200 dark:border-navy-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-navy-900 border border-gold-500/40 flex items-center justify-center p-1.5 shadow-md">
              <img src="/logo-icon.svg" alt="KSLU Circle" className="w-full h-full" />
            </div>
            <span className="font-serif font-bold text-xl text-navy-900 dark:text-white">
              KSLU Circle
            </span>
          </Link>
          <h2 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-navy-500">
            Access previous year question papers, notes, and the student forum.
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="p-3.5 bg-navy-50 dark:bg-navy-800/60 rounded-2xl border border-navy-100 dark:border-navy-700/60 space-y-2 text-xs">
          <span className="font-semibold text-navy-600 dark:text-navy-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Quick Demo Sign-In Credentials:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fillCredentials('student')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-200 hover:border-gold-500 transition text-[11px]"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-200 hover:border-gold-500 transition text-[11px]"
            >
              ⚖️ Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('superadmin')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-200 hover:border-gold-500 transition text-[11px]"
            >
              🛡️ Superadmin
            </button>
          </div>
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
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@kslucircle.org"
              className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-navy-800 dark:text-navy-200">
                Password
              </label>
              <Link to="/forgot-password" className="text-gold-600 dark:text-gold-400 hover:underline text-[11px]">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>Authenticating...</span> : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to KSLU Circle</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-navy-500">
          <span>Don't have a student account? </span>
          <Link to="/register" className="font-semibold text-gold-600 dark:text-gold-400 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};
