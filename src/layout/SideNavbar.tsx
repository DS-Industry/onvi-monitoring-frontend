import React, { useEffect, useRef, useState } from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import QuestionmarkIcon from "@icons/qustion-mark.svg?react";
import EditIcon from "@icons/edit.svg?react";
import DoubleArrowLeft from "@icons/keyboard_double_arrow_left.svg?react";
import DoubleArrowRight from "@icons/keyboard_double_arrow_right.svg?react";
import ArrowRight from "@icons/keyboard_arrow_right.svg?react";
import NotificationYes from "@icons/Notification_Yes.svg?react";
import ArrowDown from "@icons/keyboard_arrow_down.svg?react";
import ArrowUp from "@icons/keyboard_arrow_up.svg?react";
import {
  useButtonCreate,
  useFilterOpen,
  useToast,
} from "@/components/context/useContext";
import Button from "@ui/Button/Button.tsx";
import routes from "@/routes/index.tsx";
import { Can } from "@/permissions/Can";
import { useUser } from "@/hooks/useUserStore";
import { useTranslation } from "react-i18next";
import { setToastFunction } from "@/config/axiosConfig";
import useAuthStore from "@/config/store/authSlice";
import Avatar from "@/components/ui/Avatar";
import OnviLogo from "@/assets/OnviLogo.svg";
import OnviSmallLogo from "@/assets/OnviSmallLogo.svg";
import { datadogRum } from "@datadog/browser-rum";
import { datadogLogs } from "@datadog/browser-logs";
import Layout from "antd/es/layout";
import Tag from "antd/es/tag";
import Grid from "antd/es/grid";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

// Define interfaces for better type safety
interface RouteItem {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  isSidebar?: boolean;
  permissions?: Permission[];
  subMenu?: boolean;
  subNav?: RouteItem[];
  subNavHeading?: string;
  titleName?: string;
  isHr?: boolean;
  filter?: boolean;
  addButton?: boolean;
  addButtonText?: string;
}

interface Permission {
  action: string;
  subject: string;
}

interface LocationState {
  name?: string;
  date?: string;
  status?: string;
}

interface UserName {
  name: string;
  middlename: string;
}

type Props = {
  children: React.ReactNode;
};

