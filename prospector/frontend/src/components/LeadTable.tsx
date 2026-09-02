import type { Lead } from "../types";
import { ScoreBadge } from "./ScoreBadge";
import { formatPhoneDisplay, waLink, siteStatusLabel } from "../utils";

interface Props {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
}

export function LeadTable({ leads, onSelect }: Props) {
  if (leads.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
        Nenhum lead encontrado com os filtros atuais.
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
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
              <td style={{ padding: "12px 16px" }}>
                <ScoreBadge score={lead.score} scoreClass={lead.score_class} />
              </td>
              <td style={{ padding: "12px 16px", fontWeight: 500 }}>{lead.name}</td>
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
                  <a href={lead.google_maps_url} target="_blank" rel="noreferrer" title="Google Maps">
                    Maps
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
