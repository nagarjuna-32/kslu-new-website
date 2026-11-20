import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
          Support & Academic Inquiries
        </span>
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white">
          Contact KSLU Circle
        </h1>
        <p className="text-sm text-navy-600 dark:text-navy-300 max-w-xl mx-auto">
          Have questions regarding question papers, notice an error in a subject code, or wish to contribute academic notes? Reach out to our student coordination team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 space-y-2">
            <Mail className="w-5 h-5 text-gold-600 dark:text-gold-400" />
            <h3 className="font-semibold text-xs text-navy-900 dark:text-white">Email Address</h3>
            <p className="text-xs text-navy-600 dark:text-navy-400">contact@kslucircle.org</p>
          </div>

          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 space-y-2">
            <MapPin className="w-5 h-5 text-gold-600 dark:text-gold-400" />
            <h3 className="font-semibold text-xs text-navy-900 dark:text-white">Community Base</h3>
            <p className="text-xs text-navy-600 dark:text-navy-400">Bengaluru & Hubballi, Karnataka, India</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-navy-900 rounded-2xl p-6 sm:p-8 border border-navy-200 dark:border-navy-800 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">Message Received</h3>
              <p className="text-xs text-navy-600 dark:text-navy-400 max-w-sm mx-auto">
                Thank you for contacting the KSLU Circle student team. We will review your inquiry shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-800 dark:text-navy-200 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="Adv. / Student Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-800 dark:text-navy-200 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-navy-200 mb-1">Subject / Topic</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="e.g. Missing 2023 Dec PYQ for IPC"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-navy-200 mb-1">Message</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Provide details of your question or feedback..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white text-xs font-bold rounded-xl transition shadow-md"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
