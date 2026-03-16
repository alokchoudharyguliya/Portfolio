// Social media API service
const BASE = '/api/conatct/social-media';

async function handleResponse(res) {
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error((json && (json.detail || json.message)) || res.statusText || 'Request failed');
  // Unwrap common envelope { success: true, message: '', data: ... }
  if (json && typeof json === 'object' && ('success' in json || 'data' in json)) {
    return json.data !== undefined ? json.data : json;
  }
  return json;
}

export async function fetchSocialMedia() {
  const res = await fetch(`${BASE}/`, { credentials: 'include', headers: { Accept: 'application/json' } });
  return handleResponse(res);
}

export async function createSocialMedia(payload) {
  const res = await fetch(`${BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateSocialMedia(id, payload) {
  const res = await fetch(`${BASE}/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteSocialMedia(id) {
  const res = await fetch(`${BASE}/${id}/`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Delete failed');
  return true;
}

export default { fetchSocialMedia, createSocialMedia, updateSocialMedia, deleteSocialMedia };
