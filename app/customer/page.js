"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import { PageHeader } from "@/components/PageHeader";
import { LoadingBlock, EmptyState } from "@/components/States";

export default function CustomerStoresPage() {
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/stores", { limit: 24, search: search || undefined });
      setStores(data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Browse stores"
        description="Pick a store to see what's on the menu."
        action={
          <input
            placeholder="Search stores…"
            className="input"
            style={{ width: 220 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      />

      {loading ? (
        <LoadingBlock label="Loading stores…" />
      ) : !stores.length ? (
        <EmptyState title="No stores found" />
      ) : (
        <div className="grid-3">
          {stores.map((store) => (
            <Link key={store._id} href={`/customer/stores/${store._id}`} className="ticket-card">
              <h3 className="font-display" style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                {store.name}
              </h3>
              <p className="text-sm text-slate" style={{ marginTop: 4 }}>{store.address}</p>
              <span className="font-mono text-xs" style={{ color: "var(--amber-deep)", marginTop: 12, display: "inline-block" }}>
                View menu →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
