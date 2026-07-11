import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireRole } from "@/lib/requireAuth";
import { ok, withErrorHandling } from "@/lib/apiResponse";

async function getHandler(request) {
  await connectDB();
  requireRole(request, ["admin"]);

  const data = await Order.aggregate([
    {
      $group: {
        _id: "$storeId",
        totalRevenue: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "stores",
        localField: "_id",
        foreignField: "_id",
        as: "store",
      },
    },
    { $unwind: "$store" },
    {
      $project: {
        _id: 0,
        storeId: "$_id",
        storeName: "$store.name",
        totalRevenue: 1,
        orderCount: 1,
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  return ok("Revenue per store fetched", data);
}

export const GET = withErrorHandling(getHandler);
