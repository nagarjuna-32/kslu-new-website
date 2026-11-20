import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  Calendar,
  ExternalLink,
  DollarSign,
  Search,
  Filter,
  Award,
  Sparkles
} from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';

export const CareerHubPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (search) params.append('search', search);

        const response = await api.get(`/career?${params.toString()}`);
        if (response.success && response.data) {
          setOpportunities(response.data.items || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, [type, search]);

  const typeLabels = {
    INTERNSHIP: 'Internship',
    MOOT_COURT: 'Moot Court',
    RESEARCH: 'Research Fellowship',
    WORKSHOP: 'Workshop / Seminar',
    ALUMNI_JOB: 'Advocate Job / Associate',
    COMPETITION: 'Competition'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
          Professional Legal Horizons
        </span>
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white mt-1">
          Law Career & Moot Court Hub
        </h1>
        <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-400 mt-1">
          Explore curated judicial clerkships, tier-1 law firm internships, moot court competitions, and academic research positions across Karnataka and India.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-navy-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, law firm, organization, or location (e.g. High Court, Trilegal, Bengaluru)..."
            className="w-full pl-10 pr-4 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setType('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              type === ''
                ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400'
                : 'text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800'
            }`}
          >
            All Opportunities
          </button>
          {Object.entries(typeLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setType(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                type === key
                  ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400'
                  : 'text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : opportunities.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No career opportunities found"
          description="Check back soon as new verified internships and moot notifications are published."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-100 dark:bg-gold-950/60 text-gold-700 dark:text-gold-400 border border-gold-300 dark:border-gold-800">
                    {typeLabels[opp.opportunityType] || opp.opportunityType}
                  </span>
                  {opp.isFeatured && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition line-clamp-2">
                    {opp.title}
                  </h3>
                  <p className="text-xs font-semibold text-navy-600 dark:text-navy-300 mt-1">
                    {opp.organization}
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px] text-navy-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                    <span className="truncate">{opp.location}</span>
                  </div>
                  {opp.stipend && (
                    <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      <span>{opp.stipend}</span>
                    </div>
                  )}
                  {opp.deadline && (
                    <div className="flex items-center gap-1.5 text-navy-500">
                      <Calendar className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                      <span>Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-navy-600 dark:text-navy-400 line-clamp-3 leading-relaxed">
                  {opp.description}
                </p>

                {opp.eligibility && (
                  <div className="p-2.5 bg-navy-50 dark:bg-navy-800/40 rounded-xl text-[11px] text-navy-600 dark:text-navy-400">
                    <span className="font-semibold text-navy-800 dark:text-navy-200 block">Eligibility:</span>
                    <span className="line-clamp-2">{opp.eligibility}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-navy-100 dark:border-navy-800 flex items-center justify-end">
                {opp.applyUrl ? (
                  <a
                    href={opp.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white text-xs font-bold rounded-lg transition"
                  >
                    <span>Apply / Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : opp.contactEmail ? (
                  <a
                    href={`mailto:${opp.contactEmail}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 text-gold-400 dark:bg-gold-600 dark:text-white text-xs font-bold rounded-lg transition"
                  >
                    <span>Contact via Email</span>
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
