// src/pages/profile/index.tsx
// version: 1.0.0
// NEW: Entry point for the profile section, redirects to the default view.

import { useEffect } from 'react';
import { useRouter } from 'next/router';

const ProfileIndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the default 'bookings' section of the profile.
    router.replace('/profile/bookings');
  }, [router]);

  return null; // Render nothing while redirecting
};

export default ProfileIndexPage;
