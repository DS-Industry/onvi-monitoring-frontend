// Sidebar.tsx
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import Sider from 'antd/es/layout/Sider';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import OnviLogo from '@/assets/OnviLogo.svg';
import OnviSmallLogo from '@/assets/OnviSmallLogo.svg';
import NotificationYes from '@icons/Notification_Yes.svg?react';
import Avatar from '@/components/ui/Avatar';
import useUserStore from '@/config/store/userSlice';

import SidebarNavItem from './SideNavbarItem';
import MobileSubmenuOverlay from './MobileSubmenuOverlay';
import { useSidebarNavigation } from './useSidebarNavigation';

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 80;

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const user = useUserStore();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const [isHovered, setIsHovered] = useState(false);
  const hoverRef = useRef(false);

  const { setOpenSubmenuPath } = useSidebarNavigation();

  useEffect(() => {
    hoverRef.current = isHovered;
    if (!isMobile && isHovered && !isOpen) setIsOpen(true);

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
  }, [isHovered, isMobile, isOpen, setIsOpen, setOpenSubmenuPath]);

  return (
    <>
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
        onMouseEnter={() => !isMobile && setIsHovered(true)}
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
            <SidebarNavItem isOpen={isOpen} onClick={() => setIsOpen(false)} />
          </div>

          <div>
            <div
              className={`flex items-center ${!isOpen ? 'justify-center' : ''} py-2.5 px-4 rounded transition duration-200 hover:bg-opacity01/30 hover:text-primary01 text-text02 cursor-pointer`}
              onClick={() => navigate('/notifications')}
              tabIndex={0}
              role="button"
              aria-label="Notifications"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/notifications');
                }
              }}
            >
              <NotificationYes className={`${isOpen ? 'mr-2' : ''} text-xl`} />
              {isOpen && <span>Notifications</span>}
            </div>

            <div
              className="mt-5 py-3 border-t-2 border-text02 flex items-center gap-2 px-4 cursor-pointer"
              onClick={() => navigate('/profile')}
              tabIndex={0}
              role="button"
              aria-label="Profile"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/profile');
                }
              }}
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

      {isMobile && <MobileSubmenuOverlay onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Sidebar;
