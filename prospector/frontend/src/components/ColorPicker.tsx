import { useEffect, useRef, useState } from "react";

const PRESETS = [
  "#FF5252", "#FFB454", "#FFE45E", "#2BFF88", "#1FD1A8",
  "#00E5FF", "#5C9DFF", "#B98CFF", "#FF7CD8", "#B0B8BA",
];

interface Props {
  color: string | null;
  onChange: (color: string | null) => void;
}

export function ColorPicker({ color, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        title="Cor do card"
        style={{
          width: 16, height: 16, borderRadius: "50%", padding: 0, cursor: "pointer",
          background: color || "transparent",
          border: color ? "1px solid rgba(255,255,255,0.3)" : "1px dashed var(--text-muted)",
          flexShrink: 0,
        }}
      />
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", top: 22, right: 0, zIndex: 50,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 6, padding: 10, width: 168,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 10 }}>
            {PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => { onChange(c); setOpen(false); }}
                title={c}
                style={{
                  width: 22, height: 22, borderRadius: "50%", padding: 0, cursor: "pointer",
                  background: c,
                  border: color === c ? "2px solid #fff" : "1px solid rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <input
              type="color"
              value={color || "#2BFF88"}
              onChange={(e) => onChange(e.target.value)}
              style={{ width: 28, height: 28, padding: 0, border: "none", background: "none", cursor: "pointer" }}
              title="Cor personalizada (RGB)"
            />
            <span className="text-muted mono" style={{ fontSize: 11 }}>RGB personalizado</span>
          </div>
          <button
            className="btn"
            style={{ width: "100%", padding: "4px 0", fontSize: 12 }}
            onClick={() => { onChange(null); setOpen(false); }}
          >
            Remover cor
          </button>
        </div>
      )}
    </div>
  );
}
