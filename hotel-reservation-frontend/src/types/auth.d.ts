// src/types/auth.d.ts (یا هر جا که User را تعریف کردید)
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  // فیلد جدید برای تشخیص سطح دسترسی
  is_staff: boolean; 
  is_superuser: boolean;
  agency_id?: number | null;
}
