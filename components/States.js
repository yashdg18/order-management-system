export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="avatar font-mono" style={{ backgroundColor: "var(--paper-dim)", color: "var(--slate)" }}>
        —
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }) {
  return (
    <div className="loading-block">
      <span className="spinner" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
