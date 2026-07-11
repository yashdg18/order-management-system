"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { useToast } from "@/contexts/ToastContext";
import { PageHeader } from "@/components/PageHeader";
import { LoadingBlock, EmptyState } from "@/components/States";

function BarList({ items, labelKey, valueKey, formatValue, colorClass = "" }) {
  const max = Math.max(...items.map((i) => i[valueKey]), 1);
  return (
    <div className="bar-chart">
      {items.map((item, i) => (
        <div className="bar-row" key={i}>
          <span className="text-xs text-slate" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item[labelKey]}
          </span>
          <div className="bar-track">
            <div
              className={`bar-fill ${colorClass}`}
              style={{ width: `${(item[valueKey] / max) * 100}%` }}
            />
          </div>
          <span className="font-mono text-xs" style={{ textAlign: "right" }}>
            {formatValue ? formatValue(item[valueKey]) : item[valueKey]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { showToast } = useToast();
  const [ordersPerDay, setOrdersPerDay] = useState(null);
  const [revenuePerStore, setRevenuePerStore] = useState(null);
  const [topItems, setTopItems] = useState(null);
  const [archiving, setArchiving] = useState(false);

  const load = useCallback(async () => {
    const [opd, rps, tsi] = await Promise.all([
      api.get("/analytics/orders-per-day", { days: 30 }),
      api.get("/analytics/revenue-per-store"),
      api.get("/analytics/top-selling-items", { limit: 10 }),
    ]);
    setOrdersPerDay(opd.data);
    setRevenuePerStore(rps.data);
    setTopItems(tsi.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleArchive() {
    setArchiving(true);
    try {
      const { data } = await api.post("/archive-old-orders", {});
      showToast(`Archived ${data.archivedCount} order(s)`, "success");
      load();
    } catch (err) {
      showToast(err.message || "Archival failed", "error");
    } finally {
      setArchiving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Aggregated performance across all stores."
        action={
          <button onClick={handleArchive} disabled={archiving} className="btn btn-outline">
            {archiving ? "Archiving…" : "Archive orders older than 30 days"}
          </button>
        }
      />

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="font-display" style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>
          Orders per day (last 30 days)
        </h2>
        {!ordersPerDay ? (
          <LoadingBlock />
        ) : !ordersPerDay.length ? (
          <EmptyState title="No order history yet" />
        ) : (
          <BarList items={ordersPerDay} labelKey="date" valueKey="orderCount" />
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="font-display" style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>
            Revenue per store
          </h2>
          {!revenuePerStore ? (
            <LoadingBlock />
          ) : !revenuePerStore.length ? (
            <EmptyState title="No revenue yet" />
          ) : (
            <BarList
              items={revenuePerStore}
              labelKey="storeName"
              valueKey="totalRevenue"
              formatValue={(v) => `₹${v.toLocaleString("en-IN")}`}
              colorClass="pine"
            />
          )}
        </div>

        <div className="card">
          <h2 className="font-display" style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>
            Top selling items
          </h2>
          {!topItems ? (
            <LoadingBlock />
          ) : !topItems.length ? (
            <EmptyState title="No sales yet" />
          ) : (
            <div className="stack gap-2">
              {topItems.map((item, i) => (
                <div key={item.productId} className="row-between" style={{ border: "1px solid var(--paper-line)", borderRadius: 8, padding: "8px 12px" }}>
                  <span className="row gap-1 text-sm">
                    <span className="font-mono text-xs text-slate">{String(i + 1).padStart(2, "0")}</span>
                    {item.name}
                  </span>
                  <span className="font-mono text-xs text-slate">
                    {item.totalQuantitySold} sold · ₹{item.totalRevenue.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
