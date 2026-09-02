import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import type { Search } from "../types";

const PHASES = [
  "BUSCANDO EMPRESAS",
  "COLETANDO INFORMACOES",
  "VALIDANDO SITES",
  "CALCULANDO SCORE",
  "FINALIZANDO",
];

interface Props {
  searchId: number;
  onDone: () => void;
  onError: (message: string) => void;
}

export function Processing({ searchId, onDone, onError }: Props) {
  const [search, setSearch] = useState<Search | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    async function poll() {
      try {
        const data = await api.getSearch(searchId);
        setSearch(data);
        if (data.status === "DONE") {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          setTimeout(onDone, 400);
        } else if (data.status === "ERROR") {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          onError(data.error || "Erro desconhecido na busca.");
        } else if (data.status === "CANCELLED") {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          onDone();
        }
      } catch (e: any) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        onError(e.message);
      }
    }
    poll();
    intervalRef.current = window.setInterval(poll, 1500);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [searchId]);

  const progress = search?.progress;
  const phaseIndex = progress?.phase_index ?? 0;
  const total = progress?.total || search?.requested_count || 0;
  const pct = total > 0 ? Math.min(100, Math.round(((progress?.analyzed || 0) / total) * 100)) : 0;

  async function handleCancel() {
    await api.cancelSearch(searchId);
  }

  return (
    <div style={{ maxWidth: 560, margin: "60px auto", textAlign: "center" }}>
      <div className="mono" style={{ color: "var(--cyan)", fontSize: 22, marginBottom: 24 }}>
        PROCESSANDO<span className="blink">...</span>
      </div>

      <div className="mono" style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
        {progress?.found ?? 0} / {total} leads encontrados
      </div>
      <div className="text-muted mono" style={{ marginBottom: 32 }}>
        {progress?.analyzed ?? 0} analisados
      </div>

      <div style={{ background: "var(--surface-2)", height: 6, borderRadius: 3, marginBottom: 32, overflow: "hidden" }}>
        <div style={{ background: "var(--green)", height: "100%", width: `${pct}%`, transition: "width 0.3s" }} />
      </div>

      <div style={{ textAlign: "left", display: "inline-block" }}>
        {PHASES.map((phase, i) => (
          <div key={phase} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
            <span style={{
              width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 11, fontFamily: "var(--font-mono)",
              background: i < phaseIndex ? "var(--green)" : i === phaseIndex ? "transparent" : "var(--surface-2)",
              color: i < phaseIndex ? "#06120B" : i === phaseIndex ? "var(--cyan)" : "var(--text-muted)",
              border: i === phaseIndex ? "2px solid var(--cyan)" : "1px solid var(--border)",
            }}>
              {i < phaseIndex ? "✓" : ""}
            </span>
            <span className="mono" style={{
              color: i < phaseIndex ? "var(--green)" : i === phaseIndex ? "var(--cyan)" : "var(--text-muted)",
              fontSize: 13,
            }}>
              {phase}
            </span>
          </div>
        ))}
      </div>

      {progress && progress.errors_count > 0 && (
        <div className="text-muted" style={{ marginTop: 16, fontSize: 12 }}>
          {progress.errors_count} erro(s) individual(is) — processamento continua normalmente.
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <button className="btn" onClick={handleCancel}>Cancelar busca</button>
      </div>
    </div>
  );
}
