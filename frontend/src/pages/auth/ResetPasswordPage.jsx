import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { useNotification } from '../../contexts/NotificationContext';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { setToast } = useNotification();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });

      if (response.success) {
        setSuccess(true);
        setToast({ title: 'Password Reset', message: 'You can now sign in with your new password.', type: 'APPROVAL' });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white dark:bg-navy-900 rounded-3xl p-8 border border-navy-200 dark:border-navy-800 shadow-2xl space-y-6 text-xs">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group mb-1">
            <div className="p-2 bg-white dark:bg-navy-800/80 rounded-2xl shadow-sm border border-navy-100 dark:border-navy-700/80 group-hover:scale-105 transition-transform">
              <img src="/logo_stacked.png" alt="KSLU Circle" className="h-14 w-auto object-contain mx-auto" />
            </div>
          </Link>
          <h2 className="font-serif text-2xl font-bold text-navy-900 dark:text-white pt-1">
            Set New Password
          </h2>
          <p className="text-navy-500">
            Create a secure password with at least 6 characters.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-navy-900 dark:text-white">Password Updated</h3>
            <p className="text-navy-500">Redirecting to sign-in portal...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white font-bold rounded-xl transition shadow-lg disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save and Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
