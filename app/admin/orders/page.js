"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { PageHeader } from "@/components/PageHeader";
import { LoadingBlock } from "@/components/States";
import OrdersTable from "@/components/OrdersTable";
import Pagination from "@/components/Pagination";
import { useOrderSocket } from "@/hooks/useOrderSocket";

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, meta } = await api.get("/orders", {
        page,
        limit: 10,
        status: status || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setOrders(data);
      setMeta(meta);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  useOrderSocket({ onNewOrder: load, onStatusUpdated: load });

  return (
    <div>
      <PageHeader
        title="All orders"
        description="Every order across every store, newest first."
        action={
          <select
            className="input"
            style={{ width: 180 }}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="PLACED">Placed</option>
            <option value="PREPARING">Preparing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        }
      />

      {loading ? (
        <LoadingBlock label="Loading orders…" />
      ) : (
        <>
          <OrdersTable orders={orders} showStore showCustomer />
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
