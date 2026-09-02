import type { Lead } from "../types";
import { ScoreBadge } from "./ScoreBadge";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { SiteStatusBadge } from "./SiteStatusBadge";
import { formatPhoneDisplay, waLink } from "../utils";

interface Props {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
  selectedIds: Set<number>;
  onToggleSelect: (leadId: number) => void;
  onToggleSelectAll: () => void;
  onSendToCrm: (leadId: number) => void;
}

export function LeadTable({ leads, onSelect, selectedIds, onToggleSelect, onToggleSelectAll, onSendToCrm }: Props) {
  if (leads.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
        Nenhum lead encontrado com os filtros atuais.
      </div>
    );
  }

  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.id));

  return (
    <div className="card" style={{ padding: 0, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880, tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: 20 }} />
          <col style={{ width: 78 }} />
          <col style={{ width: 52 }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: 148 }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: 110 }} />
          <col style={{ width: 96 }} />
          <col style={{ width: 150 }} />
        </colgroup>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={{ padding: "12px 8px" }}>
              <input type="checkbox" className="checkbox-round" checked={allSelected} onChange={onToggleSelectAll} />
            </th>
            {["SCORE", "NICHO", "EMPRESA", "TELEFONE", "CIDADE/UF", "STATUS SITE", "AVALIAÇÕES", "AÇÃO"].map((h) => (
              <th key={h} className="label-tag" style={{ textAlign: "left", padding: "12px 10px", fontWeight: 500 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onSelect(lead)}
              style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ padding: "12px 8px" }} onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="checkbox-round"
                  checked={selectedIds.has(lead.id)}
                  onChange={() => onToggleSelect(lead.id)}
                />
              </td>
              <td style={{ padding: "12px 10px" }}>
                <ScoreBadge score={lead.score} scoreClass={lead.score_class} />
              </td>
              <td style={{ padding: "12px 6px" }} className="mono text-muted truncate" title={lead.niche_abbr || ""}>
                {lead.niche_abbr || "—"}
              </td>
              <td style={{ padding: "12px 10px", fontWeight: 500 }}>
                <span className="truncate" title={lead.name} style={{ minWidth: 0, display: "block" }}>{lead.name}</span>
              </td>
              <td style={{ padding: "12px 10px", whiteSpace: "nowrap" }} className="mono">
                {formatPhoneDisplay(lead.phone_e164) || <span className="text-muted">—</span>}
              </td>
              <td style={{ padding: "12px 10px" }} className="truncate" title={lead.city ? `${lead.city}/${lead.state || ""}` : ""}>
                {lead.city ? `${lead.city}/${lead.state || ""}` : <span className="text-muted">—</span>}
              </td>
              <td style={{ padding: "12px 10px" }}>
                <SiteStatusBadge status={lead.site_status} />
              </td>
              <td style={{ padding: "12px 10px" }} className="mono truncate">
                {lead.rating ? `${lead.rating.toFixed(1)} ★ (${lead.reviews_count})` : <span className="text-muted">—</span>}
              </td>
              <td style={{ padding: "12px 10px" }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, width: 58, flexShrink: 0 }}>
                    {waLink(lead) && (
                      <a
                        href={waLink(lead)!} target="_blank" rel="noreferrer" title="WhatsApp"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12 }}
                      >
                        <WhatsAppIcon size={12} /> WPP
                      </a>
                    )}
                    {lead.google_maps_url && (
                      <a
                        href={lead.google_maps_url} target="_blank" rel="noreferrer" title="Google Maps"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12 }}
                      >
                        <span style={{ fontSize: 12, width: 12, textAlign: "center" }}>📍</span> Maps
                      </a>
                    )}
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {lead.crm_stage_id ? (
                      <span
                        className="chip active"
                        style={{ fontSize: 10, padding: "2px 8px", whiteSpace: "nowrap" }}
                        title="Este lead já está no CRM"
                      >
                        ✅ NO CRM
                      </span>
                    ) : (
                      <button
                        className="btn"
                        style={{ padding: "4px 8px", fontSize: 11, whiteSpace: "nowrap" }}
                        onClick={() => onSendToCrm(lead.id)}
                        title="Enviar este lead para o CRM"
                      >
                        + CRM
                      </button>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
