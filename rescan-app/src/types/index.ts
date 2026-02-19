// Type definitions for RIC Recycling Scanner
export interface RicCode {
  code: number;
  plastic_type: string;
  description: string;
  general_recyclability: 'recyclable' | 'not_recyclable' | 'conditional';
  common_products: string[];
  recycling_notes: string;
}

export interface User {
  id: string;
  session_id: string;
  street_address?: string;
  total_points: number;
  scan_count: number;
  created_at: Date;
  last_scan_at?: Date;
}

export interface Scan {
  id: string;
  user_id: string;
  ric_code: number;
  is_recyclable_locally: boolean;
  points_awarded: number;
  scan_method: 'camera' | 'manual_entry';
  created_at: Date;
  plastic_type: string;
}

export interface RecyclingCapability {
  id: string;
  facility_name: string;
  accepted_ric_codes: number[];
  facility_type: 'curbside' | 'drop_off' | 'special_collection';
  address: string;
  contact_info?: string;
  notes?: string;
  distance_km?: number;
}

export interface LocationRequest {
  lat?: number;
  lng?: number;
  street_address?: string;
}

export interface ScanResult {
  scan_id: string;
  ric_code: number;
  is_recyclable_locally: boolean;
  points_awarded: number;
  recyclability_reason: string;
  nearest_facilities: RecyclingCapability[];
  total_user_points: number;
}