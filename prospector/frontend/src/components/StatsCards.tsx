import type { Stats } from "../types";

export type StatFilterKey = "score_a" | "no_website" | "site_down" | "with_phone" | null;

interface Props {
  stats: Stats;
  activeFilter?: StatFilterKey;
  onFilterClick?: (key: StatFilterKey) => void;
}

export function StatsCards({ stats, activeFilter, onFilterClick }: Props) {
  const items: { key: StatFilterKey; emoji: string; label: string; value: number; color: string }[] = [
    { key: null, emoji: "📋", label: "LEADS COLETADOS", value: stats.collected, color: "var(--text)" },
    { key: "score_a", emoji: "🔥", label: "SCORE A", value: stats.score_a, color: "var(--green)" },
    { key: "no_website", emoji: "🚫", label: "SEM SITE", value: stats.no_website, color: "var(--amber)" },
    { key: "site_down", emoji: "⚠️", label: "SITE FORA DO AR", value: stats.site_down, color: "var(--red)" },
    { key: "with_phone", emoji: "📞", label: "COM TELEFONE", value: stats.with_phone, color: "var(--cyan)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
      {items.map((item) => {
        const clickable = !!onFilterClick && item.key !== null;
        const isActive = activeFilter === item.key && item.key !== null;
        return (
          <div
            key={item.label}
            className={`card stat-card ${isActive ? "active" : ""}`}
            style={{ padding: 16, cursor: clickable ? "pointer" : "default" }}
            onClick={() => clickable && onFilterClick?.(isActive ? null : item.key)}
            title={clickable ? "Clique para filtrar a lista" : undefined}
          >
            <div className="label-tag" style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>{item.emoji}</span> {item.label}
            </div>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: item.color }}>
              {item.value ?? 0}
            </div>
          </div>
        );
      })}
    </div>
  );
}
