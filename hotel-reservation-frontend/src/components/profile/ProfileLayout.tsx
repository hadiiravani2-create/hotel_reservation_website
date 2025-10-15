// src/components/profile/ProfileLayout.tsx
// version: 1.0.0
// NEW: Main layout component for the two-column user profile section.

import React from 'react';
import ProfileSidebar from './ProfileSidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <Header />
      <main className="flex-grow container mx-auto max-w-7xl p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <ProfileSidebar />
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileLayout;
