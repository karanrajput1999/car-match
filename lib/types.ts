export interface CarVariant {
  name: string;
  price: number;
  fuel_type: string;
  transmission: string;
  key_features: string[];
  is_base?: boolean;
  is_top?: boolean;
}

export interface CarReview {
  author: string;
  rating: number;
  text: string;
  use_case: string;
}

export interface Car {
  id: string;
  name: string;
  brand: string;
  price_min: number;
  price_max: number;
  price_display: string;
  body_type: string;
  fuel: string[];
  mileage_kmpl: number | null;
  range_km?: number;
  seating: number;
  safety_rating: number;
  transmission: string[];
  use_case: string[];
  segment: string;
  boot_space_litres: number;
  engine_cc: number | null;
  variants: CarVariant[];
  pros: string[];
  cons: string[];
  best_for: string;
  tags: string[];
  reviews: CarReview[];
  image_url: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface CarFilters {
  search?: string;
  budgetMin?: number;
  budgetMax?: number;
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  seating?: number[];
  safetyRating?: number;
}
