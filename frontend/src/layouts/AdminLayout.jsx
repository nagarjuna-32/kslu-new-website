import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Shield,
  BookOpen,
  CheckSquare,
  GraduationCap,
  FileText,
  Users,
  Bell,
  Briefcase,
  AlertOctagon,
  ScrollText,
  ArrowLeft,
  LayoutDashboard,
  Cloud
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../contexts/AuthContext';

export const AdminLayout = () => {
  const { user, isSuperAdmin } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { name: 'Dashboard Analytics', path: '/admin', icon: LayoutDashboard },
    { name: 'Notes & Resources Manager', path: '/admin/moderation', icon: BookOpen },
    { name: 'Academic Curriculum', path: '/admin/academic', icon: GraduationCap },
    { name: 'PYQ Management', path: '/admin/pyqs', icon: FileText },
    { name: 'Google Drive PYQ Sync', path: '/admin/drive-sync', icon: Cloud },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'University Updates', path: '/admin/announcements', icon: Bell },
    { name: 'Career & Moots Hub', path: '/admin/career', icon: Briefcase },
    { name: 'Content Reports', path: '/admin/reports', icon: AlertOctagon },
    { name: 'System Audit Logs', path: '/admin/audit-logs', icon: ScrollText }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-navy-50 dark:bg-navy-950 text-navy-900 dark:text-navy-100">
      <Navbar />

      {/* Admin Top Header Bar */}
      <div className="bg-navy-900 text-white border-b border-navy-800 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo_icon.png" alt="KSLU Circle" className="w-6 h-6 object-contain rounded-md" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              KSLU Circle Administration Portal
            </span>
            <span className="text-[10px] bg-gold-500/20 text-gold-400 border border-gold-500/30 px-2 py-0.5 rounded-full font-mono">
              {user?.role}
            </span>
          </div>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-navy-300 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Student Portal</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Admin Sidebar Navigation */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-navy-200 dark:border-navy-800 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-500 mb-3 px-2">
                Administration Menu
              </h3>
              <nav className="space-y-1">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-navy-900 text-gold-400 dark:bg-navy-800 dark:text-gold-400 font-semibold shadow-sm'
                          : 'text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Admin Workspace Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
      <Toast />
    </div>
  );
};
