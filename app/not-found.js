import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, textAlign: "center" }}>
      <span className="font-mono text-xs" style={{ color: "var(--amber-deep)", textTransform: "uppercase", letterSpacing: "0.2em" }}>
        Error 404
      </span>
      <h1 className="page-title" style={{ fontSize: 30, marginTop: 12 }}>This ticket doesn&apos;t exist</h1>
      <p className="page-description" style={{ maxWidth: 360 }}>
        The page you're looking for may have been moved or never existed.
      </p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: 24 }}>
        Back to home
      </Link>
    </div>
  );
}
