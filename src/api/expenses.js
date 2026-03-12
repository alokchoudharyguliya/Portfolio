// Lightweight expenses API service using Vite env var `VITE_API_BASE`
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

export async function fetchExpenses(params = {}) {
  const qs = new URLSearchParams();
  if (params.ordering) qs.set('ordering', params.ordering);
  if (params.category) qs.set('category', params.category);
  if (params.date) qs.set('date', params.date);
  const url = `${BASE_URL}/api/expense/` + (qs.toString() ? `?${qs.toString()}` : '');
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const json = await handleResponse(res);
  // expected shape: { success, message, data: { expenses: [...], total_expenditure } }
  return json.data || {};
}

export async function createExpense(payload) {
  const res = await fetch(`${BASE_URL}/api/expense/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function updateExpense(id, payload) {
  const res = await fetch(`${BASE_URL}/api/expense/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data || json;
}

export async function deleteExpense(id) {
  const res = await fetch(`${BASE_URL}/api/expense/${id}/`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Delete failed');
  return true;
}

export default { fetchExpenses, createExpense, updateExpense, deleteExpense };
// const BASE_URL=import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// async function handleResponse(res){
//     const json=await res.json().catch(()=>({}));
//     if(!res.ok){
//         const err=new Error(json.message || 'API error');
//         err.response=json;
//         throw err;
//     }
//     return json;
// }

// export async function fetchExpenses(){
//     const res=await fetch(`${BASE_URL}/api/expense/`,{
//         headers:{Accept:'application/json'},
//         credentials:'include',
//     });
//     const json=await handleResponse(res);
//     return json.data;

// }

// export default {fetchExpenses};