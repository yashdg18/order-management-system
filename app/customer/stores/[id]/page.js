"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { useToast } from "@/contexts/ToastContext";
import { PageHeader } from "@/components/PageHeader";
import { LoadingBlock, EmptyState } from "@/components/States";

export default function StoreMenuPage() {
  const params = useParams();
  const storeId = params.id;
  const router = useRouter();
  const { showToast } = useToast();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [placing, setPlacing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [storeRes, productsRes] = await Promise.all([
        api.get(`/stores/${storeId}`),
        api.get("/products", { storeId, limit: 50 }),
      ]);
      setStore(storeRes.data);
      setProducts(productsRes.data);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    load();
  }, [load]);

  const cartLines = Object.values(cart);
  const total = useMemo(() => cartLines.reduce((sum, l) => sum + l.price * l.quantity, 0), [cartLines]);

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev[product._id];
      return {
        ...prev,
        [product._id]: {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: (existing?.quantity || 0) + 1,
        },
      };
    });
  }

  function updateQuantity(productId, quantity) {
    setCart((prev) => {
      if (quantity <= 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: { ...prev[productId], quantity } };
    });
  }

  async function placeOrder() {
    setPlacing(true);
    try {
      await api.post("/orders", {
        storeId,
        items: cartLines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      });
      showToast("Order placed! Track it from My Orders.", "success");
      setCart({});
      router.push("/customer/orders");
    } catch (err) {
      showToast(err.message || "Could not place order", "error");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div>
      <PageHeader title={store?.name || "Store menu"} description={store?.address} />

      <div className="grid-2" style={{ gridTemplateColumns: "2fr 1fr", alignItems: "start" }}>
        <div>
          {loading ? (
            <LoadingBlock label="Loading menu…" />
          ) : !products.length ? (
            <EmptyState title="This store has no products yet" />
          ) : (
            <div className="grid-2">
              {products.map((product) => (
                <div key={product._id} className="ticket-card">
                  <h3 className="font-display" style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-slate" style={{ marginTop: 4 }}>{product.description}</p>
                  )}
                  <div className="row-between" style={{ marginTop: 12 }}>
                    <span className="font-mono" style={{ fontSize: 16 }}>
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      className="btn btn-primary btn-sm"
                    >
                      {product.stock <= 0 ? "Out of stock" : "Add"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-display" style={{ fontSize: 16, fontWeight: 600, marginTop: 0 }}>
            Your order
          </h2>
          {!cartLines.length ? (
            <p className="text-sm text-slate" style={{ marginTop: 12 }}>
              Add items from the menu to build your order.
            </p>
          ) : (
            <>
              <div className="stack gap-2" style={{ marginTop: 16 }}>
                {cartLines.map((line) => (
                  <div key={line.productId} className="cart-line">
                    <span style={{ flex: 1 }}>{line.name}</span>
                    <div className="row gap-1">
                      <button className="qty-btn" onClick={() => updateQuantity(line.productId, line.quantity - 1)}>
                        −
                      </button>
                      <span className="font-mono" style={{ width: 20, textAlign: "center" }}>
                        {line.quantity}
                      </span>
                      <button className="qty-btn" onClick={() => updateQuantity(line.productId, line.quantity + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="row-between font-mono"
                style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--paper-line)", fontSize: 14 }}
              >
                <span>Total</span>
                <span style={{ fontSize: 16, fontWeight: 600 }}>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <button onClick={placeOrder} disabled={placing} className="btn btn-dark btn-block" style={{ marginTop: 16 }}>
                {placing ? "Placing order…" : "Place order"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
