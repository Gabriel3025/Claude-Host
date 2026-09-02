import type { Lead, LeadsResponse, Search, Settings } from "./types";

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
  city: string;
  state: string;
  region?: string;
  quantity: number;
  confirmed?: boolean;
  reuse?: boolean;
}

export interface CreateSearchResult {
  search_id?: number;
  warning?: string;
  message?: string;
  existing_search_id?: number;
}

export const api = {
  createSearch: (payload: CreateSearchPayload) =>
    request<CreateSearchResult>("/searches", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getSearch: (id: number) => request<Search>(`/searches/${id}`),

  listSearches: () => request<Search[]>("/searches"),

  cancelSearch: (id: number) =>
    request<{ ok: boolean }>(`/searches/${id}/cancel`, { method: "POST" }),

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
};
