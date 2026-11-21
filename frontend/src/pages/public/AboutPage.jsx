import React from 'react';
import { Scale, ShieldAlert, BookOpen, Users, Award, HeartHandshake } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 bg-white dark:bg-navy-800/90 rounded-3xl shadow-sm border border-navy-100 dark:border-navy-700/80 mx-auto mb-2">
          <img src="/logo_horizontal.png" alt="KSLU Circle Official Logo" className="h-16 w-auto object-contain mx-auto" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Academic Identity & Mission
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mt-1">
            About KSLU Circle
          </h1>
          <p className="text-sm sm:text-base text-navy-600 dark:text-navy-300 max-w-2xl mx-auto mt-2">
            Your Academic World, All in One Circle. A student-led peer-learning initiative created for law students across Karnataka.
          </p>
        </div>
      </div>

      {/* Strict Disclaimer Card */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-xs text-amber-900 dark:text-amber-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-5 h-5" />
          <span>Independent Platform Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          KSLU Circle is an independent student peer-learning platform. It is <strong>not affiliated with, endorsed by, sponsored by, or operated by Karnataka State Law University (KSLU)</strong> or any governmental department. All question papers, study materials, and discussion entries are shared by student contributors for pedagogical and non-commercial educational purposes.
        </p>
      </div>

      {/* Mission & Purpose */}
      <div className="space-y-6 text-sm text-navy-700 dark:text-navy-300 leading-relaxed">
        <h2 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
          Core Purpose
        </h2>
        <p>
          Law education in Karnataka connects dozens of affiliated colleges spanning Bangalore, Hubballi, Dharwad, Mangalore, Mysuru, Belagavi, Kalaburagi, and beyond. Despite a shared curriculum, law students often face fragmented access to authentic past examination question papers, structured syllabus breakdowns, and reliable revision notes.
        </p>
        <p>
          <strong>KSLU Circle</strong> brings all these academic threads together in a transparent, accessible, and community-driven ecosystem.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 space-y-2">
          <Scale className="w-6 h-6 text-gold-600 dark:text-gold-400" />
          <h3 className="font-semibold text-navy-900 dark:text-white text-base">Authentic Curriculum</h3>
          <p className="text-xs text-navy-600 dark:text-navy-400">
            Syllabus structures for 3-Year LL.B and 5-Year Integrated B.A., B.B.A., B.Com., and B.Sc. LL.B programs with Scheme 80 & 100 Marks.
          </p>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 space-y-2">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-navy-900 dark:text-white text-base">Peer Moderation</h3>
          <p className="text-xs text-navy-600 dark:text-navy-400">
            Every contributed study note is reviewed by academic moderators before public indexing to maintain pedagogical quality.
          </p>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 space-y-2">
          <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-navy-900 dark:text-white text-base">Moot & Career Growth</h3>
          <p className="text-xs text-navy-600 dark:text-navy-400">
            Connecting aspiring advocates with high court clerkships, national moot court competitions, and research fellowships.
          </p>
        </div>
      </div>
    </div>
  );
};
