// Lightweight drawings API service using Vite env var `VITE_API_BASE`
const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

async function handleResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || 'API error');
    err.response = json;
    throw err;
  }
  return json;
}

export async function fetchDrawings(params = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', params.page);
  if (params.page_size) qs.set('page_size', params.page_size);
  if (params.search) qs.set('search', params.search);
  if (params.ordering) qs.set('ordering', params.ordering);
  const url = `${BASE_URL}/api/notepad/` + (qs.toString() ? `?${qs.toString()}` : '');
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const json = await handleResponse(res);
  // expected shape: { results: [...], next, previous, count } from pagination
  // or { data: [...] } or plain array
  return json.results ?? json.data ?? json;
}

export async function fetchDrawing(id) {
  const res = await fetch(`${BASE_URL}/api/notepad/${id}/`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const json = await handleResponse(res);
  return json.data ?? json;
}

export async function createDrawing(payload) {
  const res = await fetch(`${BASE_URL}/api/notepad/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data ?? json;
}

export async function updateDrawing(id, payload) {
  const res = await fetch(`${BASE_URL}/api/notepad/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data ?? json;
}

export async function deleteDrawing(id) {
  const res = await fetch(`${BASE_URL}/api/notepad/${id}/`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Delete failed');
  return true;
}

/** Upload a WebP/PNG blob as the drawing thumbnail (multipart). */
export async function uploadThumbnail(id, blob) {
  const form = new FormData();
  form.append('thumbnail', blob, 'thumbnail.webp');
  const res = await fetch(`${BASE_URL}/api/notepad/${id}/thumbnail/`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    credentials: 'include',
    body: form,
  });
  const json = await handleResponse(res);
  return json.data ?? json;
}

/** Returns strokes JSON + canvas meta for client-side replay. */
export async function exportDrawing(id) {
  const res = await fetch(`${BASE_URL}/api/notepad/${id}/export/`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const json = await handleResponse(res);
  return json.data ?? json;
}

export default {
  fetchDrawings,
  fetchDrawing,
  createDrawing,
  updateDrawing,
  deleteDrawing,
  uploadThumbnail,
  exportDrawing,
};
