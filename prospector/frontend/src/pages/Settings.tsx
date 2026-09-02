import { useEffect, useState } from "react";
import { api } from "../api";
import type { Settings as SettingsType } from "../types";

export function Settings() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [token, setToken] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    api.getSettings().then(setSettings);
  }

  useEffect(load, []);

  async function handleSave() {
    if (!token.trim()) return;
    setSaving(true);
    try {
      await api.updateSettings(token.trim());
      setToken("");
      setTestResult(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTestResult("Testando...");
    const res = await api.testToken();
    setTestResult(res.ok ? `Conectado como "${res.username}"` : `Falha: ${res.message}`);
  }

  if (!settings) return <div>Carregando...</div>;

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="label-tag" style={{ marginBottom: 16, fontSize: 14 }}>[ CONFIGURACOES ]</div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="label-tag" style={{ marginBottom: 12 }}>PROVEDOR</div>
        <Row label="Provedor atual" value="Apify" />
        <Row label="Token configurado" value={settings.token_configured ? settings.token_masked : "Não configurado"} />

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <input
            placeholder="Cole o token da Apify aqui"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ flex: 1 }}
            type="password"
          />
          <button className="btn btn-primary" disabled={saving || !token.trim()} onClick={handleSave}>Salvar</button>
        </div>
        <div style={{ marginTop: 10 }}>
          <button className="btn" onClick={handleTest}>Testar conexão</button>
          {testResult && <span style={{ marginLeft: 12, fontSize: 13 }}>{testResult}</span>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="label-tag" style={{ marginBottom: 12 }}>CONTADORES</div>
        <Row label="Buscas realizadas" value={String(settings.total_searches)} />
        <Row label="Leads coletados" value={String(settings.total_leads_collected)} />
        <Row label="Chamadas de API" value={String(settings.total_api_calls)} />
        <Row label="Custo estimado acumulado" value={`US$ ${settings.total_estimated_cost_usd.toFixed(4)}`} />
      </div>

      <div className="card">
        <div className="label-tag" style={{ marginBottom: 12 }}>PARAMETROS</div>
        <Row label="Cache de leads" value={`${settings.cache_ttl_days} dias`} />
        <Row label="Concorrência de verificação de sites" value={`${settings.site_check_concurrency} simultâneas`} />
        <Row label="Confirmação obrigatória acima de" value={`${settings.max_leads_confirm_threshold} leads`} />
        <Row label="Custo por lead (Apify)" value={`US$ ${settings.cost_per_place_usd}`} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderBottom: "1px solid var(--border)" }}>
      <span className="text-muted">{label}</span>
      <span className="mono">{value}</span>
    </div>
  );
}
