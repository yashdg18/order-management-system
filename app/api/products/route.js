import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { validateProduct } from "@/lib/validators";
import { getAuthUser, requireRole } from "@/lib/requireAuth";
import { getPaginationParams, buildPaginationMeta } from "@/lib/pagination";
import { ok, created, withErrorHandling } from "@/lib/apiResponse";

async function getHandler(request) {
  await connectDB();
  getAuthUser(request);

  const { searchParams } = new URL(request.url);
  const pagination = getPaginationParams(searchParams, "name");
  const storeId = searchParams.get("storeId");
  const search = searchParams.get("search");

  const filter = {};
  if (storeId) filter.storeId = storeId;
  if (search) filter.name = { $regex: search, $options: "i" };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ [pagination.sortBy]: pagination.sortOrder })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Product.countDocuments(filter),
  ]);

  return ok("Products fetched", products, buildPaginationMeta(pagination.page, pagination.limit, total));
}

async function postHandler(request) {
  await connectDB();
  requireRole(request, ["admin", "store_manager"]);

  const body = await request.json();
  const input = validateProduct(body);
  const product = await Product.create(input);
  return created("Product created successfully", product);
}

export const GET = withErrorHandling(getHandler);
export const POST = withErrorHandling(postHandler);
