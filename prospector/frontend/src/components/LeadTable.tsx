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
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880, tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: 32 }} />
          <col style={{ width: 90 }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: 130 }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: 110 }} />
          <col style={{ width: 140 }} />
          <col style={{ width: 190 }} />
        </colgroup>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={{ padding: "12px 16px" }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span className="truncate" title={lead.name} style={{ minWidth: 0 }}>{lead.name}</span>
                  {lead.crm_stage_id ? (
                    <span
                      className="chip active"
                      style={{ fontSize: 10, padding: "2px 8px", whiteSpace: "nowrap", flexShrink: 0 }}
                      title="Este lead já está no CRM"
                    >
                      ✅ NO CRM
                    </span>
                  ) : null}
                </div>
              </td>
              <td style={{ padding: "12px 16px" }} className="mono truncate" title={formatPhoneDisplay(lead.phone_e164) || ""}>
                {formatPhoneDisplay(lead.phone_e164) || <span className="text-muted">—</span>}
              </td>
              <td style={{ padding: "12px 16px" }} className="truncate" title={lead.city ? `${lead.city}/${lead.state || ""}` : ""}>
                {lead.city ? `${lead.city}/${lead.state || ""}` : <span className="text-muted">—</span>}
              </td>
              <td style={{ padding: "12px 16px" }} className="truncate">{siteStatusLabel(lead.site_status)}</td>
              <td style={{ padding: "12px 16px" }} className="mono truncate">
                {lead.rating ? `${lead.rating.toFixed(1)} ★ (${lead.reviews_count})` : <span className="text-muted">—</span>}
              </td>
              <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ width: 78, flexShrink: 0 }}>
                    {waLink(lead) && (
                      <a href={waLink(lead)!} target="_blank" rel="noreferrer" title="WhatsApp">💬 WhatsApp</a>
                    )}
                  </div>
                  <div style={{ width: 52, flexShrink: 0 }}>
                    {lead.google_maps_url && (
                      <a href={lead.google_maps_url} target="_blank" rel="noreferrer" title="Google Maps">📍 Maps</a>
                    )}
                  </div>
                  <div style={{ width: 60, flexShrink: 0 }}>
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
