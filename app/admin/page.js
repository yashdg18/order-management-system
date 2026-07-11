"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { PageHeader, StatCard } from "@/components/PageHeader";
import { LoadingBlock } from "@/components/States";
import StatusBadge from "@/components/StatusBadge";
import { useOrderSocket } from "@/hooks/useOrderSocket";

export default function AdminOverviewPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/analytics/summary");
      setSummary(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useOrderSocket({ onNewOrder: load, onStatusUpdated: load });

  return (
    <div>
      <PageHeader title="Overview" description="A live snapshot across every store." />

      {loading ? (
        <LoadingBlock label="Loading summary…" />
      ) : (
        <>
          <div className="grid-3">
            <StatCard label="Total orders" value={String(summary?.totalOrders ?? 0)} />
            <StatCard
              label="Total revenue"
              value={`₹${(summary?.totalRevenue ?? 0).toLocaleString("en-IN")}`}
              accent="pine"
            />
            <StatCard label="Active statuses" value={String(summary?.statusBreakdown.length ?? 0)} accent="amber" />
          </div>

          <div className="card" style={{ marginTop: 24 }}>
            <h2 className="font-display" style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>
              Status breakdown
            </h2>
            <div className="stack gap-2">
              {summary?.statusBreakdown.map((s) => (
                <div key={s.status} className="row-between">
                  <StatusBadge status={s.status} />
                  <span className="font-mono text-sm">{s.count}</span>
                </div>
              ))}
              {!summary?.statusBreakdown.length && <p className="text-sm text-slate">No orders yet.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
