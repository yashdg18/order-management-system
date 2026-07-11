import { ApiError } from "./apiResponse.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const ROLES = ["admin", "store_manager", "customer"];
export const ORDER_STATUSES = ["PLACED", "PREPARING", "COMPLETED"];

function fail(errors) {
  throw new ApiError(422, "Validation failed", errors);
}

export function validateRegister(body) {
  const errors = {};
  if (!body?.name || String(body.name).trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (!body?.email || !EMAIL_RE.test(body.email)) errors.email = "A valid email is required";
  if (!body?.password || String(body.password).length < 6) errors.password = "Password must be at least 6 characters";
  if (body?.role && !ROLES.includes(body.role)) errors.role = `Role must be one of ${ROLES.join(", ")}`;
  if (Object.keys(errors).length) fail(errors);
  return {
    name: String(body.name).trim(),
    email: String(body.email).trim().toLowerCase(),
    password: String(body.password),
    role: body.role || "customer",
    storeId: body.storeId || null,
  };
}

export function validateLogin(body) {
  const errors = {};
  if (!body?.email || !EMAIL_RE.test(body.email)) errors.email = "A valid email is required";
  if (!body?.password) errors.password = "Password is required";
  if (Object.keys(errors).length) fail(errors);
  return { email: String(body.email).trim().toLowerCase(), password: String(body.password) };
}

export function validateStore(body) {
  const errors = {};
  if (!body?.name || String(body.name).trim().length < 2) errors.name = "Store name must be at least 2 characters";
  if (!body?.address || String(body.address).trim().length < 3) errors.address = "Address is required";
  if (Object.keys(errors).length) fail(errors);
  return {
    name: String(body.name).trim(),
    address: String(body.address).trim(),
    ownerId: body.ownerId || undefined,
  };
}

export function validateProduct(body) {
  const errors = {};
  if (!body?.storeId) errors.storeId = "storeId is required";
  if (!body?.name || String(body.name).trim().length < 1) errors.name = "Product name is required";
  const price = Number(body?.price);
  if (Number.isNaN(price) || price < 0) errors.price = "Price must be a non-negative number";
  if (Object.keys(errors).length) fail(errors);
  return {
    storeId: body.storeId,
    name: String(body.name).trim(),
    price,
    description: body.description ? String(body.description) : "",
    image: body.image ? String(body.image) : "",
    stock: body.stock !== undefined ? Math.max(0, parseInt(body.stock, 10) || 0) : 0,
  };
}

export function validateCreateOrder(body) {
  const errors = {};
  if (!body?.storeId) errors.storeId = "storeId is required";
  if (!Array.isArray(body?.items) || body.items.length === 0) {
    errors.items = "Order must contain at least one item";
  } else {
    for (const item of body.items) {
      if (!item?.productId || !item?.quantity || item.quantity < 1) {
        errors.items = "Each item needs a productId and a positive quantity";
        break;
      }
    }
  }
  if (Object.keys(errors).length) fail(errors);
  return {
    storeId: body.storeId,
    items: body.items.map((i) => ({ productId: i.productId, quantity: parseInt(i.quantity, 10) })),
  };
}

export function validateOrderStatus(body) {
  if (!body?.status || !ORDER_STATUSES.includes(body.status)) {
    fail({ status: `Status must be one of ${ORDER_STATUSES.join(", ")}` });
  }
  return body.status;
}
