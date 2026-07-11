import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireRole } from "@/lib/requireAuth";
import { getPaginationParams, buildPaginationMeta } from "@/lib/pagination";
import { ok, withErrorHandling } from "@/lib/apiResponse";

async function getHandler(request) {
  await connectDB();
  requireRole(request, ["admin"]);

  const { searchParams } = new URL(request.url);
  const pagination = getPaginationParams(searchParams);
  const role = searchParams.get("role");

  const filter = {};
  if (role) filter.role = role;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ [pagination.sortBy]: pagination.sortOrder })
      .skip(pagination.skip)
      .limit(pagination.limit),
    User.countDocuments(filter),
  ]);

  return ok("Users fetched", users, buildPaginationMeta(pagination.page, pagination.limit, total));
}

export const GET = withErrorHandling(getHandler);
