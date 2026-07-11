import StatusBadge from "./StatusBadge";
import { EmptyState } from "./States";

const NEXT_STATUS = { PLACED: "PREPARING", PREPARING: "COMPLETED" };
const NEXT_LABEL = { PLACED: "Start preparing", PREPARING: "Mark completed" };

export default function OrdersTable({
  orders,
  showStore = false,
  showCustomer = false,
  onAdvanceStatus,
  advancingId,
}) {
  if (!orders.length) {
    return (
      <EmptyState
        title="No orders here yet"
        description="New orders will appear the moment they're placed."
      />
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            {showStore && <th>Store</th>}
            {showCustomer && <th>Customer</th>}
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Placed</th>
            {onAdvanceStatus && <th style={{ textAlign: "right" }}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const storeName = typeof order.storeId === "object" ? order.storeId?.name : order.storeId;
            const customerName =
              typeof order.customerId === "object" ? order.customerId?.name : order.customerId;
            const next = NEXT_STATUS[order.status];

            return (
              <tr key={order._id}>
                <td className="font-mono text-xs text-slate">#{order._id.slice(-6)}</td>
                {showStore && <td>{storeName}</td>}
                {showCustomer && <td>{customerName}</td>}
                <td className="text-slate">{order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}</td>
                <td className="font-mono">₹{order.totalAmount.toLocaleString("en-IN")}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td className="text-slate">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </td>
                {onAdvanceStatus && (
                  <td style={{ textAlign: "right" }}>
                    {next ? (
                      <button
                        onClick={() => onAdvanceStatus(order._id, next)}
                        disabled={advancingId === order._id}
                        className="btn btn-outline btn-sm"
                      >
                        {advancingId === order._id ? "Updating…" : NEXT_LABEL[order.status]}
                      </button>
                    ) : (
                      <span className="text-xs text-slate">—</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
