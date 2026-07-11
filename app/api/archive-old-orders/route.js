import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import OrderArchive from "@/models/OrderArchive";
import { requireRole } from "@/lib/requireAuth";
import { ok, withErrorHandling } from "@/lib/apiResponse";

async function postHandler(request) {
  await connectDB();
  requireRole(request, ["admin"]);

  const body = await request.json().catch(() => ({}));
  const ageInDays = body?.ageInDays ? parseInt(body.ageInDays, 10) : parseInt(process.env.ARCHIVE_ORDER_AGE_DAYS || "30", 10);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ageInDays);

  const oldOrders = await Order.find({ createdAt: { $lt: cutoff } });
  if (oldOrders.length === 0) {
    return ok("No orders old enough to archive", { archivedCount: 0 });
  }

  const session = await mongoose.startSession();
  let archivedCount = 0;
  let usedTransaction = true;

  try {
    await session.withTransaction(async () => {
      const archiveDocs = oldOrders.map((order) => ({
        originalOrderId: order._id,
        storeId: order.storeId,
        customerId: order.customerId,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        archivedAt: new Date(),
      }));

      await OrderArchive.insertMany(archiveDocs, { session, ordered: false });
      const idsToRemove = oldOrders.map((o) => o._id);
      const result = await Order.deleteMany({ _id: { $in: idsToRemove } }, { session });
      archivedCount = result.deletedCount || 0;
    });
  } catch (err) {
    // Standalone MongoDB instances (no replica set) don't support
    // transactions. Fall back to a best-effort sequential archive so local
    // development without a replica set still works.
    const isTransactionUnsupported =
      err?.code === 20 || /Transaction numbers|replica set/i.test(err?.message || "");
    if (!isTransactionUnsupported) throw err;

    usedTransaction = false;
    const archiveDocs = oldOrders.map((order) => ({
      originalOrderId: order._id,
      storeId: order.storeId,
      customerId: order.customerId,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      archivedAt: new Date(),
    }));
    await OrderArchive.insertMany(archiveDocs, { ordered: false });
    const idsToRemove = oldOrders.map((o) => o._id);
    const result = await Order.deleteMany({ _id: { $in: idsToRemove } });
    archivedCount = result.deletedCount || 0;
  } finally {
    await session.endSession();
  }

  return ok(`Archived ${archivedCount} order(s)`, { archivedCount, usedTransaction });
}

export const POST = withErrorHandling(postHandler);
