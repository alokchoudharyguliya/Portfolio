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

export async function fetchBlogs() {
  const res = await fetch(`${BASE_URL}/api/blog/`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const json = await handleResponse(res);
  // expected: { success, message, data: [ { id, title, html, css } ] }
  return json.data || [];
}

export async function createBlog(payload) {
  const res = await fetch(`${BASE_URL}/api/blog/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function updateBlog(id, payload) {
  const res = await fetch(`${BASE_URL}/api/blog/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function deleteBlog(id) {
  const res = await fetch(`${BASE_URL}/api/blog/${id}/`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Delete failed');
  return true;
}

export default { fetchBlogs, createBlog, updateBlog, deleteBlog };
