import type { Lead, LeadsResponse, Search, Settings, CrmStage, CrmBoard, CrmHistoryEntry } from "./types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.detail || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

export interface CreateSearchPayload {
  niche: string;
  city?: string;
  state: string;
  region?: string;
  quantity: number;
  confirmed?: boolean;
  include_duplicates?: boolean;
  no_site_only?: boolean;
}

export interface CreateSearchResult {
  search_id?: number;
  warning?: string;
  message?: string;
}

export const api = {
  createSearch: (payload: CreateSearchPayload) =>
    request<CreateSearchResult>("/searches", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getSearch: (id: number) => request<Search>(`/searches/${id}`),

  listSearches: (trash = false) => request<Search[]>(`/searches?trash=${trash}`),

  cancelSearch: (id: number) =>
    request<{ ok: boolean }>(`/searches/${id}/cancel`, { method: "POST" }),

  includeDuplicates: (id: number) =>
    request<{ added: number }>(`/searches/${id}/include-duplicates`, { method: "POST" }),

  deleteSearch: (id: number) =>
    request<{ ok: boolean }>(`/searches/${id}/delete`, { method: "POST" }),
  restoreSearch: (id: number) =>
    request<{ ok: boolean }>(`/searches/${id}/restore`, { method: "POST" }),
  permanentlyDeleteSearch: (id: number) =>
    request<{ ok: boolean }>(`/searches/${id}`, { method: "DELETE" }),

  listLeads: (params: Record<string, string | number | boolean | undefined>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    });
    return request<LeadsResponse>(`/leads?${qs.toString()}`);
  },

  getLead: (id: number) => request<Lead>(`/leads/${id}`),

  updateLead: (id: number, payload: { crm_status?: string; notes?: string }) =>
    request<Lead>(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  exportUrl: (params: Record<string, string | number | boolean | undefined>, format: "csv" | "xlsx") => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    });
    qs.set("format", format);
    return `${BASE}/export?${qs.toString()}`;
  },

  getSettings: () => request<Settings>("/settings"),

  updateSettings: (apify_token: string) =>
    request<{ ok: boolean }>("/settings", { method: "PUT", body: JSON.stringify({ apify_token }) }),

  testToken: () => request<{ ok: boolean; message?: string; username?: string }>("/settings/test-token", { method: "POST" }),

  // CRM
  listStages: () => request<CrmStage[]>("/crm/stages"),
  createStage: (name: string, color?: string | null) =>
    request<CrmStage>("/crm/stages", { method: "POST", body: JSON.stringify({ name, color }) }),
  updateStage: (id: number, name?: string, color?: string | null) => {
    const body: Record<string, unknown> = {};
    if (name !== undefined) body.name = name;
    if (color !== undefined) body.color = color;
    return request<CrmStage>(`/crm/stages/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  },
  reorderStages: (stage_ids: number[]) =>
    request<{ ok: boolean }>("/crm/stages/reorder", { method: "POST", body: JSON.stringify({ stage_ids }) }),
  deleteStage: (id: number) =>
    request<{ ok: boolean }>(`/crm/stages/${id}`, { method: "DELETE" }),

  getBoard: () => request<CrmBoard>("/crm/board"),

  addToCrm: (lead_ids: number[], stage_id?: number) =>
    request<{ added: number[] }>("/crm/cards", {
      method: "POST",
      body: JSON.stringify({ lead_ids, stage_id }),
    }),
  removeFromCrm: (leadId: number) =>
    request<{ ok: boolean }>(`/crm/cards/${leadId}`, { method: "DELETE" }),
  moveCard: (leadId: number, stage_id: number, position?: number) =>
    request<Lead>(`/crm/cards/${leadId}`, {
      method: "PATCH",
      body: JSON.stringify({ stage_id, position }),
    }),
  getLeadHistory: (leadId: number) => request<CrmHistoryEntry[]>(`/crm/cards/${leadId}/history`),
};
