interface Props {
  score: number;
  scoreClass: string | null;
}

const LABELS: Record<string, string> = {
  A: "ALTA OPORTUNIDADE",
  B: "BOA OPORTUNIDADE",
  C: "BAIXA PRIORIDADE",
};

export function ScoreBadge({ score, scoreClass, showLabel = false }: Props & { showLabel?: boolean }) {
  const cls = scoreClass || "C";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
      <span className={`badge badge-${cls}`}>{cls} {score}</span>
      {showLabel && <span className="text-muted" style={{ fontSize: 12 }}>{LABELS[cls]}</span>}
    </span>
  );
}
