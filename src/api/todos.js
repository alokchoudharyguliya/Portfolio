// Lightweight todos API service using Vite env var `VITE_API_BASE`
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

export async function fetchTodos() {
  const res = await fetch(`${BASE_URL}/api/todo/`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const json = await handleResponse(res);
  // expected shape: { success, message, data: { pending, completed, todos: [...] } }
  return json.data;
}

export async function createTodo(payload) {
  const res = await fetch(`${BASE_URL}/api/todo/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  // return created object or full response data
  return json.data || json;
}

export async function updateTodo(id, payload) {
  const res = await fetch(`${BASE_URL}/api/todo/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function deleteTodo(id) {
  const res = await fetch(`${BASE_URL}/api/todo/${id}/`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Delete failed');
  return true;
}

export async function toggleTodo(id, completed) {
  return updateTodo(id, { completed });
}

export default { fetchTodos, createTodo, updateTodo, deleteTodo, toggleTodo };
