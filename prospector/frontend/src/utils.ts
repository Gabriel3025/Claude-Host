import type { Lead } from "./types";

export function formatPhoneDisplay(phoneE164: string | null): string | null {
  if (!phoneE164) return null;
  const national = phoneE164.slice(3);
  const ddd = national.slice(0, 2);
  const rest = national.slice(2);
  if (rest.length === 9) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  if (rest.length === 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return phoneE164;
}

export function waLink(lead: Lead): string | null {
  if (!lead.phone_e164) return null;
  if (!(lead.is_mobile_phone || lead.whatsapp_found)) return null;
  return `https://wa.me/${lead.phone_e164.replace("+", "")}`;
}

export function telLink(lead: Lead): string | null {
  return lead.phone_e164 ? `tel:${lead.phone_e164}` : null;
}

const SITE_STATUS_LABELS: Record<string, string> = {
  NO_WEBSITE: "Sem site",
  SOCIAL_ONLY: "Só rede social",
  ONLINE: "Online",
  OFFLINE: "Fora do ar",
  TIMEOUT: "Fora do ar (timeout)",
  HTTP_ERROR: "Fora do ar (erro HTTP)",
  DNS_ERROR: "Fora do ar (DNS)",
  NOT_CHECKED: "Não verificado",
};

export function siteStatusLabel(status: string): string {
  return SITE_STATUS_LABELS[status] || status;
}

export const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export interface NichePreset {
  name: string;
  abbr: string;
}

export const NICHE_PRESETS: NichePreset[] = [
  { name: "Escritório de Advocacia", abbr: "ADV" },
  { name: "Clínica Médica", abbr: "CLI" },
  { name: "Dentista", abbr: "ODO" },
  { name: "Imobiliária", abbr: "IMO" },
  { name: "Contabilidade", abbr: "CONT" },
  { name: "Academia", abbr: "ACAD" },
  { name: "Restaurante", abbr: "REST" },
];

export const NICHE_SUGGESTIONS = NICHE_PRESETS.map((p) => p.name);
