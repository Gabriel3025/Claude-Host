import { useEffect, useState } from "react";
import { api } from "../api";
import type { Lead, Stats } from "../types";
import { StatsCards } from "../components/StatsCards";
import { FilterBar } from "../components/FilterBar";
import type { Filters } from "../components/FilterBar";
import { LeadTable } from "../components/LeadTable";
import { LeadDrawer } from "../components/LeadDrawer";

interface Props {
  searchId: number | null;
}

const PAGE_SIZE = 50;
const EMPTY_STATS: Stats = { collected: 0, score_a: 0, score_b: 0, score_c: 0, no_website: 0, site_down: 0, with_phone: 0 };

export function Leads({ searchId }: Props) {
  const [filters, setFilters] = useState<Filters>({
    has_phone: false, has_whatsapp: false, sort: "score", order: "desc",
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setPage(1), [filters, searchId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.listLeads({
      search_id: searchId ?? undefined,
      score_class: filters.score_class,
      site_status: filters.site_status,
      has_phone: filters.has_phone || undefined,
      has_whatsapp: filters.has_whatsapp || undefined,
      city: filters.city,
      state: filters.state,
      crm_status: filters.crm_status,
      q: filters.q,
      sort: filters.sort,
      order: filters.order,
      page, page_size: PAGE_SIZE,
    }).then((res) => {
      if (cancelled) return;
      setLeads(res.items);
      setStats(res.stats);
      setTotal(res.total);
    }).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [filters, page, searchId]);

  function handleUpdated(updated: Lead) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelected(updated);
  }

  const exportParams = {
    search_id: searchId ?? undefined,
    score_class: filters.score_class,
    site_status: filters.site_status,
    has_phone: filters.has_phone || undefined,
    has_whatsapp: filters.has_whatsapp || undefined,
    city: filters.city,
    state: filters.state,
    crm_status: filters.crm_status,
    q: filters.q,
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="label-tag" style={{ marginBottom: 16, fontSize: 14 }}>[ LEADS_QUALIFICADOS ]</div>

      <StatsCards stats={stats} />
      <FilterBar filters={filters} onChange={setFilters} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="text-muted" style={{ fontSize: 13 }}>{total} lead(s)</div>
        <div style={{ display: "flex", gap: 10 }}>
          <a className="btn" href={api.exportUrl(exportParams, "csv")}>EXPORTAR CSV</a>
          <a className="btn" href={api.exportUrl(exportParams, "xlsx")}>EXPORTAR XLSX</a>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>Carregando...</div>
      ) : (
        <LeadTable leads={leads} onSelect={setSelected} />
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }}>
          <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
          <span className="mono" style={{ alignSelf: "center" }}>{page} / {totalPages}</span>
          <button className="btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Próxima</button>
        </div>
      )}

      {selected && (
        <LeadDrawer lead={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />
      )}
    </div>
  );
}
