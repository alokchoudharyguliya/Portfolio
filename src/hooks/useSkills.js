import { useEffect, useState, useCallback } from 'react';
import * as api from '../api/skills';

function mapFromBackend(item) {
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    proficiency: item.proficiency || 0,
    yearsExperience: item.years_of_experience || 0,
    projectsUsed: item.count_of_projects || 0,
    certificateLink: item.certificate_url || '',
    image: item.image_url || null,          // ← separate endpoint returns image_url
    createdAt: item.created_at || item.createdAt || null,
    modifiedAt: item.modified_at || item.modifiedAt || null,
  };
}

function mapToBackend(item) {
  // Image is handled by the dedicated /api/skill/{id}/image/ endpoint — never included here
  return {
    name: item.name,
    description: item.description,
    proficiency: item.proficiency,
    years_of_experience: item.yearsExperience,
    count_of_projects: item.projectsUsed,
    certificate_url: item.certificateLink,
  };
}

export default function useSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchSkills();
      const list = (Array.isArray(data) ? data : []).map(mapFromBackend);
      setSkills(list);
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
    const backendPayload = mapToBackend(payload);
    const created = await api.createSkill(backendPayload);
    const mapped = mapFromBackend(created);
    setSkills((s) => [mapped, ...s]);
    return mapped;
  }, []);

  const update = useCallback(async (id, payload) => {
    const backendPayload = mapToBackend(payload);
    const updated = await api.updateSkill(id, backendPayload);
    const mapped = mapFromBackend(updated);
    setSkills((s) => s.map(skill => skill.id === id ? { ...skill, ...mapped } : skill));
    return mapped;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteSkill(id);
    setSkills((s) => s.filter(skill => skill.id !== id));
    return true;
  }, []);

  // ── Image ────────────────────────────────────────────────────────────────

  const uploadImage = useCallback(async (id, file) => {
    const result = await api.uploadSkillImage(id, file);
    // SkillImageSerializer returns image_url (absolute URL built by request)
    const newImageUrl = result.image_url || result.image || null;
    setSkills((s) => s.map(skill => skill.id === id ? { ...skill, image: newImageUrl } : skill));
    return result;
  }, []);

  const removeImage = useCallback(async (id) => {
    await api.deleteSkillImage(id);
    setSkills((s) => s.map(skill => skill.id === id ? { ...skill, image: null } : skill));
  }, []);

  return {
    skills,
    loading,
    error,
    refetch: load,
    createSkill: create,
    updateSkill: update,
    deleteSkill: remove,
    uploadImage,
    removeImage,
  };
}
