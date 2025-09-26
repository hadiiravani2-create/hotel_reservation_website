// src/api/agencyService.ts
import api from './coreService'; // نمونه Axios پیکربندی شده

// G4.5: Fetch Agency Financial Report
export const getAgencyReport = async (): Promise<any> => {
  // Endpoint: /agencies/api/my-report/
  const response = await api.get('/agencies/api/my-report/'); //
  return response.data;
};

// G4.6: Fetch Agency User Roles (برای فرم ایجاد کاربر جدید)
export const getAgencyUserRoles = async (): Promise<any[]> => {
    // Endpoint: /agencies/api/roles/
    const response = await api.get('/agencies/api/roles/'); //
    return response.data;
};

// G4.6: Fetch Agency Sub-users
export const getAgencySubUsers = async () => {
    // Endpoint: /agencies/api/users/
    const response = await api.get('/agencies/api/users/'); //
    return response.data;
};