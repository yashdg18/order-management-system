"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader, StatCard } from "@/components/PageHeader";
import { LoadingBlock } from "@/components/States";
import { useOrderSocket } from "@/hooks/useOrderSocket";

export default function StoreOverviewPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders", { limit: 100 });
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useOrderSocket({ onNewOrder: load, onStatusUpdated: load });

  const placed = orders.filter((o) => o.status === "PLACED").length;
  const preparing = orders.filter((o) => o.status === "PREPARING").length;
  const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`}
        description="Here's what's happening at your store right now."
      />

      {loading ? (
        <LoadingBlock label="Loading store overview…" />
      ) : (
        <div className="grid-3">
          <StatCard label="New orders" value={String(placed)} accent="amber" />
          <StatCard label="In preparation" value={String(preparing)} />
          <StatCard label="Revenue (recent)" value={`₹${revenue.toLocaleString("en-IN")}`} accent="pine" />
        </div>
      )}
    </div>
  );
}
