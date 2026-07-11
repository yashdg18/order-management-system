"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { PageHeader } from "@/components/PageHeader";
import { LoadingBlock, EmptyState } from "@/components/States";

export default function StoreProductsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const storeId = user?.storeId || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", stock: "" });
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/products", { storeId, limit: 50 });
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/products", {
        storeId,
        name: form.name,
        price: parseFloat(form.price),
        stock: form.stock ? parseInt(form.stock, 10) : 0,
      });
      showToast("Product added", "success");
      setShowForm(false);
      setForm({ name: "", price: "", stock: "" });
      load();
    } catch (err) {
      showToast(err.message || "Could not add product", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleStockChange(id, stock, currentStock) {
    if (Number.isNaN(stock) || stock === currentStock) return;
    try {
      await api.patch(`/products/${id}`, { stock });
      load();
    } catch (err) {
      showToast(err.message || "Could not update stock", "error");
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/products/${id}`);
      showToast("Product removed", "success");
      load();
    } catch (err) {
      showToast(err.message || "Could not remove product", "error");
    }
  }

  if (!storeId) {
    return (
      <div>
        <PageHeader title="Products" />
        <EmptyState
          title="No store linked to your account yet"
          description="Ask an admin to create your store and assign you as its owner. Sign in again afterwards to pick up the link."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="What customers can order from your store."
        action={
          <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "New product"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="card form-grid" style={{ marginBottom: 24 }}>
          <input
            required
            placeholder="Product name"
            className="input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            required
            type="number"
            step="0.01"
            placeholder="Price (₹)"
            className="input"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Stock"
            className="input"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          />
          <button type="submit" disabled={creating} className="btn btn-dark" style={{ gridColumn: "1 / -1" }}>
            {creating ? "Adding…" : "Add product"}
          </button>
        </form>
      )}

      {loading ? (
        <LoadingBlock label="Loading products…" />
      ) : !products.length ? (
        <EmptyState title="No products yet" description="Add your first product to start taking orders." />
      ) : (
        <div className="grid-3">
          {products.map((product) => (
            <div key={product._id} className="ticket-card product-card">
              <div className="row-between">
                <h3 className="font-display" style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                  {product.name}
                </h3>
                <button onClick={() => handleDelete(product._id)} className="btn-danger-ghost btn-sm btn">
                  Remove
                </button>
              </div>
              {product.description && <p className="text-xs text-slate" style={{ marginTop: 4 }}>{product.description}</p>}
              <p className="font-mono" style={{ fontSize: 18, marginTop: 8 }}>₹{product.price.toLocaleString("en-IN")}</p>
              <div className="row gap-2 text-xs text-slate" style={{ marginTop: 8 }}>
                Stock:
                <input
                  type="number"
                  defaultValue={product.stock}
                  className="input"
                  style={{ width: 80 }}
                  onBlur={(e) => handleStockChange(product._id, parseInt(e.target.value, 10), product.stock)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
