import { useEffect, useState } from "react";
import { api } from "../api";
import type { CrmStage, Lead } from "../types";
import { ScoreBadge } from "../components/ScoreBadge";
import { formatPhoneDisplay, waLink } from "../utils";
import { LeadDrawer } from "../components/LeadDrawer";
import { ColorPicker } from "../components/ColorPicker";
import { WhatsAppIcon } from "../components/WhatsAppIcon";

export function CRMBoard() {
  const [stages, setStages] = useState<CrmStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [draggingLeadId, setDraggingLeadId] = useState<number | null>(null);
  const [draggingStageId, setDraggingStageId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<number | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [editingStageId, setEditingStageId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  function load() {
    setLoading(true);
    api.getBoard().then((board) => setStages(board.stages)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDrop(stageId: number) {
    if (draggingLeadId == null) return;
    setDragOverStage(null);
    const leadId = draggingLeadId;
    setDraggingLeadId(null);

    const source = stages.find((s) => s.cards?.some((c) => c.id === leadId));
    if (!source || source.id === stageId) return;

    setStages((prev) =>
      prev.map((s) => {
        if (s.id === source.id) return { ...s, cards: s.cards?.filter((c) => c.id !== leadId) };
        if (s.id === stageId) {
          const card = source.cards?.find((c) => c.id === leadId);
          return card ? { ...s, cards: [...(s.cards || []), card] } : s;
        }
        return s;
      })
    );

    try {
      await api.moveCard(leadId, stageId);
    } catch {
      load();
    }
  }

  function handleStageReorder(targetStageId: number) {
    const sourceId = draggingStageId;
    setDragOverStage(null);
    setDraggingStageId(null);
    if (sourceId == null || sourceId === targetStageId) return;

    const fromIdx = stages.findIndex((s) => s.id === sourceId);
    const toIdx = stages.findIndex((s) => s.id === targetStageId);
    if (fromIdx === -1 || toIdx === -1) return;

    const arr = [...stages];
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, moved);
    setStages(arr);
    api.reorderStages(arr.map((s) => s.id)).catch(() => load());
  }

  async function handleAddColumn() {
    const name = newColumnName.trim();
    if (!name) return;
    const stage = await api.createStage(name);
    setStages((prev) => [...prev, { ...stage, cards: [] }]);
    setNewColumnName("");
  }

  async function handleRenameColumn(stageId: number) {
    const name = editingName.trim();
    setEditingStageId(null);
    if (!name) return;
    await api.updateStage(stageId, name);
    setStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, name } : s)));
  }

  async function handleStageColorChange(stageId: number, color: string | null) {
    setStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, color } : s)));
    await api.updateStage(stageId, undefined, color);
  }

  async function handleDeleteColumn(stage: CrmStage) {
    if ((stage.cards || []).length > 0) {
      alert("Mova os leads desta coluna antes de excluí-la.");
      return;
    }
    if (!confirm(`Excluir a coluna "${stage.name}"?`)) return;
    await api.deleteStage(stage.id);
    setStages((prev) => prev.filter((s) => s.id !== stage.id));
  }

  async function handleRemoveFromCrm(leadId: number) {
    await api.removeFromCrm(leadId);
    setStages((prev) => prev.map((s) => ({ ...s, cards: s.cards?.filter((c) => c.id !== leadId) })));
    setSelected(null);
  }

  async function handleQuickRemove(leadId: number) {
    setStages((prev) => prev.map((s) => ({ ...s, cards: s.cards?.filter((c) => c.id !== leadId) })));
    await api.removeFromCrm(leadId);
  }

  function handleUpdatedLead(updated: Lead) {
    setStages((prev) =>
      prev.map((s) => ({
        ...s,
        cards: s.cards?.map((c) => (c.id === updated.id ? updated : c)),
      }))
    );
    setSelected(updated);
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="label-tag" style={{ marginBottom: 16, fontSize: 14 }}>🗂️ [ CRM ]</div>

      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 12, alignItems: "flex-start" }}>
        {stages.map((stage) => (
          <div
            key={stage.id}
            onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.id); }}
            onDragLeave={() => setDragOverStage((s) => (s === stage.id ? null : s))}
            onDrop={() => (draggingStageId != null ? handleStageReorder(stage.id) : handleDrop(stage.id))}
            style={{
              width: 268, flexShrink: 0,
              display: "flex", flexDirection: "column",
              maxHeight: "calc(100vh - 200px)",
              background: dragOverStage === stage.id ? "rgba(0,229,255,0.06)" : "var(--surface)",
              border: `1px solid ${dragOverStage === stage.id ? "var(--cyan)" : "var(--border)"}`,
              borderTop: `3px solid ${stage.color || "var(--border)"}`,
              borderRadius: 6, padding: 10,
              opacity: draggingStageId === stage.id ? 0.4 : 1,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 6, flexShrink: 0 }}>
              <span
                draggable
                onDragStart={(e) => { e.stopPropagation(); setDraggingStageId(stage.id); }}
                onDragEnd={() => setDraggingStageId(null)}
                title="Clique e arraste para reordenar a coluna"
                style={{ cursor: "grab", color: "var(--text-muted)", fontSize: 13, flexShrink: 0, userSelect: "none" }}
              >
                ⠿
              </span>
              {editingStageId === stage.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleRenameColumn(stage.id)}
                  onKeyDown={(e) => e.key === "Enter" && handleRenameColumn(stage.id)}
                  style={{ flex: 1, fontSize: 13, minWidth: 0 }}
                />
              ) : (
                <div
                  className="label-tag truncate"
                  style={{ cursor: "pointer", flex: 1, minWidth: 0 }}
                  onClick={() => { setEditingStageId(stage.id); setEditingName(stage.name); }}
                  title="Clique para renomear"
                >
                  {stage.name} <span className="text-muted">({stage.cards?.length || 0})</span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <ColorPicker color={stage.color ?? null} onChange={(c) => handleStageColorChange(stage.id, c)} />
                <button
                  onClick={() => handleDeleteColumn(stage)}
                  title="Excluir coluna"
                  style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 15, padding: "0 2px", cursor: "pointer" }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 40, overflowY: "auto", paddingRight: 2 }}>
              {(stage.cards || []).map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => setDraggingLeadId(lead.id)}
                  onDragEnd={() => setDraggingLeadId(null)}
                  onClick={() => setSelected(lead)}
                  style={{
                    background: stage.color ? `${stage.color}22` : "var(--surface-2)",
                    border: `1px solid ${stage.color ? `${stage.color}55` : "var(--border)"}`,
                    borderRadius: 5, padding: "10px 12px", cursor: "grab",
                    opacity: draggingLeadId === lead.id ? 0.4 : 1,
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.4, minWidth: 0, wordBreak: "break-word" }}>
                      {lead.name}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <ScoreBadge score={lead.score} scoreClass={lead.score_class} />
                    </div>
                  </div>
                  <div className="mono text-muted" style={{ fontSize: 12 }}>
                    {formatPhoneDisplay(lead.phone_e164) || "—"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
                    <div>
                      {waLink(lead) && (
                        <a
                          href={waLink(lead)!} target="_blank" rel="noreferrer"
                          style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          <WhatsAppIcon size={13} /> WPP
                        </a>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="hover-tooltip">
                        <span style={{ fontSize: 13, cursor: "default", opacity: lead.notes ? 1 : 0.35 }}>📝</span>
                        <span className="tooltip-content">
                          {lead.notes ? lead.notes : "Sem anotações ainda."}
                        </span>
                      </span>
                      <button
                        onClick={() => handleQuickRemove(lead.id)}
                        title="Remover do CRM"
                        style={{
                          background: "none", border: "none", color: "var(--text-muted)",
                          fontSize: 14, lineHeight: 1, padding: 0, cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 6, flexShrink: 0, width: 220 }}>
          <input
            placeholder="➕ Nova coluna..."
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
            style={{ flex: 1, minWidth: 0 }}
          />
          <button className="btn" onClick={handleAddColumn}>+</button>
        </div>
      </div>

      {selected && (
        <LeadDrawer
          lead={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdatedLead}
          onRemoveFromCrm={() => handleRemoveFromCrm(selected.id)}
        />
      )}
    </div>
  );
}
