import { useEffect, useState, useCallback } from 'react';
import * as api from '../api/socialMedia';

function mapFromBackend(item) {
  return {
    id: item.id,
    name: item.name || '',
    url: item.url || '',
    icon_url: item.icon_url || item.icon || null,
    createdAt: item.created_at || item.createdAt || null,
    modifiedAt: item.modified_at || item.modifiedAt || null,
  };
}

export default function useSocialMedia() {
  const [socialMedia, setSocialMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchSocialMedia();
      const list = (Array.isArray(data) ? data : []).map(mapFromBackend);
      setSocialMedia(list);
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
    const created = await api.createSocialMedia(payload);
    const mapped = mapFromBackend(created);
    setSocialMedia((s) => [mapped, ...s]);
    return mapped;
  }, []);

  const update = useCallback(async (id, payload) => {
    const updated = await api.updateSocialMedia(id, payload);
    console.log(payload['icon']="CHINA");
    const mapped = mapFromBackend(updated);
    setSocialMedia((s) => s.map(item => item.id === id ? { ...item, ...mapped } : item));
    return mapped;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteSocialMedia(id);
    setSocialMedia((s) => s.filter(item => item.id !== id));
    return true;
  }, []);

  return {
    socialMedia,
    loading,
    error,
    refetch: load,
    createSocial: create,
    updateSocial: update,
    deleteSocial: remove,
  };
}
