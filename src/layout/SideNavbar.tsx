import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import onvi from "../assets/onvi.png";
import onvi_small from "../assets/onvi_small.png";
import QuestionmarkIcon from "@icons/qustion-mark.svg?react";
import EditIcon from "@icons/edit.svg?react";
import DoubleArrowLeft from "@icons/keyboard_double_arrow_left.svg?react";
import DoubleArrowRight from "@icons/keyboard_double_arrow_right.svg?react";
import ArrowRight from "@icons/keyboard_arrow_right.svg?react";
import NotificationYes from "@icons/Notification_Yes.svg?react";
import ArrowDown from "@icons/keyboard_arrow_down.svg?react";
import ArrowUp from "@icons/keyboard_arrow_up.svg?react";
import { useButtonCreate, useFilterOpen, useSnackbar } from "@/components/context/useContext";
import Button from "@ui/Button/Button.tsx";
import routes from "@/routes/index.tsx";
import { Can } from "@/permissions/Can";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUserStore";
import { useTranslation } from "react-i18next";
import { useDocumentType } from "@/hooks/useAuthStore";
import { setSnackbarFunction } from "@/config/axiosConfig";
import useAuthStore from "@/config/store/authSlice";
import EZ from "@icons/EZ.svg?react";
import moment from "moment";
import Icon from "feather-icons-react";

type Props = {
  children: React.ReactNode;
};

