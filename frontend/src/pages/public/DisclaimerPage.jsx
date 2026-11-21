import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldAlert, ExternalLink } from 'lucide-react';

export const DisclaimerPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Helmet>
        <title>Disclaimer | KSLU Circle</title>
        <meta
          name="description"
          content="Independent student-developed academic resource and peer-learning platform disclaimer for Karnataka State Law University (KSLU) students."
        />
      </Helmet>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Independent Platform Notice</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white">
          Disclaimer
        </h1>
        <p className="text-sm text-navy-600 dark:text-navy-400 max-w-2xl mx-auto">
          Please read this academic notice regarding the independent status and educational scope of KSLU Circle.
        </p>
      </div>

      {/* Main Disclaimer Document Card */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-10 border border-navy-200 dark:border-navy-800 shadow-md space-y-6 text-sm text-navy-800 dark:text-navy-200 leading-relaxed">
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 font-medium">
          <p>
            KSLU Circle is an independent, student-developed academic resource and peer-learning platform created and maintained by students for the benefit of students affiliated with Karnataka State Law University (KSLU).
          </p>
        </div>

        <div className="space-y-4">
          <p>
            This platform is <strong className="text-navy-900 dark:text-white font-semibold">not an official website, portal, or application of Karnataka State Law University (KSLU)</strong>. It is not affiliated with, associated with, authorized, endorsed, or operated by KSLU or any of its official departments.
          </p>

          <p>
            All study materials, previous year question papers, notes, and other academic resources are provided for educational and reference purposes only. While efforts are made to maintain accuracy and reliability, KSLU Circle does not guarantee that all information is complete, current, or officially verified.
          </p>

          <p>
            Students are advised to verify examination notifications, timetables, results, syllabus updates, regulations, circulars, and other official information through the official KSLU website and authorized university sources.
          </p>

          <p>
            KSLU Circle is an independent initiative intended to encourage collaborative learning, knowledge sharing, and academic support among students.
          </p>
        </div>

        {/* Official Portal Reference */}
        <div className="pt-6 border-t border-navy-100 dark:border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-50 dark:bg-navy-800/50 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-8 rounded-b-3xl">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-navy-500">
              Official University Website
            </span>
            <a
              href="https://kslu.karnataka.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold text-gold-600 dark:text-gold-400 hover:underline inline-flex items-center gap-1.5 mt-0.5"
            >
              <span>https://kslu.karnataka.gov.in</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="text-xs text-navy-500 font-medium sm:text-right">
            <span>© KSLU Circle. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
