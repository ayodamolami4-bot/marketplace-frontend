const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

function isPublicGetRequest(path, method) {
  if (method !== "GET") {
    return false;
  }

  return (
    path === "/products" ||
    path.startsWith("/products?") ||
    path.startsWith("/products/") ||
    path === "/categories" ||
    path.startsWith("/categories?")
  );
}

function clearStoredAuth() {
  localStorage.removeItem("marketplace_token");
  localStorage.removeItem("marketplace_user");
}

export async function apiRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const token = localStorage.getItem("marketplace_token");
  const publicRequest = isPublicGetRequest(path, method);

  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !publicRequest) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const timeoutSignal = AbortSignal.timeout(30000);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;
  let response;
  let text;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      method,
      headers,
      signal,
    });
    text = response.status === 204 ? "" : await response.text();
  } catch (error) {
    if (timeoutSignal.aborted && !options.signal?.aborted) {
      throw new Error(
        "The server is taking longer than expected. It may be waking up. Please try again shortly."
      );
    }
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      (typeof data?.error === "string" ? data.error : null) ||
      (typeof data === "string" ? data : null) ||
      `Request failed with status ${response.status}`;

    if (
      response.status === 401 &&
      token &&
      !publicRequest &&
      !path.startsWith("/auth/")
    ) {
      clearStoredAuth();

      if (typeof window !== "undefined") {
        window.location.assign("/#/login?expired=1");
      }
    }

    const error = new Error(message);
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

export { API_BASE_URL };
