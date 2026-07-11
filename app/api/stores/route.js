import { connectDB } from "@/lib/db";
import Store from "@/models/Store";
import User from "@/models/User";
import { validateStore } from "@/lib/validators";
import { requireRole, getAuthUser } from "@/lib/requireAuth";
import { getPaginationParams, buildPaginationMeta } from "@/lib/pagination";
import { ok, created, withErrorHandling } from "@/lib/apiResponse";

async function getHandler(request) {
  await connectDB();
  getAuthUser(request); // any authenticated role can browse stores

  const { searchParams } = new URL(request.url);
  const pagination = getPaginationParams(searchParams, "name");
  const search = searchParams.get("search");

  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };

  const [stores, total] = await Promise.all([
    Store.find(filter)
      .sort({ [pagination.sortBy]: pagination.sortOrder })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("ownerId", "name email"),
    Store.countDocuments(filter),
  ]);

  return ok("Stores fetched", stores, buildPaginationMeta(pagination.page, pagination.limit, total));
}

async function postHandler(request) {
  await connectDB();
  const authUser = requireRole(request, ["admin"]);

  const body = await request.json();
  const input = validateStore(body);
  const ownerId = input.ownerId || authUser.userId;

  const store = await Store.create({ name: input.name, address: input.address, ownerId });
  // Link the owning store manager to this store so their dashboard, order
  // scoping, and socket store-room membership all resolve correctly.
  await User.findByIdAndUpdate(ownerId, { storeId: store._id });

  return created("Store created successfully", store);
}

export const GET = withErrorHandling(getHandler);
export const POST = withErrorHandling(postHandler);
