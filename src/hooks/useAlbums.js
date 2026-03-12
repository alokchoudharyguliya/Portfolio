import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/albums';

function mapAlbum(item) {
  return {
    id: item.id,
    name: item.title || item.name || item.name || '',
    images: Array.isArray(item.images) ? item.images : [],
    createdAt: item.created_at || item.createdAt || null,
  };
}

export default function useAlbums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchAlbums();
      const list = (Array.isArray(data) ? data : []).map(mapAlbum);
      setAlbums(list);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createAlbum = useCallback(async (payload) => {
    const created = await api.createAlbum(payload);
    const mapped = mapAlbum(created);
    setAlbums(s => [mapped, ...s]);
    return mapped;
  }, []);

  const deleteAlbum = useCallback(async (id) => {
    await api.deleteAlbum(id);
    setAlbums(s => s.filter(a => a.id !== id));
    return true;
  }, []);

  const uploadImage = useCallback(async (albumId, file, title) => {
    const created = await api.uploadAlbumImage(albumId, file, title);
    // backend returns created image object — append to album
    setAlbums(s => s.map(a => a.id === albumId ? { ...a, images: [...(a.images||[]), created] } : a));
    return created;
  }, []);

  const deleteImage = useCallback(async (albumId, imageId) => {
    await api.deleteAlbumImage(albumId, imageId);
    setAlbums(s => s.map(a => a.id === albumId ? { ...a, images: (a.images||[]).filter(img => img.id !== imageId) } : a));
    return true;
  }, []);

  const moveImage = useCallback(async (albumId, imageId, targetAlbumId) => {
    const updated = await api.moveAlbumImage(albumId, imageId, targetAlbumId);
    // API returns updated image — remove from source and add to target
    setAlbums(s => {
      const src = s.map(a => a.id === albumId ? { ...a, images: (a.images||[]).filter(img => img.id !== imageId) } : a);
      return src.map(a => a.id === targetAlbumId ? { ...a, images: [...(a.images||[]), updated] } : a);
    });
    return updated;
  }, []);

  // helper to add an image by URL locally (keeps backward compatibility with current UI)
  const addLocalImage = useCallback((albumId, imageUrl) => {
    const fakeImg = { id: Date.now(), image: imageUrl, url: imageUrl };
    setAlbums(s => s.map(a => a.id === albumId ? { ...a, images: [...(a.images||[]), fakeImg] } : a));
    return fakeImg;
  }, []);

  return {
    albums,
    loading,
    error,
    refetch: load,
    createAlbum,
    deleteAlbum,
    uploadImage,
    deleteImage,
    moveImage,
    addLocalImage,
  };
}
