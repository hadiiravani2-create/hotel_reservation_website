// src/types/hotel.d.ts
// version: 1.5.1
// FIX: Added 'is_online' to HotelDetails interface.

/**
 * Represents a simplified hotel object for summary displays (Homepage & Search Results).
 */
export interface HotelSummary {
  id: number;
  name: string;
  slug: string;
  stars: number;
  city_name?: string; 
  address?: string;   
  main_image?: string | null; 
  min_price?: number; 
}

export type SuggestedHotel = HotelSummary;

export interface OfflineBank {
    id: number;
    bank_name: string;
    account_holder: string;
    account_number: string;
    card_number: string;
    shaba_number: string;
}

export interface WalletTransaction {
  id: number;
  transaction_type: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

export interface Wallet {
  balance: number;
  recent_transactions: WalletTransaction[];
}

export interface CancellationRule {
  id: number;
  days_before_checkin_min: number;
  days_before_checkin_max: number;
  penalty_type: string; 
  penalty_value: number;
}

export interface CancellationPolicy {
  id: number;
  name: string;
  description: string | null;
  rules: CancellationRule[];
}

export interface ServiceType {
  id: number;
  name: string;
  requires_details: boolean;
}

export interface HotelService {
  id: number;
  hotel: number;
  name: string;
  description: string;
  pricing_model: 'PERSON' | 'BOOKING' | 'FREE';
  price: number;
  service_type: ServiceType;
  is_taxable: boolean;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string | null;
}

export interface RoomImage {
  id: number;
  image: string;
  caption: string | null;
}

export interface HotelImage {
    image: string;
    caption: string | null;
    order: number;
}

export interface CityAttraction {
    id: number;
    name: string;
    slug: string;
    description: string;
    latitude: number;
    longitude: number;
    images: {
        image: string;
        caption: string | null;
        order: number;
        is_cover: boolean;
    }[];
}

export interface City {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    latitude?: number | null;
    longitude?: number | null;
    attractions?: CityAttraction[];
}

export interface HotelCategory {
    id: number;
    name: string;
    slug: string;
}

export interface BoardType {
  id: number;
  name: string;
  code: string;
}

export interface PricedBoardType {
  board_type: BoardType;
  total_price: number;
  total_extra_adult_price?: number;
  total_child_price?: number;
}

export interface BedType {
    id: number;
    name: string;
    slug: string;
}

export interface RoomType {
  id: number;
  hotel?: number; // علامت سوال برای سازگاری در صورتی که در برخی ریسپانس‌ها نباشد
  name: string;
  code?: string;
  description?: string | null;
  base_capacity: number;
  extra_capacity: number;
  child_capacity: number;
  price_per_night?: number;
  extra_person_price?: number;
  child_price?: number;
  priority?: number;
}

export interface AvailableRoom {
  id: number;
  name: string;
  priority: number;
  description: string | null;
  base_capacity: number;
  extra_capacity: number;
  child_capacity: number;
  
  extra_adult_price?: number;
  child_price?: number;

  bed_type: string | null;
  bed_types?: BedType[];

  images: RoomImage[];
  amenities: Amenity[];
  priced_board_types: PricedBoardType[];
  availability_quantity: number;
  is_available: boolean;
  error_message: string | null;
}

/**
 * Detailed Hotel Interface matching the Backend 'HotelSerializer'.
 */
export interface HotelDetails {
    id: number;
    name: string;
    slug: string;
    stars: number;
    description: string;
    address: string;
    city: City;
    amenities: Amenity[];
    images: HotelImage[];
    hotel_categories: HotelCategory[];
    meta_title: string | null;
    meta_description: string | null;
    latitude: number | null;
    longitude: number | null;
    check_in_time: string | null;
    check_out_time: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    rules: string | null;
    
    // FIX: Added missing field
    is_online: boolean; 

    available_rooms?: AvailableRoom[]; 
    cancellation_policy_normal?: CancellationPolicy;
    cancellation_policy_peak?: CancellationPolicy;
}

export interface CartItem {
  id: string;
  room: {
    id: number;
    name: string;
    image: RoomImage | null;
    base_capacity: number;
    extra_capacity: number;
    child_capacity: number;
    hotel_id?: number;
    extra_adult_price?: number;
    child_price?: number;
  };
  selected_board: {
    id: number;
    name: string;
  };
  quantity: number;
  price_per_room: number;
  total_price: number;
  extra_adults: number;
  children_count: number;
}

export interface SiteSettings {
    site_name: string;
    logo: string | null;
    logo_dark: string | null;
    favicon: string | null;
}

export interface GuestInfo {
    first_name: string;
    last_name: string;
    national_code: string;
    phone_number: string;
    email: string;
    wants_to_register?: boolean;
}

export interface BookingRequestPayload {
    user_id?: number;
    guest_info?: GuestInfo;
    cart_items: CartItem[];
    check_in_date: string;
    duration: number;
    total_amount: number;
    all_guests: GuestInfo[];
}

export interface SelectedServicePayload {
  id: number;
  quantity: number;
  details?: Record<string, any>;
}

export interface BookedServiceDetail {
  id: number;
  hotel_service: HotelService;
  quantity: number;
  total_price: number;
  details?: Record<string, any>;
}

export interface BookingResponse {
  booking_code: string;
  payment_type: 'offline' | 'online';
}
