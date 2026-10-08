import { API_BASE } from './config.js';

export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...(options.headers || {}) }
    : { 'Content-Type': 'application/json', ...(options.headers || {}) };

  return fetch(API_BASE + path, {
    credentials: 'include',
    ...options,
    headers
  });
}