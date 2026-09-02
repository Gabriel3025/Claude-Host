import { useEffect, useRef, useState } from "react";
import type { Lead } from "../types";
import { api } from "../api";
import { ScoreBadge } from "./ScoreBadge";
import { formatPhoneDisplay, telLink, waLink, siteStatusLabel } from "../utils";

const CRM_STATUSES = [
  "NOVO", "LIGAR", "TENTATIVA 1", "TENTATIVA 2", "CONTATO REALIZADO",
  "INTERESSADO", "PROPOSTA", "CLIENTE", "SEM INTERESSE",
];

interface Props {
  lead: Lead;
  onClose: () => void;
  onUpdated: (lead: Lead) => void;
}

export function LeadDrawer({ lead, onClose, onUpdated }: Props) {
  const [notes, setNotes] = useState(lead.notes || "");
  const [saved, setSaved] = useState(true);
  const [crmStatus, setCrmStatus] = useState(lead.crm_status);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setNotes(lead.notes || "");
    setCrmStatus(lead.crm_status);
    setSaved(true);
  }, [lead.id]);

  const reasons: string[] = safeParseJson(lead.score_reasons);
  const techIssues: string[] = safeParseJson(lead.site_tech_issues);

  function handleNotesChange(value: string) {
    setNotes(value);
    setSaved(false);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      const updated = await api.updateLead(lead.id, { notes: value });
      onUpdated(updated);
      setSaved(true);
    }, 1000);
  }

  async function handleStatusChange(value: string) {
    setCrmStatus(value);
    const updated = await api.updateLead(lead.id, { crm_status: value });
    onUpdated(updated);
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={drawerStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span className="label-tag">DETALHE DO LEAD</span>
          <button className="btn" onClick={onClose}>Fechar</button>
        </div>

        <Section title="EMPRESA">
          <h2 style={{ margin: "0 0 8px" }}>{lead.name}</h2>
          {lead.category && <div className="text-muted">{lead.category}</div>}
          <div style={{ marginTop: 6 }}>{lead.address}</div>
          <div className="text-muted">{lead.city}{lead.state ? `/${lead.state}` : ""}</div>
        </Section>

        <Section title="CONTATO">
          <div className="mono" style={{ marginBottom: 10 }}>
            {formatPhoneDisplay(lead.phone_e164) || <span className="text-muted">Telefone não disponível</span>}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {telLink(lead) && <a className="btn btn-secondary" href={telLink(lead)!}>LIGAR</a>}
            {waLink(lead) && (
              <a className="btn btn-primary" href={waLink(lead)!} target="_blank" rel="noreferrer">WHATSAPP</a>
            )}
          </div>
        </Section>

        <Section title="PRESENÇA DIGITAL">
          <Row label="Website" value={lead.final_url} link={lead.final_url || undefined} />
          <Row label="Google Maps" value={lead.google_maps_url ? "Abrir" : null} link={lead.google_maps_url || undefined} />
          <Row label="Instagram" value={lead.instagram} link={lead.instagram || undefined} />
          <Row label="Facebook" value={lead.facebook} link={lead.facebook || undefined} />
          <Row label="E-mail" value={lead.email} link={lead.email ? `mailto:${lead.email}` : undefined} />
        </Section>

        <Section title="DIAGNÓSTICO">
          <div style={{ marginBottom: 10 }}>
            <ScoreBadge score={lead.score} scoreClass={lead.score_class} showLabel />
          </div>
          <ul style={{ margin: "0 0 12px", paddingLeft: 18 }}>
            {reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          <Row label="Status do site" value={siteStatusLabel(lead.site_status)} />
          <Row label="HTTPS" value={lead.https === null ? "—" : lead.https ? "Sim" : "Não"} />
          <Row label="Avaliações Google" value={lead.rating ? `${lead.rating.toFixed(1)} ★ (${lead.reviews_count})` : "—"} />
          {techIssues.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div className="text-muted" style={{ fontSize: 12, marginBottom: 4 }}>Problemas técnicos:</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {techIssues.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </Section>

        <Section title="FUNIL">
          <select value={crmStatus} onChange={(e) => handleStatusChange(e.target.value)} style={{ width: "100%" }}>
            {CRM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Section>

        <Section title="NOTAS">
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={4}
            style={{ width: "100%", resize: "vertical" }}
            placeholder="Ex: Falei com secretária. Sócio retorna às 15h."
          />
          <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
            {saved ? "salvo ✓" : "salvando..."}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
      <div className="label-tag" style={{ marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value, link }: { label: string; value: string | null | undefined; link?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
      <span className="text-muted">{label}</span>
      {value ? (
        link ? <a href={link} target="_blank" rel="noreferrer">{value}</a> : <span>{value}</span>
      ) : (
        <span className="text-muted">—</span>
      )}
    </div>
  );
}

function safeParseJson(text: string): string[] {
  try {
    const parsed = JSON.parse(text || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
  display: "flex", justifyContent: "flex-end", zIndex: 100,
};

const drawerStyle: React.CSSProperties = {
  width: "min(480px, 100%)", height: "100%", background: "var(--surface)",
  borderLeft: "1px solid var(--border)", padding: 24, overflowY: "auto",
};
