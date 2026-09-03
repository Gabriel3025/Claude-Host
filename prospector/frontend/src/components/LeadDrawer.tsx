import { useEffect, useState } from "react";
import type { CrmHistoryEntry, CrmStage, Lead, LeadNote } from "../types";
import { api } from "../api";
import { ScoreBadge } from "./ScoreBadge";
import { formatPhoneDisplay, telLink, waLink, siteStatusLabel } from "../utils";

interface Props {
  lead: Lead;
  onClose: () => void;
  onUpdated: (lead: Lead) => void;
  onRemoveFromCrm?: () => void;
}

const EVENT_LABELS: Record<string, (h: CrmHistoryEntry) => string> = {
  ADDED_TO_CRM: (h) => `Adicionado ao CRM — etapa "${h.to_stage_name}"`,
  STAGE_CHANGED: (h) => `Movido de "${h.from_stage_name}" para "${h.to_stage_name}"`,
  REMOVED_FROM_CRM: (h) => `Removido do CRM (estava em "${h.from_stage_name}")`,
};

export function LeadDrawer({ lead, onClose, onUpdated, onRemoveFromCrm }: Props) {
  const [draftNote, setDraftNote] = useState("");
  const [notes, setNotesLog] = useState<LeadNote[]>([]);
  const [sendingNote, setSendingNote] = useState(false);
  const [stages, setStages] = useState<CrmStage[]>([]);
  const [history, setHistory] = useState<CrmHistoryEntry[]>([]);

  useEffect(() => {
    setDraftNote("");
    api.listStages().then(setStages);
    api.getLeadHistory(lead.id).then(setHistory);
    api.listLeadNotes(lead.id).then(setNotesLog);
  }, [lead.id]);

  const reasons: string[] = safeParseJson(lead.score_reasons);
  const techIssues: string[] = safeParseJson(lead.site_tech_issues);

  async function handleAddNote() {
    const text = draftNote.trim();
    if (!text) return;
    setSendingNote(true);
    try {
      const updatedNotes = await api.addLeadNote(lead.id, text);
      setNotesLog(updatedNotes);
      setDraftNote("");
      const updatedLead = await api.getLead(lead.id);
      onUpdated(updatedLead);
    } finally {
      setSendingNote(false);
    }
  }

  async function refreshHistory() {
    api.getLeadHistory(lead.id).then(setHistory);
  }

  async function handleAddToCrm() {
    await api.addToCrm([lead.id]);
    const updated = await api.getLead(lead.id);
    onUpdated(updated);
    refreshHistory();
  }

  async function handleMoveStage(stageId: number) {
    const updated = await api.moveCard(lead.id, stageId);
    onUpdated(updated);
    refreshHistory();
  }

  async function handleRemove() {
    if (onRemoveFromCrm) {
      onRemoveFromCrm();
      return;
    }
    if (!confirm(`Remover "${lead.name}" do CRM?`)) return;
    await api.removeFromCrm(lead.id);
    const updated = await api.getLead(lead.id);
    onUpdated(updated);
    refreshHistory();
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

        <Section title="CRM">
          {lead.crm_stage_id ? (
            <>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  Etapa atual
                </label>
                <select
                  value={lead.crm_stage_id}
                  onChange={(e) => handleMoveStage(Number(e.target.value))}
                  style={{ width: "100%" }}
                >
                  {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {lead.crm_added_at && (
                <div className="text-muted" style={{ fontSize: 12, marginBottom: 8 }}>
                  No CRM desde {lead.crm_added_at}
                </div>
              )}
              <button className="btn" onClick={handleRemove}>Remover do CRM</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleAddToCrm}>Adicionar ao CRM</button>
          )}
        </Section>

        <Section title="NOTAS">
          <textarea
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            rows={3}
            style={{ width: "100%", resize: "vertical" }}
            placeholder="Ex: Falei com secretária. Sócio retorna às 15h."
          />
          <button
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            disabled={sendingNote || !draftNote.trim()}
            onClick={handleAddNote}
          >
            {sendingNote ? "Enviando..." : "Adicionar anotação"}
          </button>

          {notes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              {notes.map((n) => (
                <div key={n.id} style={{ borderLeft: "2px solid var(--border)", paddingLeft: 10 }}>
                  <div className="mono text-muted" style={{ fontSize: 11, marginBottom: 2 }}>
                    {n.created_at}
                  </div>
                  <div style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{n.text}</div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="HISTÓRICO">
          <Timeline lead={lead} history={history} />
        </Section>
      </div>
    </div>
  );
}

function Timeline({ lead, history }: { lead: Lead; history: CrmHistoryEntry[] }) {
  const entries: { at: string; label: string }[] = [
    { at: lead.first_seen_at, label: "Lead coletado na busca" },
    ...history.map((h) => ({
      at: h.occurred_at,
      label: (EVENT_LABELS[h.event_type] || (() => h.event_type))(h),
    })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {entries.map((e, i) => (
        <div key={i} style={{ display: "flex", gap: 10, fontSize: 13 }}>
          <span className="mono text-muted" style={{ whiteSpace: "nowrap", fontSize: 11 }}>{e.at}</span>
          <span>{e.label}</span>
        </div>
      ))}
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
