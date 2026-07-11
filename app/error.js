"use client";

export default function Error({ reset }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, textAlign: "center" }}>
      <span className="font-mono text-xs" style={{ color: "var(--rust)", textTransform: "uppercase", letterSpacing: "0.2em" }}>
        Something broke
      </span>
      <h1 className="page-title" style={{ fontSize: 30, marginTop: 12 }}>We dropped the ticket</h1>
      <p className="page-description" style={{ maxWidth: 360 }}>
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <button onClick={reset} className="btn btn-primary" style={{ marginTop: 24 }}>
        Try again
      </button>
    </div>
  );
}
