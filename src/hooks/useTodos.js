import { useEffect, useState, useCallback } from 'react';
import * as api from '../api/todos';

function mapFromBackend(item) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    completed: !!item.completed,
    createdAt: item.created_at || item.createdAt || null,
    modifiedAt: item.modified_at || item.modifiedAt || null,
    priority: item.priority ?? 1,
  };
}

export default function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchTodos();
      // data may contain counts and todos list
      const list = (data && data.todos) ? data.todos.map(mapFromBackend) : [];
      setTodos(list);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(async (payload) => {
    const created = await api.createTodo(payload);
    // if API returns created object inside data or list, try to map
    const maybe = created && created.todos ? created.todos[0] : created;
    const mapped = mapFromBackend(maybe);
    setTodos((s) => [mapped, ...s]);
    return mapped;
  }, []);

  const update = useCallback(async (id, payload) => {
    const updated = await api.updateTodo(id, payload);
    const maybe = updated && updated.todos ? updated.todos[0] : updated;
    const mapped = mapFromBackend(maybe);
    setTodos((s) => s.map(t => t.id === id ? { ...t, ...mapped } : t));
    return mapped;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteTodo(id);
    setTodos((s) => s.filter(t => t.id !== id));
    return true;
  }, []);

  const toggle = useCallback(async (id, completed) => {
    const updated = await api.toggleTodo(id, completed);
    const maybe = updated && updated.todos ? updated.todos[0] : updated;
    const mapped = mapFromBackend(maybe);
    setTodos((s) => s.map(t => t.id === id ? { ...t, ...mapped } : t));
    return mapped;
  }, []);

  return {
    todos,
    loading,
    error,
    refetch: load,
    createTodo: create,
    updateTodo: update,
    deleteTodo: remove,
    toggleTodo: toggle,
  };
}
