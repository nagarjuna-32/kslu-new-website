import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  MessageSquare,
  Bot,
  Briefcase,
  Bell,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Bookmark,
  ChevronDown,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: t('nav.pyqs'), path: '/pyqs', icon: FileText },
    { name: t('nav.notes'), path: '/notes', icon: BookOpen },
    { name: t('nav.courses'), path: '/courses', icon: GraduationCap },
    { name: t('nav.community'), path: '/community', icon: MessageSquare },
    { name: t('nav.aiTutor'), path: '/ai-tutor', icon: Bot, highlight: true },
    { name: t('nav.career'), path: '/career', icon: Briefcase },
    { name: t('nav.announcements'), path: '/announcements', icon: Bell }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-navy-900/95 glass-header border-b border-navy-200/80 dark:border-navy-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-navy-900 dark:bg-navy-800 border border-gold-500/40 flex items-center justify-center p-1.5 shadow-md group-hover:scale-105 transition-transform">
              <img src="/logo-icon.svg" alt="KSLU Circle" className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-lg text-navy-900 dark:text-white tracking-tight">
                  KSLU Circle
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold-100 dark:bg-gold-950/60 text-gold-700 dark:text-gold-400 border border-gold-300 dark:border-gold-800">
                  Academic
                </span>
              </div>
              <p className="text-[11px] text-navy-500 dark:text-navy-400 hidden sm:block">
                {t('brand.tagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-navy-100 text-navy-900 dark:bg-navy-800 dark:text-white font-semibold'
                      : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50 dark:text-navy-300 dark:hover:text-white dark:hover:bg-navy-800/60'
                  } ${link.highlight ? 'text-gold-600 dark:text-gold-400' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-800 transition"
              title={language === 'en' ? 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-navy-500 dark:text-navy-400" />
              <span>{language === 'en' ? 'KN' : 'EN'}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-navy-600 hover:text-navy-900 dark:text-navy-300 dark:hover:text-white rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition"
              aria-label="Toggle color theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Dropdown (When Logged In) */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 text-navy-600 hover:text-navy-900 dark:text-navy-300 dark:hover:text-white rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-900 rounded-xl shadow-2xl border border-navy-200 dark:border-navy-700 py-2 z-50">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-navy-100 dark:border-navy-800">
                      <span className="text-xs font-semibold text-navy-900 dark:text-white">
                        Notifications ({unreadCount} new)
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-gold-600 dark:text-gold-400 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-navy-100 dark:divide-navy-800">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-xs text-center text-navy-500 dark:text-navy-400">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.linkUrl) navigate(n.linkUrl);
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-3 text-xs cursor-pointer hover:bg-navy-50 dark:hover:bg-navy-800/60 transition ${
                              !n.isRead ? 'bg-gold-50/50 dark:bg-gold-950/20' : ''
                            }`}
                          >
                            <p className="font-semibold text-navy-900 dark:text-white">{n.title}</p>
                            <p className="text-navy-600 dark:text-navy-300 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-navy-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown or Login Buttons */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-navy-100 dark:hover:bg-navy-800 transition border border-navy-200 dark:border-navy-700"
                >
                  <div className="w-7 h-7 rounded-lg bg-navy-900 text-gold-400 flex items-center justify-center font-bold text-xs">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-medium text-navy-800 dark:text-navy-200 hidden md:block max-w-[100px] truncate">
                    {user.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-navy-500" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-900 rounded-xl shadow-2xl border border-navy-200 dark:border-navy-700 py-1.5 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-navy-100 dark:border-navy-800">
                      <p className="font-semibold text-navy-900 dark:text-white truncate">{user.fullName}</p>
                      <p className="text-navy-500 text-[11px] truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-mono bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-navy-50 dark:hover:bg-navy-800 text-navy-700 dark:text-navy-200"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Student Dashboard</span>
                    </Link>

                    <Link
                      to="/dashboard/bookmarks"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-navy-50 dark:hover:bg-navy-800 text-navy-700 dark:text-navy-200"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>My Bookmarks</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-gold-600 dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-gold-950/40 font-semibold"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="border-t border-navy-100 dark:border-navy-800 my-1"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-navy-700 dark:text-navy-200 hover:text-navy-900 dark:hover:text-white transition"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:text-white dark:hover:bg-gold-500 rounded-lg shadow-sm transition"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-lg transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-navy-200 dark:border-navy-800 bg-white dark:bg-navy-900 px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-navy-100 text-navy-900 dark:bg-navy-800 dark:text-white font-semibold'
                    : 'text-navy-600 hover:bg-navy-50 dark:text-navy-300 dark:hover:bg-navy-800/60'
                }`}
              >
                <Icon className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
