// src/api/coreService.ts v0.0.1
import axios from 'axios';

// Base URL configuration: API calls will be proxied via Nginx.
// Example: '/api/auth/login/' will hit the Nginx proxy and be routed to Django:8000
const API_BASE_URL = ''; 

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interface for site settings response
export interface SiteSettings {
  site_name: string;
  logo_url: string;
  // Add other settings as needed
}

// Interface for menu item structure
export interface MenuItem {
  id: number;
  title: string;
  url: string;
  target: string;
}

// Endpoint: /api/settings/
export const getSiteSettings = async (): Promise<SiteSettings> => {
  const response = await api.get('/api/settings/');
  return response.data;
};

// Endpoint: /api/menu/<slug:menu_slug>/
// The backend returns a list of items for a specific menu slug
export const getMenu = async (menuSlug: string): Promise<MenuItem[]> => {
  // Assuming the core API handles this: /api/menu/main-menu/
  const response = await api.get(`/api/menu/${menuSlug}/`);
  return response.data;
};

export default api;
