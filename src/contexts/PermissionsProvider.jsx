import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const PermissionsContext = createContext(null);

export function PermissionsProvider({ children }) {
  const [permissions, setPermissions] = useState({ is_superuser: false });
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/me/permissions/', { credentials: 'include', headers: { Accept: 'application/json' } });
      if (!res.ok) {
        setPermissions({ is_superuser: false });
        setLoading(false);
        return;
      }
      const json = await res.json().catch(() => ({}));
      setPermissions({ is_superuser: Boolean(json?.data?.is_superuser) });
    } catch (e) {
      setPermissions({ is_superuser: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const value = {
    ...permissions,
    isSuperuser: Boolean(permissions.is_superuser),
    loading,
    refreshPermissions: fetchPermissions,
  };

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (ctx === null) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return ctx;
}

export default PermissionsProvider;
