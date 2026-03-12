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

export async function fetchAlbums() {
  const res = await fetch(`${BASE_URL}/api/album/`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const json = await handleResponse(res);
  return Array.isArray(json) ? json : (json.results || json.data || []);
}

export async function createAlbum(payload) {
  const res = await fetch(`${BASE_URL}/api/album/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function deleteAlbum(id) {
  const res = await fetch(`${BASE_URL}/api/album/${id}/`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Delete failed');
  return true;
}

export async function uploadAlbumImage(albumId, file, title) {
  const formData = new FormData();
  formData.append('image', file);
  if (title) formData.append('title', title);
  const res = await fetch(`${BASE_URL}/api/album/${albumId}/images/`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function deleteAlbumImage(albumId, imageId) {
  const res = await fetch(`${BASE_URL}/api/album/${albumId}/images/${imageId}/`, {
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

export async function moveAlbumImage(albumId, imageId, targetAlbumId) {
  const res = await fetch(`${BASE_URL}/api/album/${albumId}/images/${imageId}/move/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ target_album: targetAlbumId }),
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export default { fetchAlbums, createAlbum, deleteAlbum, uploadAlbumImage, deleteAlbumImage, moveAlbumImage };
