import { connectDB } from "@/lib/db";
import Store from "@/models/Store";
import { getAuthUser, requireRole } from "@/lib/requireAuth";
import { ok, withErrorHandling, ApiError } from "@/lib/apiResponse";

async function getHandler(request, { params }) {
  await connectDB();
  getAuthUser(request);
  const { id } = await params;
  const store = await Store.findById(id).populate("ownerId", "name email");
  if (!store) throw new ApiError(404, "Store not found");
  return ok("Store fetched", store);
}

async function patchHandler(request, { params }) {
  await connectDB();
  requireRole(request, ["admin"]);
  const { id } = await params;
  const body = await request.json();

  const update = {};
  if (body.name) update.name = String(body.name).trim();
  if (body.address) update.address = String(body.address).trim();

  const store = await Store.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!store) throw new ApiError(404, "Store not found");
  return ok("Store updated", store);
}

async function deleteHandler(request, { params }) {
  await connectDB();
  requireRole(request, ["admin"]);
  const { id } = await params;
  const store = await Store.findByIdAndDelete(id);
  if (!store) throw new ApiError(404, "Store not found");
  return ok("Store deleted", null);
}

export const GET = withErrorHandling(getHandler);
export const PATCH = withErrorHandling(patchHandler);
export const DELETE = withErrorHandling(deleteHandler);
