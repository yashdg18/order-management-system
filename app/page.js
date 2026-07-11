import Link from "next/link";

const STAGES = [
  { title: "Placed", desc: "A customer sends an order to the kitchen instantly.", color: "var(--amber)" },
  { title: "Preparing", desc: "The store marks it in progress — everyone sees it live.", color: "var(--amber-deep)" },
  { title: "Completed", desc: "Order closes out and rolls into the day's analytics.", color: "var(--pine)" },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="row gap-2">
          <div className="brand-mark">OMS</div>
          <span className="brand-name">Order Management System</span>
        </div>
        <nav className="row gap-2">
          <Link href="/login" className="btn" style={{ color: "rgba(250,247,242,0.8)" }}>
            Sign in
          </Link>
          <Link href="/register" className="btn btn-primary">
            Get started
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <span className="font-mono text-xs" style={{ color: "var(--amber-soft)", textTransform: "uppercase", letterSpacing: "0.2em" }}>
          Multi-store order management
        </span>
        <h1 className="landing-title">Every ticket, from every store, on one rail.</h1>
        <p className="landing-sub">
          Order Management System gives admins, store managers, and customers a live view of orders as they move
          from placed to preparing to completed — no refresh required.
        </p>
        <div className="row gap-2" style={{ marginTop: 32 }}>
          <Link href="/register" className="btn btn-primary">
            Create an account
          </Link>
          <Link href="/login" className="btn" style={{ border: "1px solid rgba(255,255,255,0.15)", color: "var(--paper)" }}>
            Sign in
          </Link>
        </div>

        <div className="grid-3" style={{ marginTop: 80 }}>
          {STAGES.map((stage, i) => (
            <div key={stage.title} className="landing-stage-card">
              <div className="row gap-1">
                <span className="dot" style={{ backgroundColor: stage.color }} />
                <span className="font-mono text-xs" style={{ color: "rgba(250,247,242,0.5)" }}>
                  0{i + 1}
                </span>
              </div>
              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 600, marginTop: 12 }}>
                {stage.title}
              </h3>
              <p className="text-sm" style={{ color: "rgba(250,247,242,0.6)", marginTop: 4 }}>
                {stage.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
