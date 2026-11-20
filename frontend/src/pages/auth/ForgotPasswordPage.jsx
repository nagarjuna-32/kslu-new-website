import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../../api/client';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (response.data?.devToken) {
        setDevToken(response.data.devToken);
      }
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white dark:bg-navy-900 rounded-3xl p-8 border border-navy-200 dark:border-navy-800 shadow-2xl space-y-6">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-900 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
            Reset Password
          </h2>
          <p className="text-xs text-navy-500">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-semibold text-sm text-navy-900 dark:text-white">
              Instructions Dispatched
            </h3>
            <p className="text-xs text-navy-500">
              If an account with that email exists, password reset instructions have been generated.
            </p>

            {devToken && (
              <div className="p-3 bg-navy-50 dark:bg-navy-800 rounded-xl text-left text-xs space-y-2 border border-navy-200 dark:border-navy-700">
                <span className="font-semibold text-gold-600 dark:text-gold-400 block">Development Quick Link:</span>
                <Link
                  to={`/reset-password?token=${devToken}`}
                  className="text-[11px] font-mono text-blue-600 dark:text-blue-400 underline break-all block"
                >
                  Click to Reset Password (Dev Mode)
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                Account Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@kslucircle.org"
                className="w-full px-3.5 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white font-bold rounded-xl transition shadow-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
