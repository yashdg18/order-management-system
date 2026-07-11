"use client";

const API_BASE = "/api";

let accessToken = null;
let onAuthFailure = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

/** Registered once by AuthContext so the client can clear auth state and redirect on an unrecoverable 401. */
export function setAuthFailureHandler(fn) {
  onAuthFailure = fn;
}

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("refresh failed");
        const body = await res.json();
        accessToken = body.data.accessToken;
        return body.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * Thin fetch wrapper: injects the bearer token, always sends cookies (for
 * the httpOnly refresh token), parses the standard { success, message,
 * data, meta } envelope, and transparently retries once after a token
 * refresh if the server returns 401.
 */
async function request(path, { method = "GET", body, params, retry = true } = {}) {
  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const headers = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry && !path.startsWith("/auth/login") && !path.startsWith("/auth/refresh")) {
    try {
      await refreshAccessToken();
      return request(path, { method, body, params, retry: false });
    } catch {
      accessToken = null;
      if (onAuthFailure) onAuthFailure();
      throw new Error("Session expired. Please log in again.");
    }
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(payload.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.errors = payload.errors;
    throw error;
  }
  return payload;
}

export const api = {
  get: (path, params) => request(path, { method: "GET", params }),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
