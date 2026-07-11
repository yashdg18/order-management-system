import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function ok(message, data, meta) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return NextResponse.json(body);
}

export function created(message, data) {
  return NextResponse.json({ success: true, message, data }, { status: 201 });
}

export function fail(statusCode, message, errors) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return NextResponse.json(body, { status: statusCode });
}

/**
 * Wraps a route handler so thrown ApiErrors (or unexpected errors) are
 * turned into a consistent JSON error response instead of a raw 500 crash.
 */
export function withErrorHandling(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.statusCode, err.message, err.errors);
      }
      if (err && err.code === 11000) {
        return fail(409, "Duplicate value violates a unique constraint", err.keyValue);
      }
      if (err && err.name === "ValidationError") {
        return fail(422, "Validation failed", err.message);
      }
      if (err && err.name === "CastError") {
        return fail(400, "Invalid identifier supplied");
      }
      // eslint-disable-next-line no-console
      console.error("Unhandled API error:", err);
      return fail(500, "Internal server error");
    }
  };
}
