import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import type { DashboardData, FunnelLeadRow } from "../types";
import { formatPhoneDisplay } from "../utils";

type PeriodPreset = "today" | "7d" | "30d" | "month" | "all" | "custom";

const PRESETS: { key: PeriodPreset; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "month", label: "Este mês" },
  { key: "all", label: "Tudo" },
  { key: "custom", label: "Personalizado" },
];

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function rangeForPreset(preset: PeriodPreset): { start: string; end: string } {
  const today = new Date();
  const end = toIso(today);
  if (preset === "today") return { start: end, end };
  if (preset === "7d") {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return { start: toIso(d), end };
  }
  if (preset === "30d") {
    const d = new Date(today);
    d.setDate(d.getDate() - 29);
    return { start: toIso(d), end };
  }
  if (preset === "month") {
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: toIso(d), end };
  }
  return { start: "2000-01-01", end };
}

export function Dashboard() {
  const [preset, setPreset] = useState<PeriodPreset>("today");
  const [customStart, setCustomStart] = useState(toIso(new Date()));
  const [customEnd, setCustomEnd] = useState(toIso(new Date()));
  const [niche, setNiche] = useState<string>("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [stageMode, setStageMode] = useState<"reached" | "current">("reached");
  const [stageLeads, setStageLeads] = useState<FunnelLeadRow[]>([]);
  const [stageLeadsLoading, setStageLeadsLoading] = useState(false);

  const { start, end } = useMemo(
    () => (preset === "custom" ? { start: customStart, end: customEnd } : rangeForPreset(preset)),
    [preset, customStart, customEnd]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getDashboard({ start, end, niche: niche || undefined }).then((res) => {
      if (!cancelled) setData(res);
    }).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [start, end, niche]);

  useEffect(() => {
    setSelectedStage(null);
    setStageLeads([]);
  }, [start, end, niche]);

  function handleStageClick(stageId: number) {
    if (selectedStage === stageId) {
      setSelectedStage(null);
      setStageLeads([]);
      return;
    }
    setSelectedStage(stageId);
    setStageLeadsLoading(true);
    api.getFunnelLeads({ stage_id: stageId, start, end, niche: niche || undefined, mode: stageMode })
      .then(setStageLeads)
      .finally(() => setStageLeadsLoading(false));
  }

  useEffect(() => {
    if (selectedStage == null) return;
    setStageLeadsLoading(true);
    api.getFunnelLeads({ stage_id: selectedStage, start, end, niche: niche || undefined, mode: stageMode })
      .then(setStageLeads)
      .finally(() => setStageLeadsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageMode]);

  if (loading && !data) {
    return <div className="card" style={{ textAlign: "center", padding: 40 }}>Carregando...</div>;
  }
  if (!data) return null;

  const maxFunnelValue = Math.max(1, ...data.funnel.map((f) => f.ever_reached));
  const scoreTotal = Math.max(1, data.score_distribution.A + data.score_distribution.B + data.score_distribution.C);
  const maxActivity = Math.max(1, ...data.daily_activity.map((d) => d.n));

  return (
    <div>
      <div className="label-tag" style={{ marginBottom: 16, fontSize: 14 }}>📊 [ DASHBOARD ]</div>

      <div className="card" style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PRESETS.map((p) => (
            <button
              key={p.key}
              className={`chip ${preset === p.key ? "active" : ""}`}
              onClick={() => setPreset(p.key)}
              style={{ cursor: "pointer" }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            <span className="text-muted">até</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </div>
        )}

        {data.niches.length > 0 && (
          <select value={niche} onChange={(e) => setNiche(e.target.value)}>
            <option value="">Todos os nichos</option>
            {data.niches.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        )}

        <div className="text-muted mono" style={{ fontSize: 12, marginLeft: "auto" }}>
          {data.period.start} → {data.period.end}
        </div>
      </div>

      <StatTiles data={data} />

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div className="label-tag">🔻 FUNIL DO CRM</div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {data.stat_tiles.leads_no_crm_no_periodo} lead(s) entraram em "A FAZER" no período
          </div>
        </div>
        <div className="text-muted" style={{ fontSize: 12, marginBottom: 16 }}>
          Clique numa etapa para ver os leads. Barra = quantos leads do período já passaram por ali (mesmo que tenham avançado depois).
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.funnel.map((stage) => {
            const widthPct = Math.max(3, (stage.ever_reached / maxFunnelValue) * 100);
            const color = stage.color || "var(--cyan)";
            const isSelected = selectedStage === stage.stage_id;
            return (
              <div
                key={stage.stage_id}
                onClick={() => handleStageClick(stage.stage_id)}
                style={{
                  cursor: "pointer", borderRadius: 6, padding: "8px 10px",
                  border: `1px solid ${isSelected ? "var(--cyan)" : "var(--border)"}`,
                  background: isSelected ? "rgba(0,229,255,0.05)" : "transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span>{stage.name}</span>
                  <span className="mono text-muted">
                    {stage.ever_reached} passaram · {stage.current} agora · {stage.pct_of_cohort}%
                  </span>
                </div>
                <div style={{ background: "var(--surface-2)", borderRadius: 4, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${widthPct}%`, height: "100%", background: color, transition: "width 0.2s" }} />
                </div>
              </div>
            );
          })}
          {data.removed_from_crm > 0 && (
            <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
              {data.removed_from_crm} lead(s) do período foram removidos do CRM.
            </div>
          )}
        </div>

        {selectedStage != null && (
          <div style={{ marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div className="label-tag">
                {data.funnel.find((f) => f.stage_id === selectedStage)?.name}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className={`chip ${stageMode === "reached" ? "active" : ""}`}
                  onClick={() => setStageMode("reached")}
                >
                  Já passaram
                </button>
                <button
                  className={`chip ${stageMode === "current" ? "active" : ""}`}
                  onClick={() => setStageMode("current")}
                >
                  Estão aqui agora
                </button>
              </div>
            </div>

            {stageLeadsLoading ? (
              <div className="text-muted" style={{ fontSize: 13 }}>Carregando...</div>
            ) : stageLeads.length === 0 ? (
              <div className="text-muted" style={{ fontSize: 13 }}>Nenhum lead nesta etapa para o período selecionado.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
                {stageLeads.map((l) => (
                  <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                    <span className="truncate" style={{ maxWidth: "60%" }}>{l.name}</span>
                    <span className="text-muted mono" style={{ fontSize: 12 }}>
                      {formatPhoneDisplay(l.phone_e164) || "—"} · {l.city || "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div className="card">
          <div className="label-tag" style={{ marginBottom: 14 }}>🎯 QUALIDADE DOS LEADS NO CRM (SCORE)</div>
          {(["A", "B", "C"] as const).map((cls) => {
            const value = data.score_distribution[cls];
            const pct = Math.round((value / scoreTotal) * 100);
            const color = cls === "A" ? "var(--green)" : cls === "B" ? "var(--cyan)" : "var(--red)";
            return (
              <div key={cls} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>Score {cls}</span>
                  <span className="mono text-muted">{value} ({pct}%)</span>
                </div>
                <div style={{ background: "var(--surface-2)", borderRadius: 4, height: 8, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="label-tag" style={{ marginBottom: 14 }}>📈 ATIVIDADE NO CRM (MOVIMENTOS/DIA)</div>
          {data.daily_activity.length === 0 ? (
            <div className="text-muted" style={{ fontSize: 13 }}>Sem atividade registrada no período.</div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90, overflowX: "auto" }}>
              {data.daily_activity.map((d) => (
                <div key={d.d} className="hover-tooltip" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", minWidth: 14 }}>
                  <div
                    style={{
                      width: 10, background: "var(--green)", borderRadius: 2,
                      height: `${Math.max(4, (d.n / maxActivity) * 100)}%`,
                    }}
                  />
                  <span className="tooltip-content">{d.d}: {d.n} movimento(s)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatTiles({ data }: { data: DashboardData }) {
  const tiles = [
    { label: "LEADS ADICIONADOS (A FAZER)", value: data.stat_tiles.leads_no_crm_no_periodo, color: "var(--text)" },
    { label: "LEADS COLETADOS", value: data.stat_tiles.leads_coletados_no_periodo, color: "var(--text-muted)" },
    { label: "REUNIÕES AGENDADAS", value: data.stat_tiles.reunioes_agendadas, color: "var(--cyan)" },
    { label: "TAXA DE AGENDAMENTO", value: `${data.stat_tiles.taxa_agendamento_pct}%`, color: "var(--cyan)" },
    { label: "FECHADOS", value: data.stat_tiles.fechados, color: "var(--green)" },
    { label: "TAXA DE FECHAMENTO", value: `${data.stat_tiles.taxa_fechamento_pct}%`, color: "var(--green)" },
    { label: "PERDIDOS", value: data.stat_tiles.perdidos, color: "var(--red)" },
    { label: "EM ABERTO", value: data.stat_tiles.em_aberto, color: "var(--amber)" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
      {tiles.map((t) => (
        <div key={t.label} className="card" style={{ padding: 16 }}>
          <div className="label-tag" style={{ marginBottom: 8, fontSize: 11 }}>{t.label}</div>
          <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: t.color }}>{t.value}</div>
        </div>
      ))}
    </div>
  );
}
