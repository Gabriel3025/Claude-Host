import { UFS } from "../utils";

export interface Filters {
  score_class?: string;
  site_status?: string;
  has_phone: boolean;
  has_whatsapp: boolean;
  city?: string;
  state?: string;
  crm_status?: string;
  min_reviews?: number;
  q?: string;
  sort: string;
  order: string;
}

const CRM_STATUSES = [
  "NOVO", "LIGAR", "TENTATIVA 1", "TENTATIVA 2", "CONTATO REALIZADO",
  "INTERESSADO", "PROPOSTA", "CLIENTE", "SEM INTERESSE",
];

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function FilterBar({ filters, onChange }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="card" style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <input
        placeholder="Buscar empresa..."
        value={filters.q || ""}
        onChange={(e) => set({ q: e.target.value })}
        style={{ minWidth: 200 }}
      />

      <div style={{ display: "flex", gap: 6 }}>
        {["A", "B", "C"].map((c) => (
          <button
            key={c}
            className={`chip ${filters.score_class === c ? "active" : ""}`}
            onClick={() => set({ score_class: filters.score_class === c ? undefined : c })}
          >
            Score {c}
          </button>
        ))}
      </div>

      <select value={filters.site_status || ""} onChange={(e) => set({ site_status: e.target.value || undefined })}>
        <option value="">Status do site (todos)</option>
        <option value="sem_site">Sem site</option>
        <option value="fora_do_ar">Fora do ar</option>
        <option value="social_only">Só rede social</option>
        <option value="online">Online</option>
      </select>

      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
        <input type="checkbox" checked={filters.has_phone} onChange={(e) => set({ has_phone: e.target.checked })} />
        Com telefone
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
        <input type="checkbox" checked={filters.has_whatsapp} onChange={(e) => set({ has_whatsapp: e.target.checked })} />
        Com WhatsApp
      </label>

      <input
        placeholder="Cidade"
        value={filters.city || ""}
        onChange={(e) => set({ city: e.target.value })}
        style={{ width: 130 }}
      />
      <select value={filters.state || ""} onChange={(e) => set({ state: e.target.value || undefined })}>
        <option value="">UF</option>
        {UFS.map((uf) => (
          <option key={uf} value={uf}>{uf}</option>
        ))}
      </select>

      <select value={filters.crm_status || ""} onChange={(e) => set({ crm_status: e.target.value || undefined })}>
        <option value="">Status comercial (todos)</option>
        {CRM_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={`${filters.sort}:${filters.order}`}
        onChange={(e) => {
          const [sort, order] = e.target.value.split(":");
          set({ sort, order });
        }}
      >
        <option value="score:desc">Maior score</option>
        <option value="score:asc">Menor score</option>
        <option value="reviews:desc">Mais avaliações</option>
        <option value="reviews:asc">Menos avaliações</option>
        <option value="name:asc">Empresa A-Z</option>
        <option value="created:desc">Data de coleta</option>
      </select>
    </div>
  );
}
