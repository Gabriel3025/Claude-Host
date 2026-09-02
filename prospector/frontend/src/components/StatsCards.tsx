import type { Stats } from "../types";

export function StatsCards({ stats }: { stats: Stats }) {
  const items = [
    { label: "LEADS COLETADOS", value: stats.collected, color: "var(--text)" },
    { label: "SCORE A", value: stats.score_a, color: "var(--green)" },
    { label: "SEM SITE", value: stats.no_website, color: "var(--amber)" },
    { label: "SITE FORA DO AR", value: stats.site_down, color: "var(--red)" },
    { label: "COM TELEFONE", value: stats.with_phone, color: "var(--cyan)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
      {items.map((item) => (
        <div key={item.label} className="card" style={{ padding: 16 }}>
          <div className="label-tag" style={{ marginBottom: 8 }}>{item.label}</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: item.color }}>
            {item.value ?? 0}
          </div>
        </div>
      ))}
    </div>
  );
}
