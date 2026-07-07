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
  stamp_goal?: number; // št. žigov za kartonček-nagrado (kava)
  city?: string | null;
  scan_window_hours: number;
  scan_cooldown_minutes?: number; // min razmik med skeniranji za isto stranko (0 = off)
  redemption_minutes: number;
  daily_scan_cap: number | null;
  google_review_url?: string | null; // za Google-ocene autopilot (opcijsko)
  birthday_prompt_enabled?: boolean; // lastnik vklopi rojstno-dnevni popup za goste
  birthday_prompt_min_scans?: number; // koliko računov mora gost skenirati, da se popup prikaže (privzeto 5)
  language?: string; // jezik gostovega flowa (sl/en/hr/sr/bs/de)
  wheel_config?: WheelConfig | null; // konfiguracija kolesa sreče
  automations?: Automations | null; // marketing avtomatizacije
  // naročnina (super-admin ročno dodeli; pravi Stripe še ni)
  plan?: PlanKey;
  billing_cycle?: BillingCycle;
  subscription_status?: SubStatus;
  commitment_months?: number;
  subscribed_at?: string | null;
  custom_price_eur?: number | null;
  // Polar (Merchant of Record) — sinhronizirano prek webhooka
  polar_customer_id?: string | null;
  polar_subscription_id?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  trial_ends_at?: string | null; // do kdaj ima dostop brez plačila (trial / grace / superadmin)
  resend_api_key?: string | null; // Scale: lasten Resend ključ (maili iz lastnikove domene)
  email_from?: string | null;
  created_at: string;
}

export type LogEntry = { type: string; when: string; detail: string };

export type PlanKey = "free" | "start" | "grow" | "scale";
export type BillingCycle = "monthly" | "yearly";
export type SubStatus = "trialing" | "active" | "past_due" | "canceled";

export interface Automation {
  enabled: boolean;
  message: string;
  coupon: boolean;
  couponName: string;
  days?: number; // pogrešamo te
  months?: number; // obletnica
  date?: string; // rojstni dan lokala (MM-DD)
}
export type Automations = Record<string, Automation>;

export interface WheelSegment {
  label: string;
  weight: number; // utež za naključni način (večja = večja verjetnost)
}

export interface WheelConfig {
  enabled: boolean;
  mode: "fixed" | "weighted"; // fixed = vedno isti zadetek; weighted = naključno po utežeh
  winner: number; // indeks zmagovalnega segmenta (za fixed)
  segments: WheelSegment[];
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
  kind?: "stamp" | "points";
}

export interface Customer {
  id: string;
  venue_id: string;
  phone: string | null;
  email: string | null;
  points: number;
  stamps?: number;
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
  customers: { phone: string | null; email: string | null } | null;
}

export interface RedemptionRow {
  id: string;
  created_at: string;
  points_spent: number;
  rewards: { name: string } | null;
  customers: { phone: string | null; email: string | null } | null;
}

export interface GrantRow {
  id: string;
  created_at: string;
  points: number;
  note: string | null;
  customers: { phone: string | null; email: string | null } | null;
}
