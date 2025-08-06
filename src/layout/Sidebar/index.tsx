import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// utils
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import useUserStore from '@/config/store/userSlice';
import {
  useSidebarNavigation,
  SidebarNavigationProvider,
} from './useSidebarNavigation';

// components
import Sider from 'antd/es/layout/Sider';
import SidebarNavigation from './SidebarNavigation';

// icons
import OnviLogo from '@/assets/OnviLogo.svg';
import OnviSmallLogo from '@/assets/OnviSmallLogo.svg';
import NotificationYes from '@icons/Notification_Yes.svg?react';
import { MenuOutlined, DoubleLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 80;

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const SidebarContent = ({ isOpen, setIsOpen }: SidebarProps) => {
  const user = useUserStore();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { t } = useTranslation();

  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { setOpenSubmenuPath, resetSubmenu } = useSidebarNavigation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        resetSubmenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setOpenSubmenuPath]);

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(isHovered);
    }
  }, [isHovered, isMobile, setIsOpen]);

  return (
    <SidebarNavigationProvider>
      {isMobile && !isOpen && (
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-[9999] flex items-center justify-center w-10 h-10 rounded-md bg-[#d3d4d8] text-white shadow-lg hover:bg-background03 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary01"
        >
          <MenuOutlined className="text-xl" />
        </button>
      )}

      <Sider
        ref={sidebarRef}
        id="sidebar"
        theme="dark"
        trigger={null}
        collapsible
        collapsed={!isOpen}
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        className={`fixed h-full z-50 bg-[#1c1917] transition-all duration-300 ease-in-out ${
          isMobile ? (isOpen ? 'left-0' : '-left-20') : 'left-0'
        }`}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => {
          if (!isMobile) {
            resetSubmenu();
            setIsHovered(false);
          }
        }}
        onClick={() => {
          if (!isHovered) {
            setIsHovered(true);
          }
        }}
      >
        <div className="h-full flex flex-col justify-between relative">
          {/* Logo */}
          <div>
            <div
              className={`flex items-center ${isOpen ? '' : 'justify-center'} py-5 px-4`}
            >
              <div className="flex items-center relative transition-all duration-500">
                <img
                  src={isOpen ? OnviLogo : OnviSmallLogo}
                  alt="ONVI"
                  loading="lazy"
                  className="transition-all duration-300"
                />
              </div>
              {isMobile && (
                <button
                  className="ml-auto flex items-center justify-center border border-primary01 text-primary01 p-2 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <DoubleLeftOutlined />
                </button>
              )}
            </div>

            <SidebarNavigation
              isOpen={isOpen}
              onClick={() => {
                setIsOpen(false);
                setIsHovered(false);
                resetSubmenu();
              }}
            />
          </div>

          {/* Bottom Section */}
          <div>
            <div
              className={`flex items-center ${!isOpen ? 'justify-center' : ''} py-2.5 px-4 rounded hover:bg-opacity01/30 hover:text-primary01 text-text02 cursor-pointer`}
              onClick={() => navigate('/notifications')}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/notifications');
                }
              }}
            >
              <NotificationYes className={`${isOpen ? 'mr-2' : ''} text-xl`} />
              <span
                className={`inline-block whitespace-nowrap overflow-hidden transition-[width,opacity,margin] duration-300 ease-in-out ${
                  isOpen ? 'w-auto opacity-100 ml-0' : 'w-0 opacity-0 ml-0'
                }`}
                style={{ width: isOpen ? 'auto' : 0 }}
              >
                {t('routes.notifications')}
              </span>
            </div>

            <div
              className="mt-5 py-3 border-t border-text02 flex items-center gap-2 px-4 cursor-pointer"
              onClick={() => navigate('/profile')}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/profile');
                }
              }}
            >
              {user?.user?.avatar ? (
                <img
                  src={`${import.meta.env.VITE_S3_CLOUD}/avatar/user/${user?.user?.avatar}`}
                  alt="Profile"
                  className="rounded-full w-10 h-10 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary01 text-text02 flex items-center justify-center text-sm font-medium shrink-0">
                  {user?.user?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div
                className={`text-text02 text-sm hidden md:block transition-all duration-300 ease-in-out ${
                  isOpen ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {user?.user?.name || ''}
              </div>
            </div>
          </div>
        </div>
      </Sider>
    </SidebarNavigationProvider>
  );
};

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  return (
    <SidebarNavigationProvider>
      <SidebarContent isOpen={isOpen} setIsOpen={setIsOpen} />
    </SidebarNavigationProvider>
  );
};

export default Sidebar;
