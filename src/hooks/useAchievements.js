import { useEffect, useState, useCallback } from 'react';
import * as api from '../api/achievements';

export default function useAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await api.fetchAchievements();
      // api.fetchAchievements() now returns the unwrapped data (array or object)
      const list = Array.isArray(data) ? data : (data?.data || []);
      // normalize each achievement to include `result` and `image` conveniences
      const normalized = list.map(a => ({
        ...a,
        result: a.result || null,
        image: a.result || null,
      }));
      setAchievements(normalized);
    } catch (e) {
      setError(e);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload) => {
    const created = await api.createAchievement(payload);
    const item = { ...created, image: created.result || created.image || created.image_url || null };
    setAchievements(prev => [item, ...prev]);
    return item;
  }, []);

  const update = useCallback(async (id, payload) => {
    const updated = await api.updateAchievement(id, payload);
    const item = { ...updated, image: updated.result || updated.image || updated.image_url || null };
    setAchievements(prev => prev.map(a => a.id === id ? item : a));
    return item;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteAchievement(id);
    // Optimistically remove from local state so UI updates immediately
    setAchievements(prev => prev.filter(a => a.id !== id));
    // Then reload canonical list from server to ensure consistency
    await load();
  }, [load]);

  return {
    achievements,
    loading,
    error,
    reload: load,
    createAchievement: create,
    updateAchievement: update,
    deleteAchievement: remove,
  };
}
