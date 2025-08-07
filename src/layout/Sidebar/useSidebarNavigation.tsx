import {
  useCallback,
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

interface SidebarNavigationContextType {
  openSubmenuPath: string[];
  setOpenSubmenuPath: (path: string[]) => void;
  openSubmenuAtLevel: (level: number, name: string) => void;
  closeLastSubmenu: () => void;
  resetSubmenu: () => void;
  isSubmenuOpenAtLevel: (level: number, name: string) => boolean;
}

const SidebarNavigationContext =
  createContext<SidebarNavigationContextType | null>(null);

export function SidebarNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
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

  const value = {
    openSubmenuPath,
    setOpenSubmenuPath,
    openSubmenuAtLevel,
    closeLastSubmenu,
    resetSubmenu,
    isSubmenuOpenAtLevel,
  };

  return (
    <SidebarNavigationContext.Provider value={value}>
      {children}
    </SidebarNavigationContext.Provider>
  );
}

export function useSidebarNavigation() {
  const context = useContext(SidebarNavigationContext);
  if (!context) {
    throw new Error(
      'useSidebarNavigation must be used within SidebarNavigationProvider'
    );
  }
  return context;
}
