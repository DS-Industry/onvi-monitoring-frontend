// useSidebarNavigation.ts
import { useCallback, useMemo, useState } from 'react';

export function useSidebarNavigation() {
  const [openSubmenuPath, setOpenSubmenuPath] = useState<string[]>([]);

  const openSubmenuAtLevel = useCallback((level: number, name: string) => {
    setOpenSubmenuPath(prev => {
      const newPath = [...prev.slice(0, level), name];
      return newPath;
    });
  }, []);

  const closeLastSubmenu = useCallback(() => {
    setOpenSubmenuPath(prev => prev.slice(0, -1));
  }, []);

  const resetSubmenu = useCallback(() => {
    setOpenSubmenuPath([]);
  }, []);

  const isSubmenuOpenAtLevel = useCallback(
    (level: number, name: string) => {
      return openSubmenuPath[level] === name;
    },
    [openSubmenuPath]
  );

  return useMemo(
    () => ({
      openSubmenuPath,
      setOpenSubmenuPath,
      openSubmenuAtLevel,
      closeLastSubmenu,
      resetSubmenu,
      isSubmenuOpenAtLevel,
    }),
    [
      openSubmenuPath,
      openSubmenuAtLevel,
      closeLastSubmenu,
      resetSubmenu,
      isSubmenuOpenAtLevel,
    ]
  );
}
