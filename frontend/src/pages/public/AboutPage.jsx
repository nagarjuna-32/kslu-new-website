import React from 'react';
import { Link } from 'react-router-dom';
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

      {/* Strict Official Disclaimer Card */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-3xl p-6 sm:p-8 text-xs sm:text-sm text-amber-950 dark:text-amber-200 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-amber-200/80 dark:border-amber-800/80">
          <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="font-serif text-base font-bold">Official Disclaimer</span>
          </div>
          <Link
            to="/disclaimer"
            className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline"
          >
            Read Complete Policy &rarr;
          </Link>
        </div>
        <p className="leading-relaxed">
          KSLU Circle is an independent, student-developed academic resource and peer-learning platform created and maintained by students for the benefit of students affiliated with Karnataka State Law University (KSLU).
        </p>
        <p className="leading-relaxed font-semibold">
          This platform is not an official website, portal, or application of Karnataka State Law University (KSLU). It is not affiliated with, associated with, authorized, endorsed, or operated by KSLU or any of its official departments.
        </p>
        <p className="leading-relaxed text-xs text-amber-900/80 dark:text-amber-300/80">
          All study materials, previous year question papers, notes, and other academic resources are provided for educational and reference purposes only. Students are advised to verify official circulars, exam dates, and syllabi through the official university website:{' '}
          <a
            href="https://kslu.karnataka.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold text-amber-950 dark:text-amber-100"
          >
            https://kslu.karnataka.gov.in
          </a>
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
