export function PageHeader({ title, description, action }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, accent }) {
  const accentClass = accent ? `accent-${accent}` : "";
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className={`stat-value ${accentClass}`}>{value}</p>
    </div>
  );
}
