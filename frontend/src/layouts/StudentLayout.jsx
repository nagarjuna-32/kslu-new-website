import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bookmark,
  Upload,
  User,
  BookOpen,
  ArrowLeft,
  Bell
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../contexts/AuthContext';

export const StudentLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const links = [
    { name: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Bookmarked PYQs & Notes', path: '/dashboard/bookmarks', icon: Bookmark },
    { name: 'My Study Contributions', path: '/dashboard/contributions', icon: Upload },
    { name: 'Profile & College Settings', path: '/dashboard/profile', icon: User }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-navy-50 dark:bg-navy-950 text-navy-900 dark:text-navy-100">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Student Card */}
            <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-navy-900 dark:bg-navy-800 text-gold-400 font-bold text-lg flex items-center justify-center border border-gold-500/30">
                  {user?.fullName ? user.fullName[0].toUpperCase() : 'S'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-navy-900 dark:text-white truncate">
                    {user?.fullName}
                  </h3>
                  <p className="text-xs text-navy-500 truncate">{user?.email}</p>
                </div>
              </div>

              {user?.collegeName && (
                <div className="text-xs text-navy-600 dark:text-navy-400 bg-navy-50 dark:bg-navy-800/60 p-2.5 rounded-lg mb-4">
                  <span className="block font-medium text-navy-800 dark:text-navy-200">Affiliated College:</span>
                  <span className="truncate block mt-0.5">{user.collegeName}</span>
                </div>
              )}

              <nav className="space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                          : 'text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 mt-4 border-t border-navy-100 dark:border-navy-800">
                <Link
                  to="/notes/upload"
                  className="flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-gold-600 hover:bg-gold-500 text-white text-xs font-medium rounded-xl shadow-sm transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Study Material</span>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 text-xs space-y-2">
              <span className="font-semibold text-navy-800 dark:text-navy-200 uppercase tracking-wider text-[10px]">
                Quick Navigation
              </span>
              <div className="space-y-1 pt-1">
                <Link to="/pyqs" className="flex items-center gap-2 text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white py-1">
                  <BookOpen className="w-3.5 h-3.5 text-gold-500" />
                  <span>Browse Question Papers</span>
                </Link>
                <Link to="/community" className="flex items-center gap-2 text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white py-1">
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-gold-500" />
                  <span>Ask in Student Forum</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Student Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
      <Toast />
    </div>
  );
};
