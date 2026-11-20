import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <HelmetProvider>
      <Helmet>
        <title>KSLU Circle – Your Academic World, All in One Circle</title>
        <meta
          name="description"
          content="Academic resource and peer-learning platform for law students affiliated with Karnataka State Law University."
        />
        <meta name="theme-color" content="#0F172A" />
      </Helmet>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
