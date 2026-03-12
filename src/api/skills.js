// Skills API service using Vite env var `VITE_API_BASE`
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

export async function fetchSkills() {
  const res = await fetch(`${BASE_URL}/api/skill/`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const json = await handleResponse(res);
  return Array.isArray(json) ? json : (json.data || json.results || []);
}

export async function createSkill(payload) {
  const res = await fetch(`${BASE_URL}/api/skill/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function updateSkill(id, payload) {
  const res = await fetch(`${BASE_URL}/api/skill/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function deleteSkill(id) {
  const res = await fetch(`${BASE_URL}/api/skill/${id}/`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Delete failed');
  return true;
}

// ── Image upload / delete ──────────────────────────────────────────────────

export async function uploadSkillImage(id, file, caption = '') {
  const formData = new FormData();
  formData.append('image', file);
  if (caption) formData.append('caption', caption);

  const res = await fetch(`${BASE_URL}/api/skill/${id}/image/`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function deleteSkillImage(id) {
  const res = await fetch(`${BASE_URL}/api/skill/${id}/image/`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Delete image failed');
  return true;
}

export default { fetchSkills, createSkill, updateSkill, deleteSkill, uploadSkillImage, deleteSkillImage };
