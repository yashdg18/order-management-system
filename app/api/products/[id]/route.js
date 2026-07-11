import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getAuthUser, requireRole } from "@/lib/requireAuth";
import { ok, withErrorHandling, ApiError } from "@/lib/apiResponse";

async function getHandler(request, { params }) {
  await connectDB();
  getAuthUser(request);
  const { id } = await params;
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");
  return ok("Product fetched", product);
}

async function patchHandler(request, { params }) {
  await connectDB();
  requireRole(request, ["admin", "store_manager"]);
  const { id } = await params;
  const body = await request.json();

  const update = {};
  if (body.name !== undefined) update.name = String(body.name).trim();
  if (body.price !== undefined) update.price = Number(body.price);
  if (body.description !== undefined) update.description = String(body.description);
  if (body.image !== undefined) update.image = String(body.image);
  if (body.stock !== undefined) update.stock = Math.max(0, parseInt(body.stock, 10) || 0);

  const product = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, "Product not found");
  return ok("Product updated", product);
}

async function deleteHandler(request, { params }) {
  await connectDB();
  requireRole(request, ["admin", "store_manager"]);
  const { id } = await params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new ApiError(404, "Product not found");
  return ok("Product deleted", null);
}

export const GET = withErrorHandling(getHandler);
export const PATCH = withErrorHandling(patchHandler);
export const DELETE = withErrorHandling(deleteHandler);
