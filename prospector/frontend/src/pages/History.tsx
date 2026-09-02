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
  const [trash, setTrash] = useState<Search[]>([]);
  const [trashOpen, setTrashOpen] = useState(false);

  function loadMain() {
    api.listSearches(false).then(setSearches);
  }

  function loadTrash() {
    api.listSearches(true).then(setTrash);
  }

  useEffect(loadMain, []);
  useEffect(() => { if (trashOpen) loadTrash(); }, [trashOpen]);

  async function handleDelete(id: number) {
    await api.deleteSearch(id);
    setSearches((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleRestore(id: number) {
    await api.restoreSearch(id);
    setTrash((prev) => prev.filter((s) => s.id !== id));
    loadMain();
  }

  async function handlePermanentDelete(id: number) {
    if (!confirm("Excluir definitivamente esta busca? Essa ação não pode ser desfeita.")) return;
    await api.permanentlyDeleteSearch(id);
    setTrash((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="label-tag" style={{ fontSize: 14 }}>🕒 [ HISTORICO ]</div>
        <button
          className="btn"
          style={{ fontSize: 12, padding: "6px 12px", opacity: 0.7 }}
          onClick={() => setTrashOpen((v) => !v)}
        >
          🗑️ Lixo
        </button>
      </div>

      {searches.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          Nenhuma busca realizada ainda.
        </div>
      ) : (
        <SearchTable
          searches={searches}
          renderActions={(s) => (
            <div style={{ display: "flex", gap: 8 }}>
              {s.status === "DONE" && (
                <button className="btn" onClick={() => onOpenSearch(s.id)}>Ver leads</button>
              )}
              <button
                className="btn"
                title="Mover para o lixo"
                style={{ color: "var(--red)" }}
                onClick={() => handleDelete(s.id)}
              >
                🗑️
              </button>
            </div>
          )}
        />
      )}

      {trashOpen && (
        <div style={{ marginTop: 28 }}>
          <div className="label-tag" style={{ fontSize: 13, marginBottom: 12 }}>🗑️ LIXO</div>
          {trash.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
              Nenhuma busca no lixo.
            </div>
          ) : (
            <SearchTable
              searches={trash}
              renderActions={(s) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn" onClick={() => handleRestore(s.id)}>♻️ Restaurar</button>
                  <button
                    className="btn"
                    style={{ color: "var(--red)" }}
                    onClick={() => handlePermanentDelete(s.id)}
                  >
                    ❌ Excluir definitivamente
                  </button>
                </div>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

function SearchTable({
  searches, renderActions,
}: {
  searches: Search[];
  renderActions: (s: Search) => React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: 0, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
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
              <td style={{ padding: "12px 16px" }}>{renderActions(s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
