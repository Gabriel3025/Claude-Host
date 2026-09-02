import { siteStatusLabel } from "../utils";

const STYLE_BY_STATUS: Record<string, { bg: string; color: string; border: string }> = {
  NO_WEBSITE: { bg: "rgba(43,255,136,0.15)", color: "var(--green)", border: "rgba(43,255,136,0.45)" },
  ONLINE: { bg: "rgba(255,82,82,0.15)", color: "var(--red)", border: "rgba(255,82,82,0.45)" },
  OFFLINE: { bg: "rgba(255,180,84,0.15)", color: "var(--amber)", border: "rgba(255,180,84,0.45)" },
  TIMEOUT: { bg: "rgba(255,180,84,0.15)", color: "var(--amber)", border: "rgba(255,180,84,0.45)" },
  HTTP_ERROR: { bg: "rgba(255,180,84,0.15)", color: "var(--amber)", border: "rgba(255,180,84,0.45)" },
  DNS_ERROR: { bg: "rgba(255,180,84,0.15)", color: "var(--amber)", border: "rgba(255,180,84,0.45)" },
  SOCIAL_ONLY: { bg: "rgba(185,140,255,0.15)", color: "#B98CFF", border: "rgba(185,140,255,0.45)" },
};

const DEFAULT_STYLE = { bg: "var(--surface-2)", color: "var(--text-muted)", border: "var(--border)" };

export function SiteStatusBadge({ status }: { status: string }) {
  const s = STYLE_BY_STATUS[status] || DEFAULT_STYLE;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
      title={siteStatusLabel(status)}
    >
      {siteStatusLabel(status)}
    </span>
  );
}
