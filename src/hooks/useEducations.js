import { useEffect, useState, useCallback } from 'react';
import * as api from '../api/educations';

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseYearString(year) {
  // "2022 - 2026" → { start_date: "2022-01-01", end_date: "2026-01-01" }
  if (!year) return { start_date: null, end_date: null };
  const parts = year.split('-').map(s => s.trim()).filter(Boolean);
  return {
    start_date: parts[0] ? `${parts[0]}-01-01` : null,
    end_date:   parts[1] ? `${parts[1]}-01-01` : null,
  };
}
function getMimeFromUrl(url) {
  if (!url || typeof url !== 'string') return 'application/octet-stream';
  const raw = url.split('?')[0].split('#')[0];
  const ext = (raw.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    case 'txt': return 'text/plain';
    default: return 'application/octet-stream';
  }
}

function mapFromBackend(item) {
  const startYear = item.start_date ? item.start_date.slice(0, 4) : '';
  const endYear   = item.end_date   ? item.end_date.slice(0, 4)   : '';
  const year = startYear && endYear
    ? `${startYear} - ${endYear}`
    : startYear || endYear || '';

  // Handle result: backend returns a URL string (e.g. '/media/...')
  let result = null;
  if (item.result) {
    if (typeof item.result === 'string') {
      const url = item.result;
      const fileName = url.split('/').pop();
      const mime = getMimeFromUrl(url);
      result = { name: fileName, url, type: mime };
    } else if (item.result instanceof File) {
      result = item.result;
    } else if (typeof item.result === 'object') {
      result = item.result;
    }
  }

  return {
    id:          item.id,
    title:       item.name || '',                    // name  → title
    institution: item.institution || '',
    year,                                            // derived display string
    start_date:  item.start_date || null,            // keep raw for round-trip
    end_date:    item.end_date   || null,
    percentage:  item.score || '',                   // score → percentage
    description: item.description || '',
    coursework:  item.coursework                     // text  → array
      ? item.coursework.split(',').map(s => s.trim()).filter(Boolean)
      : [],
    result:      result,
    // Preserve images array from backend (objects with `image` URL). UI maps to URL.
    images:      Array.isArray(item.images) ? item.images : [],
    createdAt:   item.created_at  || item.createdAt  || null,
    modifiedAt:  item.modified_at || item.modifiedAt || null,
  };
}

function mapToBackend(item) {
  // Use explicit start_date/end_date if available; otherwise parse the year display string
  const dates = (item.start_date !== undefined)
    ? { start_date: item.start_date, end_date: item.end_date }
    : parseYearString(item.year);

  return {
    name:        item.title       || '',
    institution: item.institution || '',
    description: item.description || '',
    coursework:  Array.isArray(item.coursework)
      ? item.coursework.join(', ')
      : (item.coursework || ''),
    score:       item.percentage  || '',
    ...dates,
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export default function useEducations() {
  const [educations, setEducations] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchEducations();
      const list = (Array.isArray(data) ? data : []).map(mapFromBackend);
      setEducations(list);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload) => {
    const backendPayload = mapToBackend(payload);
    const created = await api.createEducation(backendPayload);
    const mapped  = mapFromBackend(created);
    setEducations(s => [mapped, ...s]);
    return mapped;
  }, []);

  const update = useCallback(async (id, payload) => {
    const backendPayload = mapToBackend(payload);
    const updated = await api.updateEducation(id, backendPayload);
    const mapped  = mapFromBackend(updated);
    setEducations(s => s.map(e => e.id === id ? { ...e, ...mapped } : e));
    return mapped;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteEducation(id);
    setEducations(s => s.filter(e => e.id !== id));
    return true;
  }, []);

  const uploadResultFile = useCallback(async (id, file) => {
    const updated = await api.uploadResult(id, file);
    const mapped  = mapFromBackend(updated);
    setEducations(s => s.map(e => e.id === id ? { ...e, ...mapped } : e));
    return mapped;
  }, []);

  const uploadImage = useCallback(async (educationId, file, title) => {
    const created = await api.uploadEducationImage(educationId, file, title);
    // backend returns the created image object; append to education.images
    setEducations(s => s.map(e => e.id === educationId ? { ...e, images: [...(e.images||[]), created] } : e));
    return created;
  }, []);

  const removeImage = useCallback(async (educationId, imageId) => {
    await api.deleteEducationImage(educationId, imageId);
    setEducations(s => s.map(e => e.id === educationId ? { ...e, images: (e.images||[]).filter(img => img.id !== imageId) } : e));
    return true;
  }, []);

  return {
    educations,
    loading,
    error,
    refetch:         load,
    createEducation: create,
    updateEducation: update,
    deleteEducation: remove,
    uploadResult:    uploadResultFile,
    uploadImage,
    deleteImage: removeImage,
  };
}
