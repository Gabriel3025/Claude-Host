import { useEffect, useState } from "react";
import { api } from "../api";
import { NICHE_PRESETS, UFS } from "../utils";

interface Props {
  onSearchStarted: (searchId: number) => void;
}

const QUICK_AMOUNTS = [25, 50, 100, 250, 500];
const CUSTOM_VALUE = "__custom__";

export function ControlPanel({ onSearchStarted }: Props) {
  const [nicheChoice, setNicheChoice] = useState(NICHE_PRESETS[0].name);
  const [customNiche, setCustomNiche] = useState("");
  const [customAbbr, setCustomAbbr] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [region, setRegion] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [noSiteOnly, setNoSiteOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<{ type: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [apifyUsage, setApifyUsage] = useState<{ usage_usd: number; limit_usd: number } | null>(null);

  const isCustom = nicheChoice === CUSTOM_VALUE;
  const selectedPreset = NICHE_PRESETS.find((p) => p.name === nicheChoice);
  const niche = isCustom ? customNiche : nicheChoice;
  const nicheAbbr = isCustom ? customAbbr : selectedPreset?.abbr || "";

  useEffect(() => {
    api.getApifyUsage().then((res) => {
      if (res.ok && res.usage_usd !== undefined && res.limit_usd !== undefined) {
        setApifyUsage({ usage_usd: res.usage_usd, limit_usd: res.limit_usd });
      }
    });
  }, []);

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
        niche: niche.trim(), niche_abbr: nicheAbbr.trim() || undefined,
        city: city.trim() || undefined, state: state.trim(),
        region: region.trim() || undefined, quantity, confirmed,
        no_site_only: noSiteOnly,
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
      <div className="text-muted" style={{ textAlign: "center", marginBottom: 4, fontSize: 12 }}>
        Configure a busca e encontre suas próximas oportunidades
      </div>
      {apifyUsage && (
        <div className="text-muted mono" style={{ textAlign: "center", marginBottom: 20, fontSize: 11, opacity: 0.6 }}>
          💰 Apify: US$ {apifyUsage.usage_usd.toFixed(2)} / {apifyUsage.limit_usd.toFixed(2)}
        </div>
      )}
      <div className="card">
        <Field label="🏷️ Segmento / Nicho">
          <select
            value={nicheChoice}
            onChange={(e) => setNicheChoice(e.target.value)}
            style={{ width: "100%" }}
          >
            {NICHE_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>{p.name} ({p.abbr})</option>
            ))}
            <option value={CUSTOM_VALUE}>➕ Personalizado...</option>
          </select>

          {isCustom && (
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <div style={{ flex: 3 }}>
                <input
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  placeholder="Nome do nicho (ex: Loja de Eletrônicos)"
                  style={{ width: "100%" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  value={customAbbr}
                  onChange={(e) => setCustomAbbr(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="Sigla"
                  className="mono"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          )}
          {isCustom && (
            <div className="text-muted" style={{ marginTop: 6, fontSize: 11 }}>
              Use sempre a mesma sigla para o mesmo nicho (ex: sempre "ADV" para advocacia) — isso mantém a coluna Nicho consistente na lista de leads.
            </div>
          )}
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

        <Field label="🌐 Possui site?">
          <select
            value={noSiteOnly ? "sem_site" : "tanto_faz"}
            onChange={(e) => setNoSiteOnly(e.target.value === "sem_site")}
            style={{ width: "100%" }}
          >
            <option value="tanto_faz">Tanto faz</option>
            <option value="sem_site">Sem site (sem site ou fora do ar)</option>
          </select>
          {noSiteOnly && (
            <div className="text-muted" style={{ marginTop: 6, fontSize: 12 }}>
              A busca vai priorizar empresas sem website ou com site fora do ar — pode levar um pouco mais de tempo e custar um pouco mais, já que descartamos quem já tem site funcionando.
            </div>
          )}
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