const SideNavbar: React.FC<Props> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState<string | null>(null);
  const [activeSubNavItem, setActiveSubNavItem] = useState<string | null>(null);
  const [openSubNav, setOpenSubNav] = useState<string | null>(null);
  const [openSubNavItem, setOpenSubNavItem] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const screens = useBreakpoint();
  const isMobile = !screens.sm; // sm breakpoint is 576px in Ant Design

  const { buttonOn, setButtonOn } = useButtonCreate();
  const { filterOpen, setFilterOpen } = useFilterOpen();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUser();
  const hoverRef = useRef(false);
  const userPermissions = useAuthStore((state) => state.permissions);
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const doc = searchParams.get("document");
  const userName: UserName = { name: user.name, middlename: user.surname };

  // Get location state with proper typing
  const locationState = location.state as LocationState | null;

  // Combined useEffect for initialization
  useEffect(() => {
    setToastFunction(showToast);

    datadogRum.addAction("Navigated", { pathname: location.pathname });
    datadogLogs.logger.info("Route loaded", { pathname: location.pathname });
  }, [location.pathname, showToast]);

  // Combined hover and click outside effects
  useEffect(() => {
    hoverRef.current = isHovered;
    if (!isMobile && isHovered && !isOpen) setIsOpen(true);

    const handleClickOutside = (e: MouseEvent) => {
      if (isMobile) return;
      const sideBar = document.getElementById("sidebar");
      const sideNavs = document.querySelectorAll(".side-nav");
      let isInsideSidebar = false;

      sideNavs.forEach((element) => {
        if (element.contains(e.target as Node)) isInsideSidebar = true;
      });

      if (sideBar && !sideBar.contains(e.target as Node) && !isInsideSidebar) {
        setActiveNavItem(null);
        setActiveSubNavItem(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isHovered, isMobile, isOpen]);

  // Close submenus when navigating
  useEffect(() => {
    if (!isMobile) {
      setActiveNavItem(null);
      setActiveSubNavItem(null);
    }
  }, [location.pathname, isMobile]);

  // Helper functions
  const getActivePage = (): RouteItem | undefined => {
    const findPage = (items: RouteItem[]): RouteItem | undefined => {
      for (const item of items) {
        if (location.pathname === item.path) return item;
        if (item.subMenu && item.subNav) {
          const found = findPage(item.subNav);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findPage(routes);
  };

  const isParentActive = (subMenu: RouteItem[] | undefined): boolean =>
    subMenu ? subMenu.some((child) => child.path === location.pathname) : false;

  const getStatusTag = (status: string): React.ReactElement => {
    const greenStatuses = [
      t("tables.ACTIVE"),
      t("tables.SENT"),
      t("tables.In Progress"),
    ];
    const redStatuses = [
      t("tables.OVERDUE"),
      t("tables.Done"),
      t("tables.FINISHED"),
      t("tables.PAUSE"),
    ];
    const orangeStatuses = [t("tables.SAVED"), t("tables.VERIFICATE")];

    if (greenStatuses.includes(status))
      return <Tag color="green">{status}</Tag>;
    if (redStatuses.includes(status)) return <Tag color="red">{status}</Tag>;
    if (orangeStatuses.includes(status))
      return <Tag color="orange">{status}</Tag>;
    return <Tag color="default">{status}</Tag>;
  };

  const getRequiredPermissions = (path: string): Permission[] => {
    const permissionMap: [string, Permission[]][] = [
      [
        "hr/salary",
        [
          { action: "manage", subject: "Hr" },
          { action: "create", subject: "Hr" },
        ],
      ],
      [
        "hr/employee/advance",
        [
          { action: "manage", subject: "Hr" },
          { action: "create", subject: "Hr" },
        ],
      ],
      [
        "hr",
        [
          { action: "manage", subject: "Hr" },
          { action: "update", subject: "Hr" },
        ],
      ],
      [
        "/administration/accessRights/employees",
        [
          { action: "manage", subject: "Organization" },
          { action: "update", subject: "Organization" },
        ],
      ],
      [
        "administration",
        [
          { action: "manage", subject: "Organization" },
          { action: "create", subject: "Organization" },
        ],
      ],
      [
        "station",
        [
          { action: "manage", subject: "Pos" },
          { action: "create", subject: "Pos" },
        ],
      ],
      [
        "equipment/routine",
        [
          { action: "manage", subject: "TechTask" },
          { action: "create", subject: "TechTask" },
        ],
      ],
      [
        "equipment/failure",
        [
          { action: "manage", subject: "Incident" },
          { action: "create", subject: "Incident" },
        ],
      ],
      [
        "warehouse/documents",
        [
          { action: "manage", subject: "Warehouse" },
          { action: "create", subject: "Warehouse" },
        ],
      ],
      [
        "warehouse",
        [
          { action: "manage", subject: "Warehouse" },
          { action: "update", subject: "Warehouse" },
        ],
      ],
      [
        "finance/timesheet",
        [
          { action: "manage", subject: "ShiftReport" },
          { action: "create", subject: "ShiftReport" },
        ],
      ],
      [
        "finance/financial/accounting",
        [
          { action: "manage", subject: "ManagerPaper" },
          { action: "create", subject: "ManagerPaper" },
        ],
      ],
      [
        "finance/report/period",
        [{ action: "manage", subject: "ManagerPaper" }],
      ],
      [
        "finance",
        [
          { action: "manage", subject: "CashCollection" },
          { action: "create", subject: "CashCollection" },
        ],
      ],
      [
        "analysis",
        [
          { action: "manage", subject: "ShiftReport" },
          { action: "create", subject: "ShiftReport" },
        ],
      ],
    ];

    const entry = permissionMap.find(([key]) => path.includes(key));
    return entry ? entry[1] : [];
  };

  const handleNavItemClick = (item: string): void => {
    setActiveNavItem(activeNavItem === item ? null : item);
    setActiveSubNavItem(null);
  };

  const handleSubNavItemClick = (subItem: string): void => {
    setActiveSubNavItem(activeSubNavItem === subItem ? null : subItem);
  };

  const handleSiderHover = {
    onMouseEnter: () => !isMobile && setIsHovered(true),
    onMouseLeave: () => {
      if (!isMobile) {
        setIsHovered(false);
        setTimeout(() => {
          if (!hoverRef.current) {
            setIsOpen(false);
            setActiveNavItem(null);
            setActiveSubNavItem(null);
          }
        }, 300);
      }
    },
  };

  const activePage = getActivePage();
  const activePageName = activePage?.name || "Home";

  const renderNavItem = (item: RouteItem): React.ReactElement => (
    <Can
      key={item.name}
      requiredPermissions={item.permissions || []}
      userPermissions={userPermissions}
    >
      {(allowed) =>
        allowed && (
          <div key={item.name} className="side-nav">
            <NavLink
              to={item.subMenu ? "#" : item.path}
              onClick={(e) => {
                if (item.subMenu) {
                  e.preventDefault();
                  if (isMobile) {
                    setOpenSubNav(openSubNav === item.name ? null : item.name);
                  } else {
                    handleNavItemClick(item.name);
                  }
                }
              }}
              className={({ isActive }) =>
                item.subMenu
                  ? `flex items-center py-1.5 px-2 mx-4 rounded transition font-semibold text-sm
                  ${
                    isParentActive(item.subNav)
                      ? "bg-opacity01/30 text-primary01"
                      : !isMobile && activeNavItem === item.name
                      ? "bg-opacity01/30 text-primary01"
                      : "text-text02"
                  } hover:bg-opacity01/30 hover:text-primary01`
                  : isActive
                  ? `flex items-center py-1.5 px-2 mx-4 font-semibold text-sm rounded bg-opacity01/30 text-primary01`
                  : `flex items-center py-1.5 px-2 mx-4 font-semibold text-sm rounded transition duration-200 
                    hover:bg-opacity01/30 hover:text-primary01 text-text02`
              }
            >
              {item.icon && <item.icon className={`${isOpen && "mr-2"}`} />}
              {isOpen && <span>{t(`routes.${item.name}`)}</span>}
              {item.subMenu && isOpen && <ArrowRight className="ml-auto" />}
            </NavLink>
            {renderMobileSubNav(item)}
            {renderDesktopSubNav(item)}
          </div>
        )
      }
    </Can>
  );

  const renderMobileSubNav = (item: RouteItem): React.ReactElement | null =>
    isMobile && openSubNav === item.name ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="absolute left-0 top-0 w-64 h-full bg-white shadow-lg p-5">
          <button className="text-xl p-2" onClick={() => setOpenSubNav(null)}>
            ✕
          </button>
          {item.subNav &&
            item.subNav.map((subItem: RouteItem) => (
              <Can
                key={subItem.name}
                requiredPermissions={subItem.permissions || []}
                userPermissions={userPermissions}
              >
                {(allowed) =>
                  allowed &&
                  subItem.isSidebar && (
                    <div key={subItem.name}>
                      <NavLink
                        to={subItem.subMenu ? "#" : subItem.path}
                        onClick={(e) => {
                          if (subItem.subMenu) {
                            e.preventDefault();
                            setOpenSubNavItem(
                              openSubNavItem === subItem.name
                                ? null
                                : subItem.name
                            );
                          } else {
                            setOpenSubNav(null);
                            setOpenSubNavItem(null);
                          }
                        }}
                        className={({ isActive }) =>
                          subItem.subMenu
                            ? `flex items-center py-1.5 px-2 mx-4 rounded transition 
                          ${
                            isParentActive(subItem.subNav)
                              ? "bg-opacity01/30 text-text01"
                              : "text-text02"
                          }
                          hover:bg-opacity01/30 hover:text-text01`
                            : isActive
                            ? `flex items-center py-1.5 px-2 mx-4 rounded bg-opacity01/30 text-text01`
                            : `flex items-center py-1.5 px-2 mx-4 rounded transition duration-200 
                            hover:bg-opacity01/30 hover:text-text01 text-text02`
                        }
                      >
                        {t(`routes.${subItem.name}`)}
                        {subItem.subMenu && <ArrowRight className="ml-auto" />}
                      </NavLink>
                      {openSubNavItem === subItem.name && subItem.subNav && (
                        <div className="ml-5 mt-2 border-l pl-3">
                          {subItem.subNav.map((subSubItem: RouteItem) => (
                            <Can
                              key={subSubItem.name}
                              requiredPermissions={subSubItem.permissions || []}
                              userPermissions={userPermissions}
                            >
                              {(allowed) =>
                                allowed &&
                                subSubItem.isSidebar && (
                                  <NavLink
                                    to={subSubItem.path}
                                    className={({ isActive }) =>
                                      isActive
                                        ? `block py-1.5 px-2 rounded bg-opacity01/30 text-text01`
                                        : `block py-1.5 px-2 rounded transition duration-200 
                                    hover:bg-opacity01/30 hover:text-text01 text-text02`
                                    }
                                    onClick={() => {
                                      setOpenSubNav(null);
                                      setOpenSubNavItem(null);
                                    }}
                                  >
                                    {t(`routes.${subSubItem.name}`)}
                                  </NavLink>
                                )
                              }
                            </Can>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
              </Can>
            ))}
        </div>
      </div>
    ) : null;

  const renderDesktopSubNav = (item: RouteItem): React.ReactElement | null =>
    !isMobile && activeNavItem === item.name && item.subNav ? (
      <div className="absolute left-full top-0 bg-background02 w-64 h-full py-5 side-nav">
        {item.subNavHeading !== "" && (
          <div className="py-1 mx-4 text-text02 mb-3 font-normal text-[14px] leading-[143%] tracking-[0.02em] uppercase">
            {t(`routes.${item.subNavHeading}`)}
          </div>
        )}
        {item.subNav.map(
          (subItem: RouteItem) =>
            subItem.isSidebar && (
              <div key={subItem.name} className="side-nav">
                {subItem.titleName && (
                  <div className="py-1 mx-4 font-normal text-[14px] leading-[143%] tracking-[0.02em] uppercase text-text02">
                    {t(`routes.${subItem.titleName}`)}
                  </div>
                )}
                <Can
                  requiredPermissions={subItem.permissions || []}
                  userPermissions={userPermissions}
                >
                  {(allowed) =>
                    allowed && (
                      <NavLink
                        to={subItem.path}
                        onClick={(e) => {
                          if (subItem.subMenu) {
                            e.preventDefault();
                            handleSubNavItemClick(subItem.name);
                          }
                        }}
                        className={({ isActive }) =>
                          subItem.subMenu
                            ? `flex items-center p-2 mx-4 rounded transition font-semibold text-sm
                          ${
                            isParentActive(subItem.subNav)
                              ? "bg-opacity01/30 text-text01"
                              : "text-text02"
                          } hover:bg-opacity01/30 hover:text-text01`
                            : isActive
                            ? `flex items-center p-2 mx-4 font-semibold text-sm rounded bg-opacity01/30 text-text01`
                            : `flex items-center p-2 mx-4 font-semibold text-sm rounded transition duration-200 
                            hover:bg-opacity01/30 hover:text-text01 text-text02`
                        }
                      >
                        {t(`routes.${subItem.name}`)}
                        {subItem.subMenu && <ArrowRight className="ml-auto" />}
                      </NavLink>
                    )
                  }
                </Can>
                {subItem.isHr && <hr className="my-3" />}
                {!isMobile &&
                  activeSubNavItem === subItem.name &&
                  subItem.subMenu &&
                  subItem.subNav && (
                    <div className="absolute left-full top-0 bg-background02 w-64 h-full py-5 border border-l-opacity01 side-nav">
                      {subItem.subNav.map(
                        (subSubItem: RouteItem) =>
                          subSubItem.isSidebar && (
                            <Can
                              key={subSubItem.name}
                              requiredPermissions={subSubItem.permissions || []}
                              userPermissions={userPermissions}
                            >
                              {(allowed) =>
                                allowed && (
                                  <NavLink
                                    to={subSubItem.path}
                                    className={({ isActive }) =>
                                      isActive
                                        ? `flex items-center p-2 mx-4 rounded bg-opacity01/30 text-text01 font-semibold text-sm`
                                        : `flex items-center p-2 mx-4 rounded transition duration-200 hover:bg-opacity01/30 hover:text-text01 text-text02 font-semibold text-sm`
                                    }
                                  >
                                    {t(`routes.${subSubItem.name}`)}
                                  </NavLink>
                                )
                              }
                            </Can>
                          )
                      )}
                    </div>
                  )}
              </div>
            )
        )}
      </div>
    ) : null;

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "white" }}>
      {activeNavItem && !isMobile && (
        <div
          className="fixed inset-0 bg-stone-900 bg-opacity-50 z-20 pointer-events-none"
          aria-hidden="true"
        />
      )}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

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
          background: "#1c1917",
          height: "100%",
          left: isMobile ? (isOpen ? 0 : -80) : 0,
          transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s",
        }}
        {...handleSiderHover}
      >
        <div className="h-full flex flex-col justify-between relative">
          <div>
            <div
              className={`flex items-center ${
                isOpen ? "" : "justify-center"
              } py-5 px-4`}
            >
              {isOpen ? (
                <img src={OnviLogo} alt="ONVI" loading="lazy" />
              ) : (
                <img src={OnviSmallLogo} alt="ONVI" loading="lazy" />
              )}
              {isMobile && (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 border border-primary01 text-primary01 rounded h-10 w-10"
                >
                  {isOpen ? <DoubleArrowLeft /> : <DoubleArrowRight />}
                </button>
              )}
            </div>
            <nav className="mt-5 text-sm grid gap-y-1">
              {routes.map((item) =>
                item.isSidebar ? renderNavItem(item) : null
              )}
            </nav>
          </div>
          <div>
            <div
              className={`flex items-center ${
                !isOpen && "justify-center"
              } py-2.5 px-4 rounded transition duration-200 hover:bg-opacity01/30 hover:text-primary01 text-text02 cursor-pointer`}
              onClick={() => navigate("/notifications")}
            >
              <NotificationYes className={`${isOpen && "mr-2"} text-xl`} />
              {isOpen && <span>{t("routes.notifications")}</span>}
            </div>
            <div
              className="mt-5 py-3 border-t-2 border-text02 flex items-center gap-2 px-4 cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              {user.avatar ? (
                <img
                  src={`https://storage.yandexcloud.net/onvi-business/avatar/user/${user.avatar}`}
                  alt="Profile"
                  className="rounded-full w-10 h-10 object-cover sm:w-8 sm:h-8 md:w-12 md:h-12"
                  loading="lazy"
                />
              ) : (
                <Avatar type="sidebar" userName={userName} />
              )}
              {isOpen && (
                <p className="text-text02 text-sm sm:hidden md:block">
                  {user.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </Sider>

      <Layout
        style={{
          marginLeft: isMobile ? 80 : isOpen ? 256 : 80,
          transition: "all 0.3s",
        }}
      >
        <Content className="min-h-screen bg-white">
          {isMobile && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="fixed top-5 left-4 p-1.5 bg-opacity01 text-white rounded-md z-40"
            >
              {isOpen ? (
                <CloseOutlined className="w-6 h-6" />
              ) : (
                <MenuOutlined className="w-6 h-6" />
              )}
            </button>
          )}

          <div className="px-4 sm:px-6 relative min-h-screen z-10">
            {!isMobile &&
              (activeNavItem === "Администрирование" ||
                activeNavItem === "Мониторинг") && (
                <div className="absolute z-10 inset-0 bg-background01/65" />
              )}

            <div className="flex flex-wrap items-start sm:items-center justify-between pt-5 pb-2">
              <div className="flex items-center">
                {!isMobile && (
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 bg-white border border-primary02 text-primary02 rounded"
                  >
                    {isOpen ? <DoubleArrowLeft /> : <DoubleArrowRight />}
                  </button>
                )}
                <div className="ml-3 lg:ml-12 flex flex-col items-start">
                  {activePageName === "bonus" && (
                    <span className="text-sm text-text02">
                      {t("routes.loyalty")}
                    </span>
                  )}
                  <div className="flex items-center mb-2">
                    <span className="text-xl sm:text-3xl font-normal text-text01">
                      {location.pathname === "/equipment/routine/work/list/item"
                        ? locationState?.name
                        : location.pathname === "/finance/timesheet/view"
                        ? `${
                            locationState?.name
                          } : ${locationState?.date?.slice(0, 10)}`
                        : activePageName === "createDo"
                        ? t(`routes.${doc}`)
                        : t(`routes.${activePageName}`)}
                    </span>
                    {location.pathname ===
                      "/equipment/routine/work/list/item" &&
                    locationState?.status ? (
                      <div className="ml-5">
                        {getStatusTag(locationState.status)}
                      </div>
                    ) : activePageName === "bonus" ? (
                      <EditIcon className="text-text02 ml-2" />
                    ) : (
                      <QuestionmarkIcon className="text-2xl ml-2" />
                    )}
                  </div>
                  {activePage?.filter && (
                    <button
                      disabled={false}
                      onClick={() => setFilterOpen(!filterOpen)}
                      className="flex font-semibold text-primary02"
                    >
                      {filterOpen ? t("routes.filter") : t("routes.expand")}
                      {filterOpen ? <ArrowUp /> : <ArrowDown />}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-end">
                <Can
                  requiredPermissions={[
                    { action: "manage", subject: "Warehouse" },
                    { action: "update", subject: "Warehouse" },
                  ]}
                  userPermissions={userPermissions}
                >
                  {(allowed) =>
                    allowed &&
                    activePage?.name === "nomenclature" && (
                      <Button
                        title={isMobile ? "" : t("warehouse.import")}
                        iconUpload={true}
                        type="outline"
                        classname={`mr-2 ${
                          isMobile ? "h-[36px] gap-0 px-[12px] py-[9px]" : ""
                        }`}
                        handleClick={() =>
                          navigate("/warehouse/inventory/import")
                        }
                      />
                    )
                  }
                </Can>
                <Can
                  requiredPermissions={getRequiredPermissions(
                    activePage?.path || ""
                  )}
                  userPermissions={userPermissions}
                >
                  {(allowed) =>
                    allowed &&
                    activePage?.addButton &&
                    locationState?.status !== t("tables.SENT") && (
                      <Button
                        title={
                          isMobile
                            ? ""
                            : t(`routes.${activePage?.addButtonText}`)
                        }
                        iconPlus={true}
                        handleClick={() => setButtonOn(!buttonOn)}
                        classname={
                          isMobile
                            ? "h-[36px] gap-0 px-[12px] py-[9px]"
                            : "min-w-[166px]"
                        }
                      />
                    )
                  }
                </Can>
              </div>
            </div>

            <div
              className={`${isMobile ? (isOpen ? "-ml-64" : "-ml-20") : ""}`}
            >
              {children}
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SideNavbar;
