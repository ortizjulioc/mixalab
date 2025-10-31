// utils/fetchClient.js
const NEXTAUTH_URL = process.env.NEXTAUTH_URL; // Extract first for clarity

// Fix: Use ternary for safe fallback. If NEXTAUTH_URL is undefined or empty, use localhost.
const API_BASE_URL = NEXTAUTH_URL && NEXTAUTH_URL.trim() !== '' 
  ? `${NEXTAUTH_URL.replace(/\/+$/, '')}/api` // Remove trailing / if any, add /api
  : "http://localhost:3000/api";

const url = API_BASE_URL;

// Debug log (remove in production)
console.log('fetchClient DEBUG - NEXTAUTH_URL:', NEXTAUTH_URL);
console.log('fetchClient DEBUG - API_BASE_URL:', API_BASE_URL);

export async function fetchClient({
  method = "GET",
  endpoint = "",
  data = null,
  headers = {},
  params = {}
}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    // Debug log for fetch URL (remove in production)
    const fetchUrl = `${url}${fullEndpoint}`;
    console.log('fetchClient DEBUG - Fetching:', fetchUrl);

    const response = await fetch(fetchUrl, options);

    if (!response.ok) {
      let errorInfo;
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          errorInfo = await response.json();
        } else {
          errorInfo = { error: { message: await response.text() } };
        }
      } catch (parseError) {
        errorInfo = { error: { message: `Error al parsear respuesta: ${parseError.message}` } };
      }

      const structuredError = {
        success: false,
        error: errorInfo.error || { code: "UNKNOWN_ERROR", message: `Error HTTP: ${response.status}` }
      };

      if (errorInfo && errorInfo.success === false && errorInfo.error) {
        structuredError.error.code = errorInfo.error.code || "INTERNAL_ERROR";
        structuredError.error.message = errorInfo.error.message;
      } else {
        structuredError.error.code = "HTTP_ERROR";
        structuredError.error.message = `Error HTTP: ${response.status} - ${errorInfo.error?.message || response.statusText}`;
      }

      throw structuredError;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    if (error && typeof error === 'object' && 'success' in error && error.success === false) {
      throw error;
    }

    throw {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido del servidor"
      }
    };
  }
}