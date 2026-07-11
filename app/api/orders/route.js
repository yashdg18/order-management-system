import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { validateCreateOrder } from "@/lib/validators";
import { getAuthUser, requireRole } from "@/lib/requireAuth";
import { getPaginationParams, buildPaginationMeta } from "@/lib/pagination";
import { ok, created, withErrorHandling, ApiError } from "@/lib/apiResponse";
import { emitNewOrder } from "@/lib/socketEmit";

async function getHandler(request) {
  await connectDB();
  const authUser = getAuthUser(request);

  const { searchParams } = new URL(request.url);
  const pagination = getPaginationParams(searchParams);
  const status = searchParams.get("status");
  const storeIdParam = searchParams.get("storeId");

  const filter = {};
  // Scope by role: customers only ever see their own orders, store
  // managers only their store's orders, admins can see everything
  // (optionally filtered by storeId).
  if (authUser.role === "customer") {
    filter.customerId = authUser.userId;
  } else if (authUser.role === "store_manager") {
    filter.storeId = authUser.storeId;
  } else if (storeIdParam) {
    filter.storeId = storeIdParam;
  }
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ [pagination.sortBy]: pagination.sortOrder })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("storeId", "name")
      .populate("customerId", "name email"),
    Order.countDocuments(filter),
  ]);

  return ok("Orders fetched", orders, buildPaginationMeta(pagination.page, pagination.limit, total));
}

async function postHandler(request) {
  await connectDB();
  const authUser = requireRole(request, ["customer"]);

  const body = await request.json();
  const input = validateCreateOrder(body);

  const productIds = input.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds }, storeId: input.storeId });
  if (products.length !== productIds.length) {
    throw new ApiError(400, "One or more products were not found in this store");
  }
  const productMap = new Map(products.map((p) => [p.id, p]));

  const items = input.items.map((item) => {
    const product = productMap.get(item.productId);
    return {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    };
  });
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await Order.create({
    storeId: input.storeId,
    customerId: authUser.userId,
    items,
    totalAmount,
    status: "PLACED",
  });

  emitNewOrder(order);
  return created("Order placed successfully", order);
}

export const GET = withErrorHandling(getHandler);
export const POST = withErrorHandling(postHandler);
