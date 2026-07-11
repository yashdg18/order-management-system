import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireRole } from "@/lib/requireAuth";
import { ok, withErrorHandling } from "@/lib/apiResponse";

async function getHandler(request) {
  await connectDB();
  requireRole(request, ["admin"]);

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const data = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        name: { $first: "$items.name" },
        totalQuantitySold: { $sum: "$items.quantity" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { totalQuantitySold: -1 } },
    { $limit: limit },
    { $project: { _id: 0, productId: "$_id", name: 1, totalQuantitySold: 1, totalRevenue: 1 } },
  ]);

  return ok("Top selling items fetched", data);
}

export const GET = withErrorHandling(getHandler);
