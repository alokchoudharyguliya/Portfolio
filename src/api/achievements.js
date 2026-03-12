const BASE = '/api/education/achievements';

async function handleResponse(res) {
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error((json && (json.detail || json.message)) || res.statusText || 'Request failed');
  // Unwrap common envelope { success: true, message: '', data: ... }
  if (json && typeof json === 'object' && ('success' in json || 'data' in json)) {
    return json.data !== undefined ? json.data : json;
  }
  return json;
}

export async function fetchAchievements() {
  const res = await fetch(`${BASE}/`);
  return handleResponse(res);
}

export async function createAchievement(payload) {
  // If payload contains a file under `result` or is already a FormData, send multipart
  let options;
  if (payload instanceof FormData) {
    options = { method: 'POST', body: payload, credentials: 'include' };
  } else if (payload && payload.result instanceof File) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (k === 'result' && v instanceof File) fd.append('result', v, v.name);
      else if (Array.isArray(v)) v.forEach(item => fd.append(k, item));
      else fd.append(k, v);
    });
    options = { method: 'POST', body: fd, credentials: 'include' };
  } else {
    options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    };
  }
  const res = await fetch(`${BASE}/`, options);
  return handleResponse(res);
}

export async function updateAchievement(id, payload) {
  // Support multipart PATCH when updating with a file (result)
  let options;
  if (payload instanceof FormData) {
    options = { method: 'PATCH', body: payload, credentials: 'include' };
  } else if (payload && payload.result instanceof File) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (k === 'result' && v instanceof File) fd.append('result', v, v.name);
      else if (Array.isArray(v)) v.forEach(item => fd.append(k, item));
      else fd.append(k, v);
    });
    options = { method: 'PATCH', body: fd, credentials: 'include' };
  } else {
    options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    };
  }
  const res = await fetch(`${BASE}/${id}/`, options);
  return handleResponse(res);
}

export async function deleteAchievement(id) {
  const res = await fetch(`${BASE}/${id}/`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error('Delete failed');
  return true;
}

