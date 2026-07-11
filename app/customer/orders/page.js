"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { PageHeader } from "@/components/PageHeader";
import { LoadingBlock } from "@/components/States";
import OrdersTable from "@/components/OrdersTable";
import Pagination from "@/components/Pagination";
import { useOrderSocket } from "@/hooks/useOrderSocket";

export default function CustomerOrdersPage() {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, meta } = await api.get("/orders", { page, limit: 10, sortBy: "createdAt", sortOrder: "desc" });
      setOrders(data);
      setMeta(meta);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  useOrderSocket({ onNewOrder: load, onStatusUpdated: load });

  return (
    <div>
      <PageHeader title="My orders" description="Track every order you've placed, live." />

      {loading ? (
        <LoadingBlock label="Loading your orders…" />
      ) : (
        <>
          <OrdersTable orders={orders} showStore />
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
