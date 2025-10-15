// src/pages/profile/[section].tsx
// version: 1.0.0
// NEW: Dynamic page to render different sections of the user profile.

import React from 'react';
import { useRouter } from 'next/router';
import ProfileLayout from '@/components/profile/ProfileLayout';
import MyBookingsList from '@/components/profile/MyBookingsList';
import WalletDashboard from '@/components/profile/WalletDashboard';
// Placeholder for AccountSettings
const AccountSettings = () => <div>تنظیمات حساب کاربری (در دست ساخت)</div>;

const ProfileSectionPage: React.FC = () => {
  const router = useRouter();
  const { section } = router.query;

  const renderSection = () => {
    switch (section) {
      case 'bookings':
        return <MyBookingsList />;
      case 'wallet':
        return <WalletDashboard />;
      case 'settings':
        return <AccountSettings />;
      default:
        // Optional: show a 404 or a default component if the section is invalid
        return <div>بخش مورد نظر یافت نشد.</div>;
    }
  };

  return (
    <ProfileLayout>
      {renderSection()}
    </ProfileLayout>
  );
};

export default ProfileSectionPage;
