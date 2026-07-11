export function emitNewOrder(order) {
  const io = global.io;
  if (!io) return;
  const payload = {
    _id: order._id,
    storeId: order.storeId,
    customerId: order.customerId,
    items: order.items,
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: order.createdAt,
  };
  io.to(`store:${order.storeId}`).to("admins").emit("new-order", payload);
}

export function emitStatusUpdated(order) {
  const io = global.io;
  if (!io) return;
  const payload = {
    _id: order._id,
    storeId: order.storeId,
    customerId: order.customerId,
    status: order.status,
    updatedAt: order.updatedAt,
  };
  io.to(`store:${order.storeId}`)
    .to("admins")
    .to(`user:${order.customerId}`)
    .emit("status-updated", payload);
}
