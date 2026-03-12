import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/drawings';

function mapDrawing(item) {
  return {
    id: item.id,
    title: item.title,
    strokes: item.strokes ?? [],
    canvasWidth: item.canvas_width,
    canvasHeight: item.canvas_height,
    devicePixelRatio: item.device_pixel_ratio ?? 1,
    thumbnail: item.thumbnail ?? null,
    thumbnail_url: item.thumbnail_url ?? null,  // ← ADD THIS
    createdAt: item.created_at || item.createdAt || null,
    modifiedAt: item.modified_at || item.modifiedAt || null,
  };
}

/**
 * Manages the full list of saved drawings (for a gallery view).
 * Supports pagination, search, and filtering.
 */
export default function useDrawings() {
  const [drawings, setDrawings] = useState([]);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-created_at');

  const load = useCallback(
    async (p = page, s = search, o = ordering) => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.fetchDrawings({ page: p, page_size: pageSize, search: s, ordering: o });
        console.log('📦 API Response:', data);
        // Handle paginated response: { results: [...], count, next, previous }
        const raw = data.results || (Array.isArray(data) ? data : []);
        console.log('📋 Parsed drawings:', raw);
        setDrawings(raw.map(mapDrawing));
        setPagination({
          count: data.count ?? raw.length,
          next: data.next ?? null,
          previous: data.previous ?? null,
        });
        console.log('✅ Gallery loaded:', raw.length, 'items');
      } catch (err) {
        console.error('❌ Gallery load error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    load(page, search, ordering);
  }, [page, search, ordering, load]);

  const refetch = useCallback(() => load(page, search, ordering), [load, page, search, ordering]);
  const goToPage = useCallback((p) => setPage(p), []);
  const updateSearch = useCallback((s) => { setSearch(s); setPage(1); }, []);
  const updateOrdering = useCallback((o) => { setOrdering(o); setPage(1); }, []);

  const create = useCallback(async (payload) => {
    const item = await api.createDrawing(payload);
    const mapped = mapDrawing(item);
    setDrawings((s) => [mapped, ...s]);
    return mapped;
  }, []);

  const update = useCallback(async (id, payload) => {
    const item = await api.updateDrawing(id, payload);
    const mapped = mapDrawing(item);
    setDrawings((s) => s.map((d) => (d.id === id ? { ...d, ...mapped } : d)));
    return mapped;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteDrawing(id);
    setDrawings((s) => s.filter((d) => d.id !== id));
    return true;
  }, []);

  return {
    drawings,
    pagination,
    loading,
    error,
    page,
    pageSize,
    search,
    ordering,
    goToPage,
    updateSearch,
    updateOrdering,
    refetch,
    createDrawing: create,
    updateDrawing: update,
    deleteDrawing: remove,
  };
}

/**
 * Manages a single drawing's lifecycle: save (create/update + thumbnail) and
 * load stroke data for canvas replay.
 *
 * @param {string|null} initialId - UUID of an existing drawing to edit, or null for new.
 */
export function useDrawing(initialId = null) {
  const [savedId, setSavedId] = useState(initialId);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Sync savedId whenever initialId prop changes (e.g., when user selects a different drawing)
  useEffect(() => {
    setSavedId(initialId);
  }, [initialId]);

  /**
   * Save (create or update) a drawing.
   * @param {{ title, strokes, canvasWidth, canvasHeight, devicePixelRatio, canvas }} opts
   *   - canvas: HTMLCanvasElement used to generate a WebP thumbnail (optional)
   */
  const save = useCallback(
    async ({ title, strokes, canvasWidth, canvasHeight, devicePixelRatio, canvas }) => {
      setSaving(true);
      setSaveError(null);
      try {
        const payload = {
          title,
          strokes,
          canvas_width: canvasWidth,
          canvas_height: canvasHeight,
          device_pixel_ratio: devicePixelRatio,
        };
        let item;
        if (savedId) {
          item = await api.updateDrawing(savedId, payload);
        } else {
          item = await api.createDrawing(payload);
          setSavedId(item.id);
        }
        // Upload thumbnail — wait for it but don't fail the save if it errors
        if (canvas) {
          try {
            await new Promise((resolve) => {
              canvas.toBlob(
                async (blob) => {
                  if (blob) {
                    try {
                      await api.uploadThumbnail(item.id, blob);
                      console.log(`✓ Thumbnail uploaded for ${item.id}`);
                    } catch (err) {
                      console.error(`✗ Thumbnail upload failed for ${item.id}:`, err);
                    }
                  }
                  resolve();
                },
                'image/webp',
                0.85,
              );
            });
          } catch (err) {
            console.error('Thumbnail generation error:', err);
          }
        }
        return mapDrawing(item);
      } catch (err) {
        setSaveError(err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [savedId],
  );

  /**
   * Fetch raw stroke data for canvas replay.
   * Returns: { id, title, strokes, canvas_width, canvas_height, device_pixel_ratio }
   */
  const load = useCallback(
    async (id) => {
      const data = await api.exportDrawing(id ?? savedId);
      return data;
    },
    [savedId],
  );

  return { savedId, saving, saveError, save, load };
}
