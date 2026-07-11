import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireRole } from "@/lib/requireAuth";
import { ok, withErrorHandling } from "@/lib/apiResponse";

async function getHandler(request) {
  await connectDB();
  requireRole(request, ["admin"]);

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30", 10);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orderCount: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", orderCount: 1, totalRevenue: 1 } },
  ]);

  return ok("Orders per day fetched", data);
}

export const GET = withErrorHandling(getHandler);
