// src/types/hotel.d.ts
// version: 1.0.6
// REFACTOR: Moved OfflineBank interface here to be globally accessible.

/**
 * Represents an offline bank account for payments.
 * Based on reservations.models.OfflineBank
 */
export interface OfflineBank {
    id: number;
    bank_name: string;
    account_holder: string;
    account_number: string;
    card_number: string;
    shaba_number: string;
}

/**
 * Represents a single wallet transaction record.
 * Based on core.serializers.WalletTransactionSerializer
 */
export interface WalletTransaction {
  id: number;
  transaction_type: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

/**
 * Represents the user's wallet data returned from the API.
 * Based on core.serializers.WalletSerializer
 */
export interface Wallet {
  balance: number;
  recent_transactions: WalletTransaction[];
}

/**
 * Represents a single cancellation rule.
 * Based on cancellations.serializers.CancellationRuleSerializer
 */
export interface CancellationRule {
  id: number;
  days_before_checkin_min: number;
  days_before_checkin_max: number;
  // 'PERCENT_TOTAL' | 'PERCENT_FIRST_NIGHT' | 'FIXED_NIGHTS'
  penalty_type: string; 
  penalty_value: number; // Decimal/string representation of the value
}

/**
 * Represents a full cancellation policy (template).
 * Based on cancellations.serializers.CancellationPolicySerializer
 */
export interface CancellationPolicy {
  id: number;
  name: string;
  description: string | null;
  rules: CancellationRule[];
}



/**
 * Represents a suggested hotel object returned by the API for the homepage.
 * Based on hotels.serializers.SuggestedHotelSerializer
 */
export interface SuggestedHotel {
  id: number;
  name: string;
  slug: string;
  stars: number;
  city_name: string;
  main_image: string | null;
}

export interface ServiceType {
  id: number;
  name: string;
  requires_details: boolean;
}

export interface HotelService {
  id: number;
  name: string;
  description: string;
  pricing_model: 'PERSON' | 'BOOKING' | 'FREE';
  price: number;
  service_type: ServiceType;
}


/**
 * Represents a single amenity for a hotel or room.
 * Based on hotels.models.Amenity
 */
export interface Amenity {
  id: number;
  name: string;
  icon: string | null;
}

/**
 * Represents an image associated with a room type.
 * Based on hotels.models.RoomImage
 */
export interface RoomImage {
  id: number;
  image: string; // URL to the image
  caption: string | null;
}

/**
 * Represents a meal/board plan.
 * Based on hotels.models.BoardType
 */
export interface BoardType {
  id: number;
  name: string;
  code: string;
}

/**
 * Represents a board type option with its calculated total price
 * for a specific stay duration, as returned by the pricing API.
 */
export interface PricedBoardType {
  board_type: BoardType;
  total_price: number;
}

/**
 * Represents a single available room type returned by the check-availability API.
 * This is the main data structure for our RoomCard component.
 */
export interface AvailableRoom {
  id: number; // Corresponds to RoomType ID
  name: string;
  description: string | null;
  base_capacity: number;
  extra_capacity: number;
  child_capacity: number;
  bed_type: string | null;
  images: RoomImage[];
  amenities: Amenity[];
  priced_board_types: PricedBoardType[];
  availability_quantity: number;
  is_available: boolean;
  error_message: string | null;
}


/**
 * Represents an item that the user has added to their booking cart.
 */

export interface CartItem {
  id: string; // A unique identifier for the cart item instance
  room: {
    id: number;
    name: string;
    image: RoomImage | null;
    base_capacity: number; // Added for price calculation
    extra_capacity: number;
    child_capacity: number;
    hotel_id?: number; // Added to easily get hotel id
  };
  selected_board: {
    id: number;
    name: string;
  };
  quantity: number;
  price_per_room: number;
  total_price: number;
}

/**
 * Represents the global settings for the website.
 * Based on core.models.SiteSettings
 */
export interface SiteSettings {
    site_name: string;
    logo: string | null;
    logo_dark: string | null;
    favicon: string | null;
}

/**
 * NEW: Represents the necessary information for a guest who is not logged in
 * to complete a booking. This is used when user does not want to register.
 */
export interface GuestInfo {
    first_name: string;
    last_name: string;
    national_code: string;
    phone_number: string;
    email: string;
    // Optional field to determine if the user wishes to register
    // using this information after booking.
    wants_to_register?: boolean;
}

/**
 * NEW: Represents the complete payload sent to the Backend's reservation API.
 * It encapsulates either the authenticated user ID or the guest information.
 */
export interface BookingRequestPayload {
    // Booking details (dates, hotel, etc.) - assumed to be part of the request context
    // This example focuses on the user/guest part of the reservation payload

    // Either user_id (for logged-in users) OR guest_info (for guests)
    user_id?: number;
    guest_info?: GuestInfo; // Required if user_id is null/undefined

    // Common fields
    cart_items: CartItem[]; // The list of rooms and services selected
    check_in_date: string; // ISO format (e.g., "1404-03-01")
    duration: number; // Number of nights

    // Other fields (e.g., number of adults/children, total price) can be added here
    total_amount: number;

    // List of all guests (first_name, last_name, etc.)
    all_guests: GuestInfo[];
}

// Interface for the data sent to the backend
export interface SelectedServicePayload {
  id: number; // HotelService ID
  quantity: number;
  details?: Record<string, any>; // For extra info like flight number
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
