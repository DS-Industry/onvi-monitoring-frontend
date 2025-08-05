import { useEffect, useRef, useState } from 'react';
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

const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) => {
  const [activePathStack, setActivePathStack] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const hoverRef = useRef(false);

  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const user = useUserStore();
  const userPermissions = useAuthStore(state => state.permissions);

  // Helper to check if submenu contains current location
  const isParentActive = (subMenu?: RouteItem[]): boolean =>
    subMenu ? subMenu.some(child => child.path === location.pathname) : false;

  useEffect(() => {
    hoverRef.current = isHovered;
    if (!isMobile && isHovered && !isOpen) setIsOpen(true);

    const handleClickOutside = (e: MouseEvent) => {
      if (isMobile) return;
      const sidebar = document.getElementById('sidebar');
      const sideNavs = document.querySelectorAll('.side-nav');
      let isInsideSidebar = false;

      sideNavs.forEach(el => {
        if (el.contains(e.target as Node)) isInsideSidebar = true;
      });

      if (sidebar && !sidebar.contains(e.target as Node) && !isInsideSidebar) {
        setActivePathStack([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHovered, isMobile, isOpen]);

  const handleSiderHover = {
    onMouseEnter: () => !isMobile && setIsHovered(true),
    onMouseLeave: () => {
      if (!isMobile) {
        setIsHovered(false);
        setTimeout(() => {
          if (!hoverRef.current) {
            setIsOpen(false);
            setActivePathStack([]);
          }
        }, 300);
      }
    },
  };

  const isActiveAtLevel = (level: number, name: string) =>
    activePathStack[level] === name;

  // Set or update the active path stack at a given level
  const openAtLevel = (level: number, name: string) => {
    setActivePathStack(prev => [...prev.slice(0, level), name]);
  };

  // Close the mobile submenu (pop last level)
  const closeMobileSubMenu = () => {
    setActivePathStack(prev => prev.slice(0, prev.length - 1));
  };

  // Render nav item (recursive)
  const renderNavItem = (item: RouteItem, level = 0): React.ReactElement => (
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
                  if (isMobile) {
                    openAtLevel(level, item.name);
                  } else {
                    openAtLevel(level, item.name);
                  }
                } else {
                  setActivePathStack([]);
                  setIsOpen(false); // Optional: close sidebar on navigation in mobile
                }
              }}
              className={({ isActive }) =>
                `flex items-center py-1.5 px-2 mx-4 rounded transition font-semibold text-sm ${
                  item.subMenu
                    ? isParentActive(item.subNav)
                      ? 'bg-opacity01/30 text-primary01'
                      : isActiveAtLevel(level, item.name)
                        ? 'bg-opacity01/30 text-primary01'
                        : 'text-text02'
                    : isActive
                      ? 'bg-opacity01/30 text-primary01'
                      : 'text-text02'
                } hover:bg-opacity01/30 hover:text-primary01`
              }
            >
              {item.icon && <item.icon className={isOpen ? 'mr-2' : ''} />}
              {isOpen && <span>{t(`routes.${item.name}`)}</span>}
              {item.subMenu && isOpen && <ArrowRight className="ml-auto" />}
            </NavLink>

            {/* Desktop submenu */}
            {!isMobile && isActiveAtLevel(level, item.name) && item.subNav && (
              <div
                className="fixed top-0 bottom-0 w-64 overflow-y-auto bg-white p-4 shadow-md"
                style={{
                  left: `${isOpen ? 256 + level * 256 : 80 + level * 256}px`,
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
  );

  // Render mobile submenu panel sliding from left
  const renderMobileSubMenu = () => {
    if (activePathStack.length === 0) return null;

    let currentSubNav: RouteItem[] | undefined = routes;
    for (const name of activePathStack) {
      const found: RouteItem | undefined = currentSubNav?.find(
        i => i.name === name
      );
      currentSubNav = found?.subNav;
      if (!currentSubNav) break;
    }

    if (!currentSubNav) return null;

    return (
      <div
        className="fixed top-0 left-0 bottom-0 w-full max-w-xs bg-white z-[10000] p-4 shadow-lg flex flex-col"
        style={{ transition: 'transform 0.3s ease' }}
      >
        <button
          onClick={closeMobileSubMenu}
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
                          openAtLevel(activePathStack.length, item.name);
                        } else {
                          setActivePathStack([]);
                          setIsOpen(false); // close sidebar on navigation
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
      {/* Mobile burger button */}
      {isMobile && !isOpen && (
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 p-2 z-[9999] rounded-md bg-background02 hover:bg-background03 text-primary01 focus:outline-none focus:ring-2 focus:ring-primary01"
        >
          ☰
        </button>
      )}

      {/* Desktop & Mobile Sidebar */}
      <Sider
        id="sidebar"
        theme="dark"
        trigger={null}
        collapsible
        collapsed={!isOpen}
        width={256}
        collapsedWidth={80}
        className="fixed h-full z-50"
        style={{
          background: '#1c1917',
          left: isMobile ? (isOpen ? 0 : -80) : 0,
          transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s',
        }}
        {...handleSiderHover}
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
              className={`flex items-center ${!isOpen && 'justify-center'} py-2.5 px-4 rounded transition duration-200 hover:bg-opacity01/30 hover:text-primary01 text-text02 cursor-pointer`}
              onClick={() => navigate('/notifications')}
            >
              <NotificationYes className={`${isOpen && 'mr-2'} text-xl`} />
              {isOpen && <span>{t('routes.notifications')}</span>}
            </div>

            <div
              className="mt-5 py-3 border-t-2 border-text02 flex items-center gap-2 px-4 cursor-pointer"
              onClick={() => navigate('/profile')}
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
      {isMobile && renderMobileSubMenu()}
    </>
  );
};

export default Sidebar;
