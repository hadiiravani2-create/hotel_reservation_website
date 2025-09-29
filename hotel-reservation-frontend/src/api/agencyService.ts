// src/api/agencyService.ts v1.0.1
import api from './coreService'; // نمونه Axios پیکربندی شده

// Interfaces defined for use in other files

export interface AgencyReportResponse {
  agency: {
      name: string;
      credit_limit: number;
      current_balance: number;
  };
  transactions: Array<{
      id: number;
      transaction_type: string;
      amount: number;
      transaction_date: string;
      booking: { booking_code: string } | null;
  }>;
}

export interface AgencySubUser {
    id: number;
    username: string;
    agency_role: {
        name: string;
    } | null;
}

// New Interface for Agency Roles (Fixes 'any' at line 37:53)
export interface AgencyRole {
    id: number;
    name: string;
}


// G4.5: Fetch Agency Financial Report
export const getAgencyReport = async (): Promise<AgencyReportResponse> => { 
  // Endpoint: /agencies/api/my-report/
  const response = await api.get('/agencies/api/my-report/');
  return response.data;
};

// G4.6: Fetch Agency User Roles (برای فرم ایجاد کاربر جدید)
export const getAgencyUserRoles = async (): Promise<AgencyRole[]> => { // Fixed: Used AgencyRole[]
    // Endpoint: /agencies/api/roles/
    const response = await api.get('/agencies/api/roles/'); 
    return response.data;
};

// G4.6: Fetch Agency Sub-users
export const getAgencySubUsers = async (): Promise<AgencySubUser[]> => { 
    // Endpoint: /agencies/api/users/
    const response = await api.get('/agencies/api/users/'); 
    return response.data;
};
