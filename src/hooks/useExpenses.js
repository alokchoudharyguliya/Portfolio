import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/expenses';

function mapExpense(item) {
  return {
    id: item.id,
    category: item.category,
    amount: item.amount,
    description: item.description,
    date: item.date,
    createdAt: item.created_at || item.createdAt || null,
    modifiedAt: item.modified_at || item.modifiedAt || null,
  };
}

export default function useExpenses(initialParams = {}) {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenditure, setTotalExpenditure] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const load = useCallback(async (p = params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchExpenses(p);
      const list = Array.isArray(data.expenses) ? data.expenses.map(mapExpense) : [];
      setExpenses(list);
      setTotalExpenditure(data.total_expenditure ?? 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { load(params); }, [load, params]);

  const refetch = useCallback((overrideParams) => {
    if (overrideParams) setParams(prev => ({ ...prev, ...overrideParams }));
    else load(params);
  }, [load, params]);

  const createExpense = useCallback(async (payload) => {
    const res = await api.createExpense(payload);
    // After create, refetch to get updated totals; quick approach
    await load(params);
    return res;
  }, [load, params]);

  const updateExpense = useCallback(async (id, payload) => {
    const res = await api.updateExpense(id, payload);
    await load(params);
    return res;
  }, [load, params]);

  const deleteExpense = useCallback(async (id) => {
    const res = await api.deleteExpense(id);
    await load(params);
    return res;
  }, [load, params]);

  return {
    expenses,
    totalExpenditure,
    loading,
    error,
    params,
    setParams,
    refetch,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
// import { useCallback, useEffect } from 'react';
// import * as api from '../api/expenses';
// function mapFromBackend(item) {
//     return {
//         id: item.id,

//     };
// }
// export default function useExpenses() {
//     const [expenses, setExpenses] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const load = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const data = await api.fetchExpenses();
//             const list = (data && data.expenses) ? data.todos.map(mapFromBackend) : [];
//             setExpenses(list);
//         } catch (err) {
//             setError(err);
//         }
//         finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         load()
//     }, [load]);
// }