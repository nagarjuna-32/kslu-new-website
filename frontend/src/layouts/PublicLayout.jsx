import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Toast } from '../components/common/Toast';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-navy-50 dark:bg-navy-950 text-navy-900 dark:text-navy-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
};
