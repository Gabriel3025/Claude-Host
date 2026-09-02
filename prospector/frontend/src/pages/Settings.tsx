import { useEffect, useState } from "react";
import { api } from "../api";
import type { Settings as SettingsType } from "../types";

interface ApifyUsage {
  ok: boolean; message?: string; usage_usd?: number; limit_usd?: number;
  actor_memory_gbytes?: number; max_actor_memory_gbytes?: number; cycle_end_at?: string;
}

interface BackupInfo {
  filename: string;
  size_bytes: number;
  modified_at: string;
}

export function Settings() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [token, setToken] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [usage, setUsage] = useState<ApifyUsage | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [backingUp, setBackingUp] = useState(false);

  function load() {
    api.getSettings().then(setSettings);
    loadUsage();
    loadBackups();
  }

  function loadBackups() {
    api.listBackups().then(setBackups);
  }

  async function handleBackupNow() {
    setBackingUp(true);
    try {
      await api.createBackup();
      loadBackups();
    } finally {
      setBackingUp(false);
    }
  }

  function loadUsage() {
    setUsageLoading(true);
    api.getApifyUsage().then(setUsage).finally(() => setUsageLoading(false));
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
      <div className="label-tag" style={{ marginBottom: 16, fontSize: 14 }}>⚙️ [ CONFIGURACOES ]</div>

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="label-tag">📡 USO NA APIFY (AO VIVO)</div>
          <button className="btn" style={{ padding: "4px 10px", fontSize: 12 }} onClick={loadUsage} disabled={usageLoading}>
            {usageLoading ? "Atualizando..." : "🔄 Atualizar"}
          </button>
        </div>

        {!usage || usageLoading ? (
          <div className="text-muted" style={{ fontSize: 13 }}>Carregando dados da Apify...</div>
        ) : !usage.ok ? (
          <div className="text-muted" style={{ fontSize: 13 }}>
            {usage.message || "Não foi possível consultar a Apify agora."}
          </div>
        ) : (
          <>
            <UsageBar
              label="💰 Uso mensal"
              current={usage.usage_usd ?? 0}
              max={usage.limit_usd ?? 0}
              format={(v) => `US$ ${v.toFixed(2)}`}
            />
            <UsageBar
              label="🧠 Memória de Actors em uso"
              current={usage.actor_memory_gbytes ?? 0}
              max={usage.max_actor_memory_gbytes ?? 0}
              format={(v) => `${v.toFixed(0)} GB`}
            />
            {usage.cycle_end_at && (
              <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
                Ciclo atual encerra em {usage.cycle_end_at.slice(0, 10)}
              </div>
            )}
          </>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="label-tag">🛡️ BACKUP E SEGURANÇA</div>
          <button className="btn btn-primary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={handleBackupNow} disabled={backingUp}>
            {backingUp ? "Salvando..." : "💾 Fazer backup agora"}
          </button>
        </div>
        <div className="text-muted" style={{ fontSize: 12, marginBottom: 10 }}>
          Uma cópia do banco de dados é salva automaticamente toda vez que o PROSPECTOR inicia, guardando as últimas 30 versões. Nenhum dado de leads ou do CRM é modificado por alterações no sistema sem antes existir um backup.
        </div>
        {backups.length > 0 && (
          <div style={{ maxHeight: 160, overflowY: "auto" }}>
            {backups.slice(0, 8).map((b) => (
              <div key={b.filename} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 11 }} className="mono text-muted">
                <span>{b.filename}</span>
                <span>{(b.size_bytes / 1024).toFixed(0)} KB</span>
              </div>
            ))}
          </div>
        )}
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

function UsageBar({
  label, current, max, format,
}: { label: string; current: number; max: number; format: (v: number) => string }) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  const color = pct > 90 ? "var(--red)" : pct > 70 ? "var(--amber)" : "var(--green)";
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
        <span className="text-muted">{label}</span>
        <span className="mono">{format(current)} / {format(max)}</span>
      </div>
      <div style={{ background: "var(--surface-2)", height: 6, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ background: color, height: "100%", width: `${pct}%`, transition: "width 0.3s" }} />
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
