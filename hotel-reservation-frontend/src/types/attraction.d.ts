// src/types/attraction.d.ts
// version: 1.0.0

export interface AttractionCategory {
  id: number;
  name: string;
  slug: string;
  icon_name: string;
}

export interface AttractionAudience {
  id: number;
  name: string;
}

export interface AttractionAmenity {
  id: number;
  name: string;
  icon_name?: string;
}

export interface AttractionImage {
  image: string;
  caption: string | null;
  order: number;
  is_cover: boolean;
}

export interface VisitInfo {
  hours: string | null;
  best_time: string | null;
  fee: number;
}

export interface Attraction {
  id: number;
  name: string;
  slug: string;
  city_name: string;
  
  categories: AttractionCategory[];
  audiences: AttractionAudience[];
  amenities: AttractionAmenity[];
  
  description: string;
  short_description: string | null;
  
  latitude: number;
  longitude: number;
  
  visiting_hours: string | null;
  best_visit_time: string | null;
  entry_fee: number;
  
  rating: number;
  is_featured: boolean;
  
  images: AttractionImage[];
  visit_info: VisitInfo;
}
