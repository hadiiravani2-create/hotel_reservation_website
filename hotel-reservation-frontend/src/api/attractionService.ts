// src/api/attractionService.ts
// version: 1.0.1
// FIX: Added '/api' prefix to endpoint paths.

import api from './coreService';
import { Attraction, AttractionCategory } from '@/types/attraction';

export const getAttractions = async (params: Record<string, any> = {}): Promise<Attraction[]> => {
  // FIX: was '/attractions/list/' -> now '/api/attractions/list/'
  const response = await api.get('/api/attractions/list/', { params });
  return response.data;
};

export const getAttractionCategories = async (): Promise<AttractionCategory[]> => {
  // FIX: was '/attractions/categories/' -> now '/api/attractions/categories/'
  const response = await api.get('/api/attractions/categories/');
  return response.data;
};

export const getCityAttractions = async (citySlug: string): Promise<Attraction[]> => {
  return getAttractions({ city__slug: citySlug });
};
