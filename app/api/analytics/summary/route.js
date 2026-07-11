import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireRole } from "@/lib/requireAuth";
import { ok, withErrorHandling } from "@/lib/apiResponse";

async function getHandler(request) {
  await connectDB();
  requireRole(request, ["admin"]);

  const [totals] = await Order.aggregate([
    { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: "$totalAmount" } } },
  ]);

  const statusBreakdown = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { _id: 0, status: "$_id", count: 1 } },
  ]);

  return ok("Dashboard summary fetched", {
    totalOrders: totals?.totalOrders ?? 0,
    totalRevenue: totals?.totalRevenue ?? 0,
    statusBreakdown,
  });
}

export const GET = withErrorHandling(getHandler);
