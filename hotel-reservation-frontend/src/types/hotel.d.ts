// src/types/hotel.d.ts
// version: 1.0.2
// Feature: Added SiteSettings interface for global site configuration.

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
  id: string; 
  room: {
    id: number;
    name: string;
    image: RoomImage | null;
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
