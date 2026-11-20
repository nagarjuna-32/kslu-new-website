import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { StudentLayout } from '../layouts/StudentLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Route Guards
import { ProtectedRoute, AdminRoute } from './ProtectedRoute';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { AboutPage } from '../pages/public/AboutPage';
import { ContactPage } from '../pages/public/ContactPage';
import { CourseExplorerPage } from '../pages/public/CourseExplorerPage';

// Module Pages
import { PYQLibraryPage } from '../pages/pyq/PYQLibraryPage';
import { NotesLibraryPage } from '../pages/notes/NotesLibraryPage';
import { UploadNotePage } from '../pages/notes/UploadNotePage';
import { AIAssistantPage } from '../pages/ai/AIAssistantPage';
import { CommunityPage } from '../pages/community/CommunityPage';
import { CareerHubPage } from '../pages/career/CareerHubPage';
import { AnnouncementsPage } from '../pages/announcements/AnnouncementsPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

// Student Dashboard Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { MyBookmarksPage } from '../pages/student/MyBookmarksPage';
import { MyContributionsPage } from '../pages/student/MyContributionsPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';

// Admin Portal Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { NotesModerationPage } from '../pages/admin/NotesModerationPage';
import { AcademicManagementPage } from '../pages/admin/AcademicManagementPage';
import { PYQManagementPage } from '../pages/admin/PYQManagementPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { ReportsManagementPage } from '../pages/admin/ReportsManagementPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Layout Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/courses" element={<CourseExplorerPage />} />
        <Route path="/pyqs" element={<PYQLibraryPage />} />
        <Route path="/notes" element={<NotesLibraryPage />} />
        <Route
          path="/notes/upload"
          element={
            <ProtectedRoute>
              <UploadNotePage />
            </ProtectedRoute>
          }
        />
        <Route path="/ai-tutor" element={<AIAssistantPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/career" element={<CareerHubPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* 2. Protected Student Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="bookmarks" element={<MyBookmarksPage />} />
        <Route path="contributions" element={<MyContributionsPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      {/* 3. Protected Admin Portal Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="moderation" element={<NotesModerationPage />} />
        <Route path="academic" element={<AcademicManagementPage />} />
        <Route path="pyqs" element={<PYQManagementPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="career" element={<CareerHubPage />} />
        <Route path="reports" element={<ReportsManagementPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Wildcard 404 Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
