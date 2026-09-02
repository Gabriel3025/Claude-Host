import type { Lead } from "../types";
import { ScoreBadge } from "./ScoreBadge";
import { formatPhoneDisplay, waLink, siteStatusLabel } from "../utils";

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
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={{ padding: "12px 16px", width: 32 }}>
              <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} />
            </th>
            {["SCORE", "EMPRESA", "TELEFONE", "CIDADE/UF", "STATUS SITE", "AVALIAÇÕES", "AÇÃO"].map((h) => (
              <th key={h} className="label-tag" style={{ textAlign: "left", padding: "12px 16px", fontWeight: 500 }}>
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
              <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(lead.id)}
                  onChange={() => onToggleSelect(lead.id)}
                />
              </td>
              <td style={{ padding: "12px 16px" }}>
                <ScoreBadge score={lead.score} scoreClass={lead.score_class} />
              </td>
              <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{lead.name}</span>
                  {lead.crm_stage_id && (
                    <span
                      className="chip active"
                      style={{ fontSize: 10, padding: "2px 8px", whiteSpace: "nowrap" }}
                      title="Este lead já está no CRM"
                    >
                      NO CRM
                    </span>
                  )}
                </div>
              </td>
              <td style={{ padding: "12px 16px" }} className="mono">
                {formatPhoneDisplay(lead.phone_e164) || <span className="text-muted">—</span>}
              </td>
              <td style={{ padding: "12px 16px" }}>
                {lead.city ? `${lead.city}/${lead.state || ""}` : <span className="text-muted">—</span>}
              </td>
              <td style={{ padding: "12px 16px" }}>{siteStatusLabel(lead.site_status)}</td>
              <td style={{ padding: "12px 16px" }} className="mono">
                {lead.rating ? `${lead.rating.toFixed(1)} ★ (${lead.reviews_count})` : <span className="text-muted">—</span>}
              </td>
              <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                {waLink(lead) && (
                  <a href={waLink(lead)!} target="_blank" rel="noreferrer" title="WhatsApp" style={{ marginRight: 10 }}>
                    WhatsApp
                  </a>
                )}
                {lead.google_maps_url && (
                  <a href={lead.google_maps_url} target="_blank" rel="noreferrer" title="Google Maps" style={{ marginRight: 10 }}>
                    Maps
                  </a>
                )}
                {!lead.crm_stage_id && (
                  <button
                    className="btn"
                    style={{ padding: "4px 10px", fontSize: 12 }}
                    onClick={() => onSendToCrm(lead.id)}
                    title="Enviar este lead para o CRM"
                  >
                    + CRM
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
