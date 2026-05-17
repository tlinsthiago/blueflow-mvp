export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3333';
const TOKEN_STORAGE_KEY = 'blueflow-auth-token';
const USER_STORAGE_KEY = 'blueflow-current-user';

let unauthorizedHandler = null;

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function setStoredUser(user) {
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  window.localStorage.removeItem(USER_STORAGE_KEY);
}

export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  return {
    data: null,
    meta: {},
    errors: [
      {
        message: text.length > 240 ? text.slice(0, 240) : text,
      },
    ],
  };
}

export async function apiRequest(path, options = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers ?? {});

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await parseResponse(response);

  if (response.status === 401) {
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    const message = payload?.errors?.[0]?.message ?? 'Não foi possível concluir a requisição.';
    throw new Error(message);
  }

  return payload;
}

export async function apiFileRequest(path, options = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers ?? {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    const payload = await parseResponse(response);
    const message = payload?.errors?.[0]?.message ?? 'NÃ£o foi possÃ­vel baixar o arquivo.';
    throw new Error(message);
  }

  return response.blob();
}
