"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { useToast } from "@/contexts/ToastContext";
import { PageHeader } from "@/components/PageHeader";
import { LoadingBlock, EmptyState } from "@/components/States";
import Pagination from "@/components/Pagination";

export default function AdminStoresPage() {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [stores, setStores] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", ownerId: "" });
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, meta } = await api.get("/stores", { page, limit: 10 });
      setStores(data);
      setMeta(meta);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/stores", {
        name: form.name,
        address: form.address,
        ownerId: form.ownerId || undefined,
      });
      showToast("Store created", "success");
      setShowForm(false);
      setForm({ name: "", address: "", ownerId: "" });
      load();
    } catch (err) {
      showToast(err.message || "Could not create store", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/stores/${id}`);
      showToast("Store deleted", "success");
      load();
    } catch (err) {
      showToast(err.message || "Could not delete store", "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Stores"
        description="Every store operating on Order Management System."
        action={
          <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "New store"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="card form-grid" style={{ marginBottom: 24 }}>
          <input
            required
            placeholder="Store name"
            className="input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            required
            placeholder="Address"
            className="input"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
          <input
            placeholder="Owner user ID (store manager)"
            className="input"
            value={form.ownerId}
            onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))}
          />
          <button type="submit" disabled={creating} className="btn btn-dark" style={{ gridColumn: "1 / -1" }}>
            {creating ? "Creating…" : "Create store"}
          </button>
        </form>
      )}

      {loading ? (
        <LoadingBlock label="Loading stores…" />
      ) : !stores.length ? (
        <EmptyState title="No stores yet" description="Create the first store to get orders flowing." />
      ) : (
        <div className="grid-2">
          {stores.map((store) => (
            <div key={store._id} className="ticket-card row-between">
              <div>
                <h3 className="font-display" style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                  {store.name}
                </h3>
                <p className="text-xs text-slate" style={{ marginTop: 4 }}>{store.address}</p>
                <p className="font-mono text-xs text-slate" style={{ marginTop: 4 }}>
                  Owner: {typeof store.ownerId === "object" ? store.ownerId?.name : store.ownerId}
                </p>
              </div>
              <button onClick={() => handleDelete(store._id)} className="btn-danger-ghost btn-sm btn">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
}
