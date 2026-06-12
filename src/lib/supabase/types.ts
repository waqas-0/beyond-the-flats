export type VerificationStatus = "pending" | "approved" | "rejected";
export type Species = "bonefish" | "tarpon" | "permit" | "other";

export type Guide = {
  id: string;
  phone: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  boat_type: string | null;
  islands: string[];
  specialties: string[];
  years_experience: number | null;
  license_url: string | null;
  qr_url: string | null;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
  conservation_pledge: boolean;
  created_at: string;
  updated_at: string;
};

export type Trip = {
  id: string;
  guide_id: string;
  client_name: string | null;
  start_time: string;
  end_time: string | null;
  location_note: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  photo_url: string | null;
  created_at: string;
};

export type Catch = {
  id: string;
  trip_id: string;
  species: Species;
  count: number;
  photo_url: string | null;
  logged_at: string;
};

export type Review = {
  id: string;
  guide_id: string;
  visitor_name: string;
  stars: number;
  body: string | null;
  approved: boolean;
  created_at: string;
};

export type QrScan = {
  id: string;
  guide_id: string;
  scanned_at: string;
  user_agent: string | null;
  country_code: string | null;
};
