import React, { useCallback, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';

// utils
import { useTranslation } from 'react-i18next';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import { useSidebarNavigation } from './useSidebarNavigation';
import useAuthStore from '@/config/store/authSlice';

import routes, { RouteItem } from '@/routes';

// components
import { Button } from 'antd';
import { CloseOutlined, LockOutlined } from '@ant-design/icons';
import { Can } from '@/permissions/Can';
import useSubscriptionStore from '@/config/store/subscriptionSlice';
import {
  canAccessTariff,
  getFeatureCodesFromPermissions,
  type TariffRequirements,
} from '@/subscription/tariffAccess';

// icons
import ArrowRight from '@icons/keyboard_arrow_right.svg?react';

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 80;

interface SidebarNavigationProps {
  isOpen: boolean;
  onClick: () => void;
  onNavigate: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  isOpen,
  onClick,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const userPermissions = useAuthStore(state => state.permissions);
  const activeSubscription = useSubscriptionStore(
    state => state.activeSubscription
  );
  const subscriptionStatus = useSubscriptionStore(state => state.status);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const {
    setOpenSubmenuPath,
    openSubmenuAtLevel,
    isSubmenuOpenAtLevel,
    closeLastSubmenu,
  } = useSidebarNavigation();

  const isSubmenuActive = useCallback(
    (submenu?: RouteItem[]): boolean => {
      return !!submenu?.some(
        child =>
          child.path === location.pathname ||
          (child.subNav && isSubmenuActive(child.subNav))
      );
    },
    [location.pathname]
  );

  const renderNavItem = useCallback(
    (
      item: RouteItem,
      level = 0,
      inheritedRequirements?: TariffRequirements
    ): React.ReactNode => {
      const {
        name,
        path,
        icon: Icon,
        subMenu,
        subNav,
        permissions,
        isHr,
        titleName,
        subNavHeading,
      } = item;

      const effectiveRequirements: TariffRequirements = {
        requiredTariffFeatures:
          item.requiredTariffFeatures ??
          inheritedRequirements?.requiredTariffFeatures,
        requiredTariffFeaturesMode:
          item.requiredTariffFeaturesMode ??
          inheritedRequirements?.requiredTariffFeaturesMode,
        requiredPlanCodes:
          item.requiredPlanCodes ?? inheritedRequirements?.requiredPlanCodes,
        tariffFallback: item.tariffFallback ?? inheritedRequirements?.tariffFallback,
      };

      return (
        <Can
          key={name}
          requiredPermissions={permissions || []}
          userPermissions={userPermissions}
        >
          {(allowed: boolean) =>
            allowed ? (() => {
              const tariffAccess = canAccessTariff(activeSubscription, subscriptionStatus, {
                requiredTariffFeatures:
                  effectiveRequirements.requiredTariffFeatures?.length
                    ? effectiveRequirements.requiredTariffFeatures
                    : getFeatureCodesFromPermissions(item.permissions || []),
                requiredTariffFeaturesMode:
                  effectiveRequirements.requiredTariffFeatures?.length
                    ? effectiveRequirements.requiredTariffFeaturesMode
                    : 'any',
                requiredPlanCodes: effectiveRequirements.requiredPlanCodes,
                tariffFallback: effectiveRequirements.tariffFallback,
              });
              const isTariffLocked = !tariffAccess.pending && !tariffAccess.allowed;

              return (
                <div className="side-nav relative">
                {titleName && (
                  <div className="py-1 mx-4 font-normal text-[14px] leading-[143%] tracking-[0.02em] uppercase text-text02">
                    {t(`routes.${titleName}`)}
                  </div>
                )}
                <NavLink
                  to={subMenu ? '#' : path}
                  onClick={e => {
                    if (!isOpen) {
                      onClick();
                    }

                    if (subMenu) {
                      e.preventDefault();
                      openSubmenuAtLevel(level, name);
                      return;
                    }

                    setOpenSubmenuPath([]);
                    onNavigate();
                  }}
                  className={({ isActive }) => {
                    const isOpenSubmenu = isSubmenuOpenAtLevel(level, name);
                    const isSubmenuHighlighted = isSubmenuActive(subNav);

                    const active = subMenu
                      ? isOpenSubmenu || isSubmenuHighlighted
                      : isActive;

                    const textColor = active
                      ? level > 0
                        ? 'text-black'
                        : 'text-primary01'
                      : 'text-text02';
                    const hoverTextColor =
                      level > 0 ? 'hover:text-black' : 'hover:text-primary01';

                    return clsx(
                      'flex items-center py-1.5 px-2 mx-4 rounded transition font-semibold duration-300 ease-in-out text-sm',
                      active && 'bg-opacity01/30',
                      isTariffLocked && 'opacity-80',
                      textColor,
                      hoverTextColor,
                      'hover:bg-opacity01/30'
                    );
                  }}
                  aria-haspopup={!!subMenu}
                  aria-expanded={
                    subMenu ? isSubmenuOpenAtLevel(level, name) : undefined
                  }
                  tabIndex={0}
                  data-route-path={path}
                  data-tariff-locked={isTariffLocked ? 'true' : 'false'}
                  onKeyDown={e => {
                    if (subMenu && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      openSubmenuAtLevel(level, name);
                    }
                  }}
                >
                  {Icon && <Icon className={isOpen ? 'mr-2' : ''} />}

                  <span
                    className={clsx(
                      'inline-block transition-all duration-300 ease-in-out',
                      isOpen
                        ? 'opacity-100 max-w-[300px] ml-2'
                        : 'opacity-0 max-w-0 ml-0'
                    )}
                  >
                    {t(`routes.${name}`)}
                  </span>

                  {isTariffLocked && isOpen && (
                    <LockOutlined className="ml-1 text-text02" />
                  )}
                  {subMenu && isOpen && <ArrowRight className="ml-auto" />}
                </NavLink>

                {isHr && <hr className="my-3" />}

                {subNav && isSubmenuOpenAtLevel(level, name) && isOpen && (
                  <div
                    className="fixed top-0 bottom-0 w-64 overflow-y-auto bg-white p-2 shadow-md pt-5"
                    style={{
                      left: isMobile
                        ? 0
                        : (isOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH) +
                          level * SIDEBAR_WIDTH,
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
                    {subNavHeading && subNavHeading !== '' && (
                      <div className="py-1 mx-4 text-text02 mb-3 font-normal text-[14px] leading-[143%] tracking-[0.02em] uppercase">
                        {t(`routes.${subNavHeading}`)}
                      </div>
                    )}
                    {subNav.map(
                      subItem =>
                        subItem.isSidebar &&
                        renderNavItem(subItem, level + 1, effectiveRequirements)
                    )}
                  </div>
                )}
              </div>
              );
            })() : null
          }
        </Can>
      );
    },
    [
      isOpen,
      onClick,
      onClick,
      setOpenSubmenuPath,
      isSubmenuOpenAtLevel,
      openSubmenuAtLevel,
      closeLastSubmenu,
      isSubmenuActive,
      isMobile,
      userPermissions,
      activeSubscription,
      subscriptionStatus,
      t,
      location.pathname,
    ]
  );

  const navItems = useMemo(
    () => routes.map(item => item.isSidebar && renderNavItem(item, 0)),
    [renderNavItem]
  );

  return (
    <nav
      className="mt-5 text-sm grid gap-y-1"
      role="navigation"
      aria-label="Sidebar Navigation"
    >
      {navItems}
    </nav>
  );
};

export default SidebarNavigation;
