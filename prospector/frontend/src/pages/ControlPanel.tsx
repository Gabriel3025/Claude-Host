import { useEffect, useRef, useState } from "react";
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
  const [warning, setWarning] = useState<{ type: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [nicheDropdownOpen, setNicheDropdownOpen] = useState(false);
  const nicheRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (nicheRef.current && !nicheRef.current.contains(e.target as Node)) setNicheDropdownOpen(false);
    }
    if (nicheDropdownOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [nicheDropdownOpen]);

  const estimatedCost = (quantity * 0.004).toFixed(2);

  async function startSearch(confirmed = false) {
    setError(null);
    if (!niche.trim() || !state.trim()) {
      setError("Preencha nicho e estado.");
      return;
    }
    setLoading(true);
    try {
      const result = await api.createSearch({
        niche: niche.trim(), city: city.trim() || undefined, state: state.trim(),
        region: region.trim() || undefined, quantity, confirmed,
      });
      if (result.warning) {
        setWarning({ type: result.warning, message: result.message || "Confirmar busca?" });
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
      <div className="label-tag" style={{ textAlign: "center", marginBottom: 4, fontSize: 14 }}>
        🛰️ [ CONTROL_PANEL ]
      </div>
      <div className="text-muted" style={{ textAlign: "center", marginBottom: 20, fontSize: 12 }}>
        Configure a busca e encontre suas próximas oportunidades
      </div>
      <div className="card">
        <Field label="🏷️ Segmento / Nicho">
          <div ref={nicheRef} style={{ position: "relative" }}>
            <input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onFocus={() => setNicheDropdownOpen(true)}
              style={{ width: "100%" }}
              autoComplete="off"
              placeholder="Ex: Escritório de Advocacia"
            />
            {nicheDropdownOpen && (
              <div
                style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 6, boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                  maxHeight: 220, overflowY: "auto",
                }}
              >
                {NICHE_SUGGESTIONS
                  .filter((n) => n.toLowerCase().includes(niche.trim().toLowerCase()))
                  .map((n) => (
                    <div
                      key={n}
                      onClick={() => { setNiche(n); setNicheDropdownOpen(false); }}
                      style={{ padding: "9px 12px", cursor: "pointer", fontSize: 13 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {n}
                    </div>
                  ))}
                {NICHE_SUGGESTIONS.filter((n) => n.toLowerCase().includes(niche.trim().toLowerCase())).length === 0 && (
                  <div className="text-muted" style={{ padding: "9px 12px", fontSize: 12 }}>
                    Nenhuma sugestão — use o texto digitado livremente.
                  </div>
                )}
              </div>
            )}
          </div>
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Field label="📍 Estado (obrigatório)">
              <select value={state} onChange={(e) => setState(e.target.value)} style={{ width: "100%" }}>
                <option value="">UF</option>
                {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ flex: 2 }}>
            <Field label="🏙️ Cidade (opcional)">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ width: "100%" }}
                placeholder="Deixe em branco para buscar no estado todo"
              />
            </Field>
          </div>
        </div>

        <Field label="🎯 Região / Bairro (opcional)">
          <input value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: "100%" }} />
        </Field>

        <Field label="🔢 Quantidade de leads">
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
            💰 ~US$ {estimatedCost} (Apify)
          </div>
        </Field>

        {error && <div style={{ color: "var(--red)", marginBottom: 12, fontSize: 13 }}>⚠️ {error}</div>}

        <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} disabled={loading} onClick={() => startSearch()}>
          {loading ? "INICIANDO..." : "🚀 INICIAR BUSCA"}
        </button>
      </div>

      {warning?.type === "CONFIRM_LARGE_SEARCH" && (
        <ConfirmModal
          message={warning.message}
          onCancel={() => setWarning(null)}
          onConfirm={() => { setWarning(null); startSearch(true); }}
          confirmLabel="Confirmar"
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
