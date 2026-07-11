"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name || form.name.trim().length < 2) next.name = "Name must be at least 2 characters";
    if (!form.email) next.email = "Email is required";
    if (!form.password || form.password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(form);
    } catch (err) {
      showToast(err.message || "Could not create account", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="brand-mark" style={{ margin: "0 auto 12px" }}>
            OMS
          </div>
          <h1 className="page-title">Create your account</h1>
          <p className="page-description">Order from stores or manage one of your own.</p>
        </div>

        <form onSubmit={onSubmit} className="card">
          <div className="field">
            <label>Full name</label>
            <input
              className="input"
              placeholder="Jordan Lee"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@store.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              className="input"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="field">
            <label>I am a</label>
            <select className="input" value={form.role} onChange={(e) => update("role", e.target.value)}>
              <option value="customer">Customer — I want to place orders</option>
              <option value="store_manager">Store manager — I run a store</option>
            </select>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-slate" style={{ textAlign: "center", marginTop: 16 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--amber-deep)", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
