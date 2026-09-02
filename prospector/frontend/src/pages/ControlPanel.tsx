import { useState } from "react";
import { api } from "../api";
import { NICHE_SUGGESTIONS, UFS } from "../utils";

interface Props {
  onSearchStarted: (searchId: number) => void;
}

const QUICK_AMOUNTS = [25, 50, 100, 250, 500];

export function ControlPanel({ onSearchStarted }: Props) {
  const [niche, setNiche] = useState("Escritório de Advocacia");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [region, setRegion] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<{ type: string; message: string; existingId?: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const estimatedCost = (quantity * 0.004).toFixed(2);

  async function startSearch(confirmed = false, reuse = true) {
    setError(null);
    if (!niche.trim() || !city.trim() || !state.trim()) {
      setError("Preencha nicho, cidade e estado.");
      return;
    }
    setLoading(true);
    try {
      const result = await api.createSearch({
        niche: niche.trim(), city: city.trim(), state: state.trim(),
        region: region.trim() || undefined, quantity, confirmed, reuse,
      });
      if (result.warning) {
        setWarning({
          type: result.warning,
          message: result.message || "Confirmar busca?",
          existingId: result.existing_search_id,
        });
        setLoading(false);
        return;
      }
      if (result.search_id) {
        onSearchStarted(result.search_id);
      }
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto" }}>
      <div className="label-tag" style={{ textAlign: "center", marginBottom: 8, fontSize: 14 }}>
        [ CONTROL_PANEL ]
      </div>
      <div className="card">
        <Field label="Segmento / Nicho">
          <input
            list="niche-suggestions"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            style={{ width: "100%" }}
          />
          <datalist id="niche-suggestions">
            {NICHE_SUGGESTIONS.map((n) => <option key={n} value={n} />)}
          </datalist>
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 2 }}>
            <Field label="Cidade">
              <input value={city} onChange={(e) => setCity(e.target.value)} style={{ width: "100%" }} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Estado">
              <select value={state} onChange={(e) => setState(e.target.value)} style={{ width: "100%" }}>
                <option value="">UF</option>
                {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <Field label="Região / Bairro (opcional)">
          <input value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: "100%" }} />
        </Field>

        <Field label="Quantidade de leads">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="range" min={1} max={1000} value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <input
              type="number" min={1} max={1000} value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ width: 80 }} className="mono"
            />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {QUICK_AMOUNTS.map((n) => (
              <button key={n} className={`chip ${quantity === n ? "active" : ""}`} onClick={() => setQuantity(n)}>
                {n}
              </button>
            ))}
          </div>
          <div className="text-muted mono" style={{ marginTop: 8, fontSize: 12 }}>
            ~US$ {estimatedCost} (Apify)
          </div>
        </Field>

        {error && <div style={{ color: "var(--red)", marginBottom: 12, fontSize: 13 }}>{error}</div>}

        <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} disabled={loading} onClick={() => startSearch()}>
          {loading ? "INICIANDO..." : "INICIAR BUSCA"}
        </button>
      </div>

      {warning?.type === "CONFIRM_LARGE_SEARCH" && (
        <ConfirmModal
          message={warning.message}
          onCancel={() => setWarning(null)}
          onConfirm={() => { setWarning(null); startSearch(true, true); }}
          confirmLabel="Confirmar"
        />
      )}

      {warning?.type === "RECENT_SEARCH_EXISTS" && (
        <ConfirmModal
          message={warning.message}
          onCancel={() => setWarning(null)}
          onConfirm={() => { setWarning(null); startSearch(true, false); }}
          confirmLabel="Buscar novamente"
          secondaryLabel="Ver resultados salvos"
          onSecondary={() => warning.existingId && onSearchStarted(warning.existingId)}
        />
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--text-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

function ConfirmModal({
  message, onConfirm, onCancel, confirmLabel, secondaryLabel, onSecondary,
}: {
  message: string; onConfirm: () => void; onCancel: () => void;
  confirmLabel: string; secondaryLabel?: string; onSecondary?: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div className="card" style={{ maxWidth: 420 }}>
        <p style={{ marginTop: 0 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button className="btn" onClick={onCancel}>Cancelar</button>
          {secondaryLabel && onSecondary && (
            <button className="btn btn-secondary" onClick={onSecondary}>{secondaryLabel}</button>
          )}
          <button className="btn btn-primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
