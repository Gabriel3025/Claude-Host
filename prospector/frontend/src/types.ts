export interface Lead {
  id: number;
  place_id: string | null;
  name: string;
  category: string | null;
  niche_abbr: string | null;
  phone_raw: string | null;
  phone_e164: string | null;
  is_mobile_phone: number;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  rating: number | null;
  reviews_count: number;
  website_url: string | null;
  final_url: string | null;
  site_status: string;
  https: number | null;
  response_time_ms: number | null;
  page_size_bytes: number | null;
  has_title: number | null;
  has_viewport: number | null;
  has_contact_form: number | null;
  site_tech_issues: string;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  whatsapp_found: number;
  phone_on_site: number;
  score: number;
  score_class: "A" | "B" | "C" | null;
  score_reasons: string;
  crm_status: string;
  notes: string;
  crm_stage_id: number | null;
  crm_position: number | null;
  crm_added_at: string | null;
  first_seen_at: string;
  updated_at: string;
}

export interface CrmStage {
  id: number;
  name: string;
  position: number;
  color: string | null;
  created_at: string;
  cards?: Lead[];
}

export interface CrmBoard {
  stages: CrmStage[];
}

export interface CrmHistoryEntry {
  id: number;
  lead_id: number;
  event_type: "ADDED_TO_CRM" | "STAGE_CHANGED" | "REMOVED_FROM_CRM";
  from_stage_name: string | null;
  to_stage_name: string | null;
  occurred_at: string;
}

export interface LeadNote {
  id: number;
  lead_id: number;
  text: string;
  created_at: string;
}

export interface FunnelStage {
  stage_id: number;
  name: string;
  color: string | null;
  ever_reached: number;
  current: number;
  pct_of_cohort: number;
}

export interface FunnelLeadRow {
  id: number;
  name: string;
  phone_e164: string | null;
  city: string | null;
  state: string | null;
  score: number;
  score_class: "A" | "B" | "C" | null;
}

export interface DashboardData {
  period: { start: string; end: string; niche: string | null };
  niches: string[];
  stat_tiles: {
    leads_no_crm_no_periodo: number;
    leads_coletados_no_periodo: number;
    reunioes_agendadas: number;
    taxa_agendamento_pct: number;
    fechados: number;
    taxa_fechamento_pct: number;
    perdidos: number;
    em_aberto: number;
  };
  funnel: FunnelStage[];
  removed_from_crm: number;
  score_distribution: { A: number; B: number; C: number };
  daily_activity: { d: string; n: number }[];
}

export interface LeadsResponse {
  items: Lead[];
  total: number;
  stats: Stats;
}

export interface Stats {
  collected: number;
  score_a: number;
  score_b: number;
  score_c: number;
  no_website: number;
  site_down: number;
  with_phone: number;
}

export interface SearchProgress {
  phase: string;
  phase_index: number;
  found: number;
  analyzed: number;
  total: number;
  errors_count: number;
}

export interface Search {
  id: number;
  niche: string;
  niche_abbr: string | null;
  city: string;
  state: string;
  region: string | null;
  requested_count: number;
  status: "RUNNING" | "DONE" | "ERROR" | "CANCELLED";
  provider: string;
  provider_run_id: string | null;
  results_count: number;
  from_cache_count: number;
  estimated_cost_usd: number;
  duplicate_count: number;
  duplicate_lead_ids?: string;
  is_deleted: number;
  error: string | null;
  created_at: string;
  finished_at: string | null;
  progress?: SearchProgress;
}

export interface Settings {
  provider: string;
  token_configured: boolean;
  token_masked: string;
  total_searches: number;
  total_leads_collected: number;
  total_api_calls: number;
  total_estimated_cost_usd: number;
  cache_ttl_days: number;
  site_check_concurrency: number;
  max_leads_confirm_threshold: number;
  cost_per_place_usd: number;
}

export type Page = "control" | "processing" | "leads" | "history" | "settings" | "crm" | "dashboard";