const SideNavbar: React.FC<Props> = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);
  const [hoveredSubNavItem, setHoveredSubNavItem] = useState<string | null>(null);
  const [openSubNav, setOpenSubNav] = useState<string | null>(null);
  const [openSubNavItem, setOpenSubNavItem] = useState<string | null>(null);
  // const [notificationVisible, setNotificationVisible] = useState(true);
  const isData = true;
  const { buttonOn, setButtonOn } = useButtonCreate();
  const { filterOpen, setFilterOpen } = useFilterOpen();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUser();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const userPermissions = useAuthStore((state) => state.permissions);

  const getActivePage = () => {
    for (const item of routes) {
      if (location.pathname === item.path) {
        return item;
      } else if (item.subMenu && item.subNav) {
        for (const subItem of item.subNav) {
          if (location.pathname === subItem.path) {
            return subItem;
          } if (subItem.subMenu && subItem.subNav) {
            for (const subSubItem of subItem.subNav) {
              if (location.pathname === subSubItem.path) {
                return subSubItem;
              }
            }
          }
        }
      }
    }
  };

  const handleProfileNavigate = () => {
    navigate('/profile');
  };

  const activePage = getActivePage();
  const activePageName = activePage?.name || "Home";
  const document = useDocumentType();

  const isParentActive = (subMenu: any[] | undefined) =>
    subMenu && subMenu.some((child) => child.path === location.pathname);

  const handleClickButtonCreate = () => {
    setButtonOn(!buttonOn);
    console.log("Button on", buttonOn);
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = (item: string) => {
    setHoveredNavItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredNavItem(null);
  };

  const handleSubNavMouseEnter = (subItem: string) => {
    setHoveredSubNavItem(subItem);
  };

  const handleSubNavMouseLeave = () => {
    setHoveredSubNavItem(null);
  };

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setSnackbarFunction(showSnackbar);
  }, [showSnackbar]);

  const getRequiredPermissions = (path: string) => {
    if (path.includes("administration"))
      return [
        { action: "manage", subject: "Organization" },
        { action: "create", subject: "Organization" },
      ];
    if (path.includes("station"))
      return [
        { action: "manage", subject: "Pos" },
        { action: "create", subject: "Pos" },
      ];
    if (path.includes("equipment"))
      return [
        { action: "manage", subject: "Incident" },
        { action: "create", subject: "Incident" },
        { action: "manage", subject: "TechTask" },
        { action: "create", subject: "TechTask" },
      ];
    if (path.includes("warehouse"))
      return [
        { action: "manage", subject: "Warehouse" },
        { action: "create", subject: "Warehouse" },
      ];
    if (path.includes("finance"))
      return [
        { action: "manage", subject: "CashCollection" },
        { action: "create", subject: "CashCollection" },
      ];
    if (path.includes("analysis"))
      return [
        { action: "manage", subject: "ShiftReport" },
        { action: "create", subject: "ShiftReport" },
      ];
    // Add cases for other components as needed
    else
      return [];
  };

  return (
    <div className="relative">
      {hoveredNavItem && (
        <div
          className="fixed inset-0 bg-stone-900 bg-opacity-50 z-20 pointer-events-none"
          aria-hidden="true"
        ></div>
      )}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)} // Close sidebar when clicking outside
        ></div>
      )}
      <div
        className={`fixed z-50 top-0 left-0 h-full bg-stone-900 transform transition-all duration-300 ease-in-out
      ${isOpen ? "w-64 translate-x-0" : "w-20"}
      ${isOpen && "md:w-64"}
      ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : ""}`}
      >
        <div className="h-full flex flex-col justify-between relative">
          <div>
            <div className="flex items-center">
              <div className={`flex items-center ${isOpen ? "" : "justify-center"} py-5 px-4`}>
                {isOpen ? <img src={onvi} alt="" /> : <img src={onvi_small} alt="" />}
              </div>
              {isMobile && (
                <button
                  onClick={toggleNavbar}
                  className="p-2 border border-primary01 text-primary01 rounded h-10 w-10"
                >
                  {isOpen ? <DoubleArrowLeft /> : <DoubleArrowRight />}
                </button>
              )}
            </div>
            <nav className="mt-5 text-sm grid gap-y-1">
              {routes.map((item) =>
                item.isSidebar ? (
                  <Can
                    key={item.name}
                    requiredPermissions={item.permissions} // Check route permissions
                    userPermissions={userPermissions}
                  >
                    {(allowed) =>
                      allowed && (
                        <div
                          key={item.name}
                          onMouseEnter={!isMobile ? () => handleMouseEnter(item.name) : undefined}
                          onMouseLeave={!isMobile ? handleMouseLeave : undefined}
                        >
                          <NavLink
                            to={item.subMenu ? '#' : item.path}
                            onClick={(e) => {
                              if (item.subMenu) {
                                e.preventDefault();
                                setOpenSubNav(openSubNav === item.name ? null : item.name);
                              }
                            }}
                            className={({ isActive }) =>
                              item.subMenu
                                ? `flex items-center py-1.5 px-2 mx-4 rounded transition 
                              ${isParentActive(item.subNav)
                                  ? 'bg-opacity01/30 text-primary01'
                                  : hoveredNavItem === item.name
                                    ? 'bg-opacity01/30 text-primary01'
                                    : 'text-text02'
                                } hover:bg-opacity01/30 hover:text-primary01`
                                : isActive
                                  ? `flex items-center 
                                    py-1.5 px-2 mx-4 rounded bg-opacity01/30 text-primary01`
                                  : `flex items-center 
                                    py-1.5 px-2 mx-4 rounded transition duration-200 
                                    hover:bg-opacity01/30 hover:text-primary01 text-text02`
                            }
                          >
                            {item.icon && <item.icon className={`${isOpen && "mr-2"}`} />}
                            {isOpen && <span>{t(`routes.${item.name}`)}</span>}
                            {item.subMenu && isOpen && (
                              <ArrowRight className="ml-auto" />
                            )}
                          </NavLink>
                          {isMobile && openSubNav === item.name && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
                              <div className="absolute left-0 top-0 w-64 h-full bg-white shadow-lg p-5">
                                <button className="text-xl p-2" onClick={() => setOpenSubNav(null)}>✕</button>
                                {item.subNav && item.subNav.map((subItem) => (
                                  <Can
                                    key={subItem.name}
                                    requiredPermissions={subItem.permissions}
                                    userPermissions={userPermissions}
                                  >
                                    {(allowed) =>
                                      allowed && subItem.isSidebar && (
                                        <div key={subItem.name}>
                                          <NavLink
                                            to={subItem.subMenu ? "#" : subItem.path}
                                            onClick={(e) => {
                                              if (subItem.subMenu) {
                                                e.preventDefault();
                                                setOpenSubNavItem(openSubNavItem === subItem.name ? null : subItem.name);
                                              } else {
                                                setOpenSubNav(null); // Close when navigating
                                                setOpenSubNavItem(null);
                                              }
                                            }}
                                            className={({ isActive }) =>
                                              subItem.subMenu
                                                ? `flex items-center py-1.5 px-2 mx-4 rounded transition 
                        ${isParentActive(subItem.subNav) ? 'bg-opacity01/30 text-text01' : 'text-text02'}
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
                                              {subItem.subNav.map((subSubItem) => (
                                                <Can
                                                  key={subSubItem.name}
                                                  requiredPermissions={subSubItem.permissions}
                                                  userPermissions={userPermissions}
                                                >
                                                  {(allowed) =>
                                                    allowed && (
                                                      subSubItem.isSidebar && <NavLink
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
                          )}
                          {hoveredNavItem === item.name && item.subNav && (
                            <div className="absolute left-full top-0 bg-background02 w-64 h-full py-5">
                              {item.subNavHeading !== "" && <div className="py-1 mx-4 text-text02 mb-3 font-normal text-[14px] leading-[143%] tracking-[0.02em] uppercase">
                                {t(`routes.${item.subNavHeading}`)}
                              </div>}
                              {item.subNav.map((subItem) => (
                                subItem.isSidebar &&
                                <div
                                  key={subItem.name}
                                  onMouseEnter={!isMobile ? () => handleSubNavMouseEnter(subItem.name) : undefined}
                                  onMouseLeave={!isMobile ? handleSubNavMouseLeave : undefined}
                                >
                                  {subItem.titleName &&
                                    <div className="py-1 mx-4 font-normal text-[14px] leading-[143%] tracking-[0.02em] uppercase text-text02">
                                      {t(`routes.${subItem.titleName}`)}
                                    </div>
                                  }
                                  <Can
                                    key={subItem.name}
                                    requiredPermissions={subItem.permissions} // Check sub-menu permissions
                                    userPermissions={userPermissions}
                                  >
                                    {(allowed) =>
                                      allowed && (
                                        <NavLink
                                          key={subItem.subMenu ? '#' : subItem.name}
                                          to={subItem.path}
                                          onClick={(e) => {
                                            if (subItem.subMenu) {
                                              e.preventDefault();
                                            }
                                          }}
                                          className={({ isActive }) =>
                                            subItem.subMenu
                                              ? `flex items-center py-1.5 px-2 mx-4 rounded transition 
                                                ${isParentActive(subItem.subNav)
                                                ? 'bg-opacity01/30 text-text01'
                                                : 'text-text02'
                                              } hover:bg-opacity01/30 hover:text-text01`
                                              : isActive
                                                ? `flex items-center 
                                                  py-1.5 px-2 mx-4 rounded bg-opacity01/30 text-text01`
                                                : `flex items-center 
                                                  py-1.5 px-2 mx-4 rounded transition duration-200 
                                                  hover:bg-opacity01/30 hover:text-text01 text-text02`
                                          }
                                        >
                                          {t(`routes.${subItem.name}`)}
                                          {subItem.subMenu && (
                                            <ArrowRight className="ml-auto" />
                                          )}
                                        </NavLink>
                                      )}
                                  </Can>
                                  {subItem.isHr && <hr className="my-3" />}
                                  {hoveredSubNavItem === subItem.name && subItem.subMenu && subItem.subNav && (
                                    <div className="absolute left-full top-0 bg-background02 w-64 h-full py-5 border border-l-opacity01">
                                      {subItem.subNav.map((subSubItem) => (
                                        subSubItem.isSidebar &&
                                        <div>
                                          <Can
                                            key={subSubItem.name}
                                            requiredPermissions={subSubItem.permissions}
                                            userPermissions={userPermissions}
                                          >
                                            {(allowed) =>
                                              allowed && (
                                                <NavLink
                                                  key={subSubItem.name}
                                                  to={subSubItem.path}
                                                  className={({ isActive }) =>
                                                    isActive
                                                      ? `flex items-center p-2.5 mx-4 rounded bg-opacity01/30 text-text01 font-medium text-sm`
                                                      : `flex items-center p-2.5 mx-4 rounded transition duration-200 hover:bg-opacity01/30 hover:text-text01 text-text02 font-medium text-sm`
                                                  }
                                                >
                                                  {t(`routes.${subSubItem.name}`)}
                                                </NavLink>
                                              )}
                                          </Can>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    }
                  </Can>
                ) : null
              )}
            </nav>
          </div>
          <div>
            <div
              className={`flex items-center ${!isOpen && "justify-center"
                } py-2.5 px-4 rounded transition duration-200 hover:bg-opacity01/30 hover:text-primary01 text-text02 cursor-pointer`}
            >
              <NotificationYes className={`${isOpen && "mr-2"} text-xl`} />
              {isOpen && <span>Notification</span>}
            </div>
            <div className="mt-5 py-3 border-t-2 border-text02 flex gap-2 px-4 cursor-pointer" onClick={handleProfileNavigate}>
              {user.avatar ? <img
                src={"https://storage.yandexcloud.net/onvi-business/avatar/user/" + user.avatar}
                alt="Profile"
                className="rounded-full w-10 h-10 object-cover sm:w-8 sm:h-8 md:w-12 md:h-12"
              /> : <EZ />}
              {isOpen && (
                <p className="text-text02 text-sm sm:hidden md:block">{user.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`flex-grow transition-all duration-300 ease-in-out ${isOpen ? "ml-64" : "ml-20"
          }`}
      >
        {isMobile && (<button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-5 left-4 p-1.5 bg-opacity01 text-white rounded-md"
        >
          {isOpen ? <Icon icon="x" className="w-6 h-6" /> : <Icon icon="menu" className="w-6 h-6" />}
        </button>)}
        <div className={`px-4 sm:px-6 relative min-h-screen bg-background02 z-10`}>
          {(hoveredNavItem === "Администрирование" || hoveredNavItem === "Мониторинг") && (
            <div className="absolute z-10 inset-0 bg-background01/65"></div>
          )}

          <div className="flex flex-wrap items-start sm:items-center justify-between pt-5 pb-2">
            {/* Left Section: Toggle Button & Page Title */}
            <div className="flex items-center">
              {!isMobile && (
                <button
                  onClick={toggleNavbar}
                  className="p-2 bg-white border border-primary02 text-primary02 rounded"
                >
                  {isOpen ? <DoubleArrowLeft /> : <DoubleArrowRight />}
                </button>
              )}
              <div className="ml-3 lg:ml-12 flex flex-col items-start">
                {activePageName === "bonus" && (
                  <span className="text-sm text-text02">{t("routes.share")}</span>
                )}
                <div className="flex items-center mb-2">
                  <span className="text-xl sm:text-3xl font-normal text-text01">
                    {location.pathname === "/finance/timesheet/view"
                      ? `${location.state.name} : ${location.state.date.slice(0, 10)}`
                      : location.pathname === "/equipment/routine/work/progress/item"
                        ? location.state.name
                        : activePageName === "createDo"
                          ? t(`routes.${document}`)
                          : t(`routes.${activePageName}`)}
                  </span>
                  {location.pathname !== "/equipment/routine/work/progress/item" && (
                    activePageName === "bonus"
                      ? <EditIcon className="text-text02 ml-2" />
                      : <QuestionmarkIcon className="text-2xl ml-2" />
                  )}
                </div>
                {activePage?.filter && (
                  <button
                    disabled={!isData}
                    onClick={() => setFilterOpen(!filterOpen)}
                    className={`flex font-semibold text-primary02 ${isData ? "opacity-100" : "opacity-50"
                      }`}
                  >
                    {filterOpen ? t("routes.filter") : t("routes.expand")}
                    {filterOpen ? <ArrowUp /> : <ArrowDown />}
                  </button>
                )}
              </div>
            </div>

            {/* Right Section: Buttons */}
            <div className="flex flex-wrap justify-end">
              {location.pathname === "/equipment/routine/work/progress/item" && (
                <div className="flex space-x-2 sm:space-x-4 text-text01 text-lg sm:text-2xl">
                  <div>{location.state.type}</div>
                  {location.state.endDate && <div>-</div>}
                  {location.state.endDate && (
                    <div>{moment(location.state.endDate).format('DD.MM.YYYY')}</div>
                  )}
                </div>
              )}
              {activePage?.name === "nomenclature" && (
                <Button
                  title={isMobile ? "" : t("warehouse.import")}
                  iconUpload={true}
                  type="outline"
                  classname="mr-2"
                  handleClick={() => navigate('/warehouse/inventory/import')}
                />
              )}
              {activePage?.name === "clients" && (
                <Button
                  title={isMobile ? "" : t("routes.importClients")}
                  type="outline"
                  classname="mr-2"
                  handleClick={() => navigate('/marketing/clients/import')}
                />
              )}
              <Can
                requiredPermissions={getRequiredPermissions(activePage?.path || "")}
                userPermissions={userPermissions}
              >
                {(allowed) =>
                  allowed &&
                  activePage?.addButton &&
                  location?.state?.status !== t("tables.SENT") && (
                    <Button
                      title={isMobile ? "" : t(`routes.${activePage?.addButtonText}`)}
                      iconPlus={true}
                      handleClick={handleClickButtonCreate}
                    />
                  )
                }
              </Can>
            </div>
          </div>

          {/* Content Section - Responsive Margins */}
          <div className={`${isMobile ? (isOpen ? "-ml-64" : "-ml-20") : ""}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;
