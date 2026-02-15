// FILE: src/pages/admin/bookings/index.tsx

import React from 'react';
// تغییر مهم: اضافه کردن آکولاد { } دور AdminLayout
import { AdminLayout } from '@/components/admin/layout/AdminLayout'; 
import { BookingManager } from '@/components/admin/bookings/BookingManager';

const BookingsPage = () => {
  return (
    <AdminLayout>
      <BookingManager />
    </AdminLayout>
  );
};

export default BookingsPage;
