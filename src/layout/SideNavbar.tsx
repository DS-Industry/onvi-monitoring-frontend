import { useEffect, useRef, useState, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import routes from '@/routes';

import { useTranslation } from 'react-i18next';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import useAuthStore from '@/config/store/authSlice';
import useUserStore from '@/config/store/userSlice';

import Sider from 'antd/es/layout/Sider';

import OnviLogo from '@/assets/OnviLogo.svg';
import OnviSmallLogo from '@/assets/OnviSmallLogo.svg';
import NotificationYes from '@icons/Notification_Yes.svg?react';
import ArrowRight from '@icons/keyboard_arrow_right.svg?react';
import Avatar from '@/components/ui/Avatar';
import { Can } from '@/permissions/Can';

import { RouteItem } from '@/routes';

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 80;
const MOBILE_SUBMENU_MAX_WIDTH = 320;

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  // Track which submenu path is open (array of route names by level)
  const [openSubmenuPath, setOpenSubmenuPath] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const hoverRef = useRef(false);

  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const user = useUserStore();
  const userPermissions = useAuthStore(state => state.permissions);

  // Check if any submenu contains the current route path (for styling active parent)
  const isSubmenuActive = useCallback(
    (submenu?: RouteItem[]): boolean =>
      submenu ? submenu.some(child => child.path === location.pathname) : false,
    [location.pathname]
  );

  // Effect to handle hover open/close and outside click to reset submenu
  useEffect(() => {
    hoverRef.current = isHovered;

    if (!isMobile && isHovered && !isOpen) {
      setIsOpen(true);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (isMobile) return;
      const sidebarElement = document.getElementById('sidebar');
      const sideNavElements = document.querySelectorAll('.side-nav');
      let clickedInside = false;

      sideNavElements.forEach(el => {
        if (el.contains(e.target as Node)) clickedInside = true;
      });

      if (
        sidebarElement &&
        !sidebarElement.contains(e.target as Node) &&
        !clickedInside
      ) {
        setOpenSubmenuPath([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHovered, isMobile, isOpen, setIsOpen]);

  // Check if submenu is active at specific level
  const isSubmenuOpenAtLevel = useCallback(
    (level: number, name: string) => openSubmenuPath[level] === name,
    [openSubmenuPath]
  );

  // Open submenu at level (and close deeper levels)
  const openSubmenuAtLevel = useCallback((level: number, name: string) => {
    setOpenSubmenuPath(prev => [...prev.slice(0, level), name]);
  }, []);

  // Close last opened submenu (used on mobile submenu close button)
  const closeLastSubmenu = useCallback(() => {
    setOpenSubmenuPath(prev => prev.slice(0, prev.length - 1));
  }, []);

  // Keyboard handler for mobile submenu overlay (Escape to close last submenu)
  const handleMobileSubmenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && openSubmenuPath.length > 0) {
        e.preventDefault();
        closeLastSubmenu();
      }
    },
    [closeLastSubmenu, openSubmenuPath.length]
  );

  // Recursive render for sidebar nav items (desktop + mobile base)
  const renderNavItem = useCallback(
    (item: RouteItem, level = 0): React.ReactElement => (
      <Can
        key={item.name}
        requiredPermissions={item.permissions || []}
        userPermissions={userPermissions}
      >
        {allowed =>
          allowed && (
            <div key={item.name} className="side-nav relative">
              <NavLink
                to={item.subMenu ? '#' : item.path}
                onClick={e => {
                  if (item.subMenu) {
                    e.preventDefault();
                    openSubmenuAtLevel(level, item.name);
                  } else {
                    setOpenSubmenuPath([]);
                    if (isMobile) setIsOpen(false);
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center py-1.5 px-2 mx-4 rounded transition font-semibold text-sm ${
                    item.subMenu
                      ? isSubmenuActive(item.subNav)
                        ? 'bg-opacity01/30 text-primary01'
                        : isSubmenuOpenAtLevel(level, item.name)
                          ? 'bg-opacity01/30 text-primary01'
                          : 'text-text02'
                      : isActive
                        ? 'bg-opacity01/30 text-primary01'
                        : 'text-text02'
                  } hover:bg-opacity01/30 hover:text-primary01`
                }
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
                {isOpen && <span>{t(`routes.${item.name}`)}</span>}
                {item.subMenu && isOpen && <ArrowRight className="ml-auto" />}
              </NavLink>

              {/* Desktop submenu panel */}
              {!isMobile &&
                isSubmenuOpenAtLevel(level, item.name) &&
                item.subNav && (
                  <div
                    className="fixed top-0 bottom-0 w-64 overflow-y-auto bg-white p-4 shadow-md"
                    style={{
                      left: `${isOpen ? SIDEBAR_WIDTH + level * SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH + level * SIDEBAR_WIDTH}px`,
                      zIndex: 9999 + level,
                    }}
                  >
                    {item.subNav.map(
                      subItem =>
                        subItem.isSidebar && renderNavItem(subItem, level + 1)
                    )}
                  </div>
                )}
            </div>
          )
        }
      </Can>
    ),
    [
      isMobile,
      isOpen,
      isSubmenuActive,
      isSubmenuOpenAtLevel,
      openSubmenuAtLevel,
      setIsOpen,
      t,
      userPermissions,
    ]
  );

  // Render mobile submenu sliding overlay
  const renderMobileSubmenuOverlay = () => {
    if (openSubmenuPath.length === 0) return null;

    let currentSubNav: RouteItem[] | undefined = routes;
    for (const name of openSubmenuPath) {
      const found: RouteItem | undefined = currentSubNav?.find(
        i => i.name === name
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
        onKeyDown={handleMobileSubmenuKeyDown}
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
                  allowed && (
                    <NavLink
                      to={item.subMenu ? '#' : item.path}
                      onClick={e => {
                        if (item.subMenu) {
                          e.preventDefault();
                          openSubmenuAtLevel(openSubmenuPath.length, item.name);
                        } else {
                          setOpenSubmenuPath([]);
                          setIsOpen(false);
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
                      aria-expanded={item.subMenu ? false : undefined} // submenu open state handled by overlay
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
                  )
                }
              </Can>
            ))}
        </nav>
      </div>
    );
  };

  return (
    <>
      {/* Mobile hamburger toggle button */}
      {isMobile && !isOpen && (
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 p-2 z-[9999] rounded-md bg-background02 hover:bg-background03 text-primary01 focus:outline-none focus:ring-2 focus:ring-primary01"
        >
          ☰
        </button>
      )}

      {/* Sidebar (desktop & mobile) */}
      <Sider
        id="sidebar"
        theme="dark"
        trigger={null}
        collapsible
        collapsed={!isOpen}
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        className="fixed h-full z-50"
        style={{
          background: '#1c1917',
          left: isMobile ? (isOpen ? 0 : -SIDEBAR_COLLAPSED_WIDTH) : 0,
          transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s',
        }}
        onMouseEnter={() => {
          if (!isMobile) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (!isMobile) {
            setIsHovered(false);
            setTimeout(() => {
              if (!hoverRef.current) {
                setIsOpen(false);
                setOpenSubmenuPath([]);
              }
            }, 300);
          }
        }}
      >
        <div className="h-full flex flex-col justify-between relative">
          <div>
            <div
              className={`flex items-center ${isOpen ? '' : 'justify-center'} py-5 px-4`}
            >
              <img
                src={isOpen ? OnviLogo : OnviSmallLogo}
                alt="ONVI"
                loading="lazy"
              />
            </div>

            <nav className="mt-5 text-sm grid gap-y-1">
              {routes.map(item => item.isSidebar && renderNavItem(item, 0))}
            </nav>
          </div>

          <div>
            <div
              className={`flex items-center ${!isOpen ? 'justify-center' : ''} py-2.5 px-4 rounded transition duration-200 hover:bg-opacity01/30 hover:text-primary01 text-text02 cursor-pointer`}
              onClick={() => navigate('/notifications')}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/notifications');
                }
              }}
              role="button"
              aria-label="Notifications"
            >
              <NotificationYes className={`${isOpen ? 'mr-2' : ''} text-xl`} />
              {isOpen && <span>{t('routes.notifications')}</span>}
            </div>

            <div
              className="mt-5 py-3 border-t-2 border-text02 flex items-center gap-2 px-4 cursor-pointer"
              onClick={() => navigate('/profile')}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/profile');
                }
              }}
              role="button"
              aria-label="Profile"
            >
              {user?.user?.avatar ? (
                <img
                  src={`https://storage.yandexcloud.net/onvi-business/avatar/user/${user?.user?.avatar}`}
                  alt="Profile"
                  className="rounded-full w-10 h-10 object-cover"
                  loading="lazy"
                />
              ) : (
                <Avatar
                  type="sidebar"
                  userName={{ name: user?.user?.name || '', middlename: '' }}
                />
              )}
              {isOpen && (
                <p className="text-text02 text-sm hidden md:block">
                  {user?.user?.name || ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </Sider>

      {/* Mobile submenu overlay */}
      {isMobile && renderMobileSubmenuOverlay()}
    </>
  );
};

export default Sidebar;
