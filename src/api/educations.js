// Education API service — mirrors the todos/skills pattern
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

export async function fetchEducations() {
  const res = await fetch(`${BASE_URL}/api/education/`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const json = await handleResponse(res);
  // DRF ModelViewSet returns plain array or { results: [...] } with pagination
  return Array.isArray(json) ? json : (json.results || json.data || []);
}

export async function createEducation(payload) {
  const res = await fetch(`${BASE_URL}/api/education/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function updateEducation(id, payload) {
  const res = await fetch(`${BASE_URL}/api/education/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function deleteEducation(id) {
  const res = await fetch(`${BASE_URL}/api/education/${id}/`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Delete failed');
  return true;
}

export async function uploadResult(id, file) {
  const formData = new FormData();
  formData.append('result', file);
  const res = await fetch(`${BASE_URL}/api/education/${id}/`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
    // Do NOT set Content-Type header — browser will set it with boundary
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function uploadEducationImage(id, file, title) {
  const formData = new FormData();
  formData.append('image', file);
  if (title) formData.append('title', title);
  const res = await fetch(`${BASE_URL}/api/education/${id}/image/`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function deleteEducationImage(id, imageId) {
  // Send image id as query param for deletion; backend may also accept body
  const url = new URL(`${BASE_URL}/api/education/${id}/image/`);
  if (imageId) url.searchParams.set('image_id', imageId);
  const res = await fetch(url.toString(), {
    method: 'DELETE',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const err = new Error(json.message || 'Delete image failed');
    err.response = json;
    throw err;
  }
  return true;
}

export default { fetchEducations, createEducation, updateEducation, deleteEducation, uploadResult };
