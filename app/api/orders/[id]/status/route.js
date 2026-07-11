import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { validateOrderStatus } from "@/lib/validators";
import { requireRole } from "@/lib/requireAuth";
import { ok, withErrorHandling, ApiError } from "@/lib/apiResponse";
import { emitStatusUpdated } from "@/lib/socketEmit";

const VALID_TRANSITIONS = {
  PLACED: ["PREPARING"],
  PREPARING: ["COMPLETED"],
  COMPLETED: [],
};

async function patchHandler(request, { params }) {
  await connectDB();
  const authUser = requireRole(request, ["admin", "store_manager"]);
  const { id } = await params;
  const body = await request.json();
  const status = validateOrderStatus(body);

  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, "Order not found");

  if (authUser.role === "store_manager" && order.storeId.toString() !== authUser.storeId) {
    throw new ApiError(403, "You do not have permission to update this order");
  }

  if (order.status !== status && !VALID_TRANSITIONS[order.status].includes(status)) {
    throw new ApiError(400, `Cannot transition order from ${order.status} to ${status}`);
  }

  order.status = status;
  await order.save();

  emitStatusUpdated(order);
  return ok("Order status updated", order);
}

export const PATCH = withErrorHandling(patchHandler);
