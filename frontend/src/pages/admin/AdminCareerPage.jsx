import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, Calendar, MapPin, DollarSign, ExternalLink, X } from 'lucide-react';
import api from '../../api/client';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { useNotification } from '../../contexts/NotificationContext';

export const AdminCareerPage = () => {
  const { setToast } = useNotification();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [opportunityType, setOpportunityType] = useState('INTERNSHIP');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [stipend, setStipend] = useState('');
  const [deadline, setDeadline] = useState('');
  const [applyUrl, setApplyUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [description, setDescription] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/career?limit=50');
      if (res.success && res.data) {
        setOpportunities(res.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/career', {
        title,
        organization,
        opportunityType,
        location,
        stipend: stipend || null,
        deadline: deadline || null,
        applyUrl: applyUrl || null,
        contactEmail: contactEmail || null,
        description,
        eligibility: eligibility || null,
        isFeatured
      });

      if (res.success) {
        setToast({ title: 'Opportunity Published', message: 'Listing has been added to Career & Moots Hub.', type: 'APPROVAL' });
        setModalOpen(false);
        setTitle('');
        setOrganization('');
        setDescription('');
        fetchOpportunities();
      }
    } catch (err) {
      setToast({ title: 'Error', message: err.message, type: 'REJECTION' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, oppTitle) => {
    if (!window.confirm(`Delete opportunity "${oppTitle}"?`)) return;
    try {
      await api.delete(`/career/${id}`);
      setToast({ title: 'Deleted', message: 'Opportunity deleted.', type: 'info' });
      fetchOpportunities();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Professional Opportunities
          </span>
          <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
            Career & Moots Hub Management
          </h1>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:text-white text-xs font-bold rounded-xl shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-200 dark:border-navy-800 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-navy-100 dark:divide-navy-800">
              <thead className="bg-navy-50 dark:bg-navy-800/50 text-navy-500 font-semibold">
                <tr>
                  <th className="px-5 py-3">Role / Competition Title</th>
                  <th className="px-5 py-3">Organization</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Location & Stipend</th>
                  <th className="px-5 py-3">Deadline</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800/60">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/30 transition">
                    <td className="px-5 py-3.5 max-w-xs font-semibold text-navy-900 dark:text-white truncate">
                      {opp.title}
                    </td>

                    <td className="px-5 py-3.5 text-navy-700 dark:text-navy-300">
                      {opp.organization}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
                        {opp.opportunityType}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-navy-600 dark:text-navy-400">
                      <span>{opp.location}</span>
                      {opp.stipend && <span className="block font-medium text-emerald-600 dark:text-emerald-400 text-[11px]">{opp.stipend}</span>}
                    </td>

                    <td className="px-5 py-3.5 text-navy-400 text-[11px]">
                      {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(opp.id, opp.title)}
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

      {/* Post Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-navy-200 dark:border-navy-700 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white">
                Post Opportunity
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-navy-400 hover:text-navy-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. High Court of Karnataka Judicial Clerkship"
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Organization *</label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. High Court of Karnataka / Trilegal"
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Category *</label>
                  <select
                    value={opportunityType}
                    onChange={(e) => setOpportunityType(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  >
                    <option value="INTERNSHIP">Internship</option>
                    <option value="MOOT_COURT">Moot Court Competition</option>
                    <option value="RESEARCH">Research Fellowship</option>
                    <option value="WORKSHOP">Workshop / Seminar</option>
                    <option value="ALUMNI_JOB">Advocate Job</option>
                    <option value="COMPETITION">Essay / Legal Competition</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, Karnataka (Hybrid)"
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Stipend / Honorarium</label>
                  <input
                    type="text"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                    placeholder="e.g. ₹20,000 / month"
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Apply URL</label>
                  <input
                    type="url"
                    value={applyUrl}
                    onChange={(e) => setApplyUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key responsibilities, learning outcomes..."
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="e.g. Open to 3rd year and 5th year LL.B students..."
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-gold-600 focus:ring-gold-500"
                  />
                  <span className="font-semibold text-navy-800 dark:text-navy-200">
                    Feature on Homepage Carousel
                  </span>
                </label>
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
                  disabled={submitting}
                  className="px-4 py-1.5 bg-navy-900 text-gold-400 dark:bg-gold-600 dark:text-white font-bold rounded-lg shadow-md"
                >
                  {submitting ? 'Posting...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
