import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  BookOpen,
  FileText,
  ShieldAlert,
  ExternalLink,
  GraduationCap,
  Heart,
  Bot
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-navy-950 text-navy-300 border-t border-navy-800 text-xs">
      {/* Official Legal Disclaimer Banner */}
      <div className="bg-navy-900 border-b border-navy-800/80 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3">
          <ShieldAlert className="w-4 h-4 text-gold-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-[11px] leading-relaxed text-navy-300">
            <strong className="text-gold-400 font-semibold uppercase tracking-wider">Independent Academic Disclaimer: </strong>
            KSLU Circle is an independent student-led peer-learning and academic repository. It is{' '}
            <span className="text-white font-medium">not affiliated with, endorsed by, or operated by Karnataka State Law University (KSLU)</span>.
            All official university circulars, exam dates, and syllabi must be verified directly against the university's official portal.
          </p>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-900 border border-gold-500/40 flex items-center justify-center p-1.5 shadow-lg">
                <img src="/logo-icon.svg" alt="KSLU Circle" className="w-full h-full" />
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-white tracking-tight">
                  KSLU Circle
                </span>
                <p className="text-[11px] text-gold-400 font-medium">
                  {t('brand.tagline')}
                </p>
              </div>
            </Link>
            <p className="text-navy-400 leading-relaxed text-xs max-w-sm">
              Empowering Karnataka's law students through open peer exchange, structured examination papers, syllabus transparency, and ethical AI study assistance.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-900 border border-navy-800 text-[11px] text-navy-300">
                <Scale className="w-3.5 h-3.5 text-gold-400" />
                <span>3-Year & 5-Year Law Programs</span>
              </span>
            </div>
          </div>

          {/* Academic Programs */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              KSLU Law Courses
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="hover:text-gold-400 transition">
                  Three-Year LL.B (6 Sems)
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-gold-400 transition">
                  Five-Year B.A. LL.B (10 Sems)
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-gold-400 transition">
                  Five-Year B.B.A. LL.B
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-gold-400 transition">
                  Five-Year B.Com. LL.B
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-gold-400 transition">
                  Five-Year B.Sc. LL.B
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-gold-400 transition">
                  Curriculum & Schemes (80 / 100)
                </Link>
              </li>
            </ul>
          </div>

          {/* Learning Repository */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Study Repository
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/pyqs" className="hover:text-gold-400 transition">
                  Previous Year Papers (PYQs)
                </Link>
              </li>
              <li>
                <Link to="/notes" className="hover:text-gold-400 transition">
                  Verified Student Notes
                </Link>
              </li>
              <li>
                <Link to="/notes/upload" className="hover:text-gold-400 transition text-gold-400 font-medium">
                  + Contribute Study Notes
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-gold-400 transition">
                  Student Discussion Forums
                </Link>
              </li>
              <li>
                <Link to="/ai-tutor" className="hover:text-gold-400 transition flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-gold-400" />
                  <span>AI Study Assistant</span>
                </Link>
              </li>
              <li>
                <Link to="/career" className="hover:text-gold-400 transition">
                  Law Career & Moots Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Verification Links */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Official University Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://kslu.karnataka.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-400 transition flex items-center gap-1"
                >
                  <span>Official KSLU Portal</span>
                  <ExternalLink className="w-3 h-3 text-navy-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://kslu.karnataka.gov.in/notifications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-400 transition flex items-center gap-1"
                >
                  <span>Exam Circulars & Dates</span>
                  <ExternalLink className="w-3 h-3 text-navy-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://kslu.karnataka.gov.in/results"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-400 transition flex items-center gap-1"
                >
                  <span>KSLU Results Server</span>
                  <ExternalLink className="w-3 h-3 text-navy-500" />
                </a>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold-400 transition">
                  About KSLU Circle
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-400 transition">
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-navy-400">
          <p>© {new Date().getFullYear()} KSLU Circle. Developed for the student community of Karnataka State Law University.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-white transition">Platform Guidelines</Link>
            <span className="text-navy-700">•</span>
            <Link to="/contact" className="hover:text-white transition">Report an Issue</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
