import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/blogs';

function mapFromBackend(item) {
  return {
    id: item.id,
    title: item.title,
    html: item.html,
    css: item.css,
    createdAt: item.created_at || item.createdAt || null,
  };
}

export default function useBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchBlogs();
      const list = Array.isArray(data) ? data.map(mapFromBackend) : [];
      setBlogs(list);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload) => {
    const created = await api.createBlog(payload);
    // created may be array or object
    const item = Array.isArray(created) ? created[0] : (created || {});
    const mapped = mapFromBackend(item);
    setBlogs(s => [mapped, ...s]);
    return mapped;
  }, []);

  const update = useCallback(async (id, payload) => {
    const updated = await api.updateBlog(id, payload);
    const item = Array.isArray(updated) ? updated[0] : (updated || {});
    const mapped = mapFromBackend(item);
    setBlogs(s => s.map(b => b.id === id ? { ...b, ...mapped } : b));
    return mapped;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteBlog(id);
    setBlogs(s => s.filter(b => b.id !== id));
    return true;
  }, []);

  return {
    blogs,
    loading,
    error,
    refetch: load,
    createBlog: create,
    updateBlog: update,
    deleteBlog: remove,
  };
}
