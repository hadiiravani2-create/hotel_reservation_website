// src/api/coreService.ts
// version: 1.1.2
// FEATURE: Added getUserWallet function to fetch user's wallet data.

import axios from 'axios';
import { SuggestedHotel, Wallet } from '@/types/hotel'; // Import Wallet type

// The base URL is read from environment variables to support both SSR and CSR.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token to requests if available.
api.interceptors.request.use(config => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
    }
    return config;
});


// --- START: Re-added Interfaces and Functions for Header/Footer ---

// Interface for site settings response
export interface SiteSettings {
  site_name: string;
  logo_url: string; // Assuming the API provides a URL for the logo
  // Add other settings as needed
}

// Interface for menu item structure
export interface MenuItem {
  id: number;
  title: string;
  url: string;
  target: string; // e.g., '_blank'
}

// Endpoint: /api/settings/
export const getSiteSettings = async (): Promise<SiteSettings> => {
  const response = await api.get('/api/settings/');
  return response.data;
};

// Endpoint: /api/menu/<slug:menu_slug>/
export const getMenu = async (menuSlug: string): Promise<MenuItem[]> => {
  const response = await api.get(`/api/menu/${menuSlug}/`);
  return response.data;
};

// --- END: Re-added Interfaces and Functions ---

/**
 * Fetches a list of suggested hotels for the homepage.
 * @returns {Promise<SuggestedHotel[]>} A promise that resolves to an array of suggested hotels.
 */
export const getSuggestedHotels = async (): Promise<SuggestedHotel[]> => {
    try {
        const response = await api.get('/api/hotels/suggested/');
        return response.data;
    } catch (error) {
        console.error("Error fetching suggested hotels:", error);
        throw error;
    }
};

/**
 * Fetches the authenticated user's wallet details, including balance and recent transactions.
 * Requires authentication.
 * @returns {Promise<Wallet>} A promise that resolves to the user's wallet data.
 */
export const getUserWallet = async (): Promise<Wallet> => {
    try {
        const response = await api.get('/api/wallet/');
        return response.data;
    } catch (error) {
        console.error("Error fetching user wallet:", error);
        throw error;
    }
};


export default api;
