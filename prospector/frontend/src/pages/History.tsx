import { useEffect, useState } from "react";
import { api } from "../api";
import type { Search } from "../types";

interface Props {
  onOpenSearch: (searchId: number) => void;
}

const STATUS_LABELS: Record<string, string> = {
  DONE: "Concluída",
  RUNNING: "Em andamento",
  ERROR: "Erro",
  CANCELLED: "Cancelada",
};

export function History({ onOpenSearch }: Props) {
  const [searches, setSearches] = useState<Search[]>([]);

  useEffect(() => {
    api.listSearches().then(setSearches);
  }, []);

  return (
    <div>
      <div className="label-tag" style={{ marginBottom: 16, fontSize: 14 }}>🕒 [ HISTORICO ]</div>

      {searches.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          Nenhuma busca realizada ainda.
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["DATA", "NICHO", "CIDADE/UF", "LEADS", "CACHE", "CUSTO", "STATUS", ""].map((h) => (
                  <th key={h} className="label-tag" style={{ textAlign: "left", padding: "12px 16px", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {searches.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px" }} className="mono">{s.created_at?.slice(0, 10)}</td>
                  <td style={{ padding: "12px 16px" }}>{s.niche}</td>
                  <td style={{ padding: "12px 16px" }}>{s.city}/{s.state}</td>
                  <td style={{ padding: "12px 16px" }} className="mono">{s.results_count} / {s.requested_count}</td>
                  <td style={{ padding: "12px 16px" }} className="mono">{s.from_cache_count}</td>
                  <td style={{ padding: "12px 16px" }} className="mono">US$ {s.estimated_cost_usd?.toFixed(4)}</td>
                  <td style={{ padding: "12px 16px" }}>{STATUS_LABELS[s.status] || s.status}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {s.status === "DONE" && (
                      <button className="btn" onClick={() => onOpenSearch(s.id)}>Ver leads</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
