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
import { ResourcesOverviewPage } from '../pages/public/ResourcesOverviewPage';
import { DisclaimerPage } from '../pages/public/DisclaimerPage';

// Module Pages
import { PYQLibraryPage } from '../pages/pyq/PYQLibraryPage';
import { PYQDetailPage } from '../pages/pyq/PYQDetailPage';
import { NotesLibraryPage } from '../pages/notes/NotesLibraryPage';
import { NoteDetailPage } from '../pages/notes/NoteDetailPage';
import { UploadNotePage } from '../pages/notes/UploadNotePage';
import { AIAssistantPage } from '../pages/ai/AIAssistantPage';
import { CommunityPage } from '../pages/community/CommunityPage';
import { DiscussionDetailPage } from '../pages/community/DiscussionDetailPage';
import { CareerHubPage } from '../pages/career/CareerHubPage';
import { AnnouncementsPage } from '../pages/announcements/AnnouncementsPage';
import { AnnouncementDetailPage } from '../pages/announcements/AnnouncementDetailPage';

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
import { AdminAnnouncementsPage } from '../pages/admin/AdminAnnouncementsPage';
import { AdminCareerPage } from '../pages/admin/AdminCareerPage';
import { ReportsManagementPage } from '../pages/admin/ReportsManagementPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { DriveSyncPage } from '../pages/admin/DriveSyncPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Layout Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/resources" element={<ResourcesOverviewPage />} />
        <Route path="/courses" element={<CourseExplorerPage />} />

        {/* PYQs */}
        <Route path="/pyqs" element={<PYQLibraryPage />} />
        <Route path="/pyqs/:id" element={<PYQDetailPage />} />

        {/* Study Notes */}
        <Route path="/notes" element={<NotesLibraryPage />} />
        <Route path="/notes/:id" element={<NoteDetailPage />} />
        <Route
          path="/notes/upload"
          element={
            <ProtectedRoute>
              <UploadNotePage />
            </ProtectedRoute>
          }
        />

        {/* AI Study Assistant */}
        <Route path="/ai-tutor" element={<AIAssistantPage />} />

        {/* Community Forum */}
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/:id" element={<DiscussionDetailPage />} />

        {/* Career & Moot Hub */}
        <Route path="/career" element={<CareerHubPage />} />

        {/* Announcements */}
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/announcements/:slug" element={<AnnouncementDetailPage />} />

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
        <Route path="drive-sync" element={<DriveSyncPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="announcements" element={<AdminAnnouncementsPage />} />
        <Route path="career" element={<AdminCareerPage />} />
        <Route path="reports" element={<ReportsManagementPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Wildcard 404 Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
