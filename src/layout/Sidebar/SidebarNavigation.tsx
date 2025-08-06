import { NavLink, useLocation } from 'react-router-dom';

// utils
import { useTranslation } from 'react-i18next';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import { useSidebarNavigation } from './useSidebarNavigation';
import useAuthStore from '@/config/store/authSlice';

import routes, { RouteItem } from '@/routes';

// components
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { Can } from '@/permissions/Can';

// icons
import ArrowRight from '@icons/keyboard_arrow_right.svg?react';

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 80;

interface SidebarNavigationProps {
  isOpen: boolean;
  onClick: () => void;
}

const SidebarNavigation = ({ isOpen, onClick }: SidebarNavigationProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const userPermissions = useAuthStore(state => state.permissions);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const {
    setOpenSubmenuPath,
    openSubmenuAtLevel,
    isSubmenuOpenAtLevel,
    closeLastSubmenu,
  } = useSidebarNavigation();

  const isSubmenuActive = (submenu?: RouteItem[]): boolean => {
    if (!submenu) return false;

    return submenu.some(child => {
      if (child.path === location.pathname) return true;
      if (child.subNav) return isSubmenuActive(child.subNav);
      return false;
    });
  };

  const renderNavItem = (
    item: RouteItem,
    level = 0
  ): React.ReactElement | null => (
    <Can
      key={item.name}
      requiredPermissions={item.permissions || []}
      userPermissions={userPermissions}
    >
      {(allowed: boolean) =>
        allowed ? (
          <div key={item.name} className="side-nav relative">
            <NavLink
              to={item.subMenu ? '#' : item.path}
              onClick={e => {
                if (item.subMenu) {
                  e.preventDefault();
                  openSubmenuAtLevel(level, item.name);
                } else {
                  setOpenSubmenuPath([]);
                  onClick();
                }
              }}
              className={({ isActive }) => {
                const isOpenSubmenu = isSubmenuOpenAtLevel(level, item.name);
                const isSubmenuHighlighted = isSubmenuActive(item.subNav);

                const active = item.subMenu
                  ? isOpenSubmenu || isSubmenuHighlighted
                  : isActive;

                const textColor = active
                  ? level > 0
                    ? 'text-black'
                    : 'text-primary01'
                  : 'text-text02';
                const hoverTextColor =
                  level > 0 ? 'hover:text-black' : 'hover:text-primary01';

                // bg highlight only when active or hovered (via hover:bg-opacity01/30)
                const bgClass = active ? 'bg-opacity01/30' : '';

                return [
                  'flex items-center py-1.5 px-2 mx-4 rounded transition font-semibold duration-300 ease-in-out text-sm',
                  bgClass,
                  textColor,
                  hoverTextColor,
                  'hover:bg-opacity01/30',
                ]
                  .filter(Boolean)
                  .join(' ');
              }}
              aria-haspopup={!!item.subMenu}
              aria-expanded={
                item.subMenu
                  ? isSubmenuOpenAtLevel(level, item.name)
                  : undefined
              }
              tabIndex={0}
              onKeyDown={e => {
                if (item.subMenu && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  openSubmenuAtLevel(level, item.name);
                }
              }}
            >
              {item.icon && <item.icon className={isOpen ? 'mr-2' : ''} />}

              <span
                className={`inline-block overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 max-w-[180px] ml-2' : 'opacity-0 max-w-0 ml-0'}`}
              >
                {t(`routes.${item.name}`)}
              </span>
              {item.subMenu && isOpen && <ArrowRight className="ml-auto" />}
            </NavLink>

            {/* Nested submenu panel (mobile only) */}
            {item.subNav &&
              isSubmenuOpenAtLevel(level, item.name) &&
              isOpen && (
                <div
                  className="fixed top-0 bottom-0 w-64 overflow-y-auto bg-white p-2 shadow-md"
                  style={{
                    left: isMobile
                      ? 0
                      : `${(isOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH) + level * SIDEBAR_WIDTH}px`,
                    zIndex: 9999 + level,
                  }}
                >
                  {isMobile && (
                    <div className="mb-4 flex justify-end">
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={closeLastSubmenu}
                        aria-label="Close submenu"
                      />
                    </div>
                  )}

                  {item.subNav.map(
                    subItem =>
                      subItem.isSidebar && renderNavItem(subItem, level + 1)
                  )}
                </div>
              )}
          </div>
        ) : null
      }
    </Can>
  );

  return (
    <nav className="mt-5 text-sm grid gap-y-1">
      {routes.map(item => item.isSidebar && renderNavItem(item, 0))}
    </nav>
  );
};

export default SidebarNavigation;
