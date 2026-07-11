const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export function getPaginationParams(searchParams, defaultSortBy = "createdAt") {
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  let limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  limit = Math.min(Math.max(limit, 1), MAX_LIMIT);

  const sortBy = searchParams.get("sortBy") || defaultSortBy;
  const sortOrderRaw = searchParams.get("sortOrder") || "desc";
  const sortOrder = sortOrderRaw.toLowerCase() === "asc" ? 1 : -1;

  return { page, limit, skip: (page - 1) * limit, sortBy, sortOrder };
}

export function buildPaginationMeta(page, limit, total) {
  return { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) };
}
