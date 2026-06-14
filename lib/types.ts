export type PointsModel = "per_visit" | "per_euro";

export interface Venue {
  id: string;
  owner_user_id: string | null;
  name: string;
  public_code: string;
  logo_url: string | null;
  brand_color: string;
  davcna_stevilka: string | null;
  points_model: PointsModel;
  points_per_visit: number;
  points_per_euro: number;
  scan_window_hours: number;
  redemption_minutes: number;
  daily_scan_cap: number | null;
  created_at: string;
}

export interface Activation {
  redemption_id: string;
  reward_name: string;
  expires_at: string; // ISO — server-side iztek
  status: "active" | "redeemed" | "expired";
}

export interface Reward {
  id: string;
  venue_id: string;
  name: string;
  image_url: string | null;
  points_required: number;
  sort_order: number;
}

export interface Customer {
  id: string;
  venue_id: string;
  phone: string | null;
  email: string | null;
  points: number;
  created_at: string;
}

export interface ScanSuccess {
  ok: true;
  pointsAwarded: number;
  totalPoints: number;
  nextReward: { name: string; points_required: number; remaining: number } | null;
}

export interface ScanFailure {
  ok: false;
  error: string;
}

export type ScanResult = ScanSuccess | ScanFailure;

export interface ScanRow {
  id: string;
  created_at: string;
  points_awarded: number;
  customer_id: string;
  customers: { phone: string | null } | null;
}

export interface RedemptionRow {
  id: string;
  created_at: string;
  points_spent: number;
  rewards: { name: string } | null;
  customers: { phone: string | null } | null;
}
