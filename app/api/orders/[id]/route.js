import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getAuthUser } from "@/lib/requireAuth";
import { ok, withErrorHandling, ApiError } from "@/lib/apiResponse";

async function getHandler(request, { params }) {
  await connectDB();
  const authUser = getAuthUser(request);
  const { id } = await params;

  const order = await Order.findById(id)
    .populate("storeId", "name address")
    .populate("customerId", "name email");
  if (!order) throw new ApiError(404, "Order not found");

  // Customers may only view their own orders; store managers only their
  // store's orders. Admins can view anything.
  if (authUser.role === "customer" && order.customerId._id.toString() !== authUser.userId) {
    throw new ApiError(403, "You do not have permission to view this order");
  }
  if (authUser.role === "store_manager" && order.storeId._id.toString() !== authUser.storeId) {
    throw new ApiError(403, "You do not have permission to view this order");
  }

  return ok("Order fetched", order);
}

export const GET = withErrorHandling(getHandler);
