// MobileSubmenuOverlay.tsx
import { NavLink } from 'react-router-dom';
import ArrowRight from '@icons/keyboard_arrow_right.svg?react';
import { useTranslation } from 'react-i18next';
import { Can } from '@/permissions/Can';
import routes, { RouteItem } from '@/routes';
import useAuthStore from '@/config/store/authSlice';
import { useSidebarNavigation } from './useSidebarNavigation';

interface Props {
  onClick: () => void;
}

const MOBILE_SUBMENU_MAX_WIDTH = 320;

const MobileSubmenuOverlay = ({ onClick }: Props) => {
  const { t } = useTranslation();
  const userPermissions = useAuthStore(state => state.permissions);

  const {
    openSubmenuPath,
    setOpenSubmenuPath,
    openSubmenuAtLevel,
    closeLastSubmenu,
  } = useSidebarNavigation();

  let currentSubNav: RouteItem[] | undefined = routes;

  for (const name of openSubmenuPath) {
    const found: RouteItem | undefined = currentSubNav?.find(
      (item: RouteItem) => item.name === name
    );
    currentSubNav = found?.subNav;
    if (!currentSubNav) break;
  }

  if (!currentSubNav) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Submenu"
      tabIndex={-1}
      onKeyDown={e => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeLastSubmenu();
        }
      }}
      className="fixed top-0 left-0 bottom-0 w-full max-w-xs bg-white z-[10000] p-4 shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out"
      style={{
        transform:
          openSubmenuPath.length > 0 ? 'translateX(0)' : `translateX(-100%)`,
        width: MOBILE_SUBMENU_MAX_WIDTH,
      }}
    >
      <button
        onClick={closeLastSubmenu}
        aria-label="Close submenu"
        className="self-end mb-4 p-2 rounded hover:bg-gray-200"
      >
        ✕
      </button>

      <nav className="flex flex-col gap-2 overflow-y-auto">
        {currentSubNav
          .filter(i => i.isSidebar)
          .map(item => (
            <Can
              key={item.name}
              requiredPermissions={item.permissions || []}
              userPermissions={userPermissions}
            >
              {allowed =>
                allowed ? (
                  <NavLink
                    to={item.subMenu ? '#' : item.path}
                    onClick={e => {
                      if (item.subMenu) {
                        e.preventDefault();
                        openSubmenuAtLevel(openSubmenuPath.length, item.name);
                      } else {
                        setOpenSubmenuPath([]);
                        onClick();
                      }
                    }}
                    className={({ isActive }) =>
                      `block py-2 px-4 rounded font-semibold text-sm ${
                        item.subMenu
                          ? 'text-text02 hover:bg-gray-100 hover:text-primary01'
                          : isActive
                            ? 'bg-opacity01/30 text-primary01'
                            : 'text-text02 hover:bg-gray-100 hover:text-primary01'
                      }`
                    }
                    aria-haspopup={!!item.subMenu}
                    aria-expanded={item.subMenu ? false : undefined}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (
                        item.subMenu &&
                        (e.key === 'Enter' || e.key === ' ')
                      ) {
                        e.preventDefault();
                        openSubmenuAtLevel(openSubmenuPath.length, item.name);
                      }
                    }}
                  >
                    {item.icon && <item.icon className="inline mr-2" />}
                    {t(`routes.${item.name}`)}
                    {item.subMenu && <ArrowRight className="inline ml-2" />}
                  </NavLink>
                ) : null
              }
            </Can>
          ))}
      </nav>
    </div>
  );
};

export default MobileSubmenuOverlay;
