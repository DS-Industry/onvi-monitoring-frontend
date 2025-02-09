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

type Props = {
  children: React.ReactNode;
};

const SideNavbar: React.FC<Props> = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);
  const [hoveredSubNavItem, setHoveredSubNavItem] = useState<string | null>(null);
  // const [notificationVisible, setNotificationVisible] = useState(true);
  const isData = true;
  const { buttonOn, setButtonOn } = useButtonCreate();
  const { filterOpen, setFilterOpen } = useFilterOpen();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUser();

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
    // Add cases for other components as needed
    else
      return [];
  };

  return (
    <div className="flex">
      {hoveredNavItem && (
        <div
          className="fixed inset-0 bg-stone-900 bg-opacity-50 z-20 pointer-events-none"
          aria-hidden="true"
        ></div>
      )}
      <div
        className={`fixed z-50 top-0 left-0 h-full bg-stone-900 transform ${isOpen ? "translate-x-0" : "translate-x-0 w-20"
          } transition-width duration-300 ease-in-out ${isOpen ? "w-64" : "w-20"
          }`}
      >
        <div className="h-full flex flex-col justify-between relative">
          <div>
            <div className={`flex items-center ${isOpen ? "" : "justify-center"} py-5 px-4`}>
              {isOpen ? <img src={onvi} alt="" /> : <img src={onvi_small} alt="" />}
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
                          onMouseEnter={() => handleMouseEnter(item.name)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <NavLink
                            to={item.subMenu ? '#' : item.path}
                            onClick={(e) => {
                              if (item.subMenu) {
                                e.preventDefault(); // Prevent default navigation
                                // Optionally, toggle visibility of sub-items if required
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
                          {hoveredNavItem === item.name && item.subNav && (
                            <div className="absolute left-full top-0 bg-background02 w-64 h-full py-5">
                              {item.subNavHeading !== "" && <div className="py-1 mx-4 text-text02 mb-3 font-normal text-[14px] leading-[143%] tracking-[0.02em] uppercase">
                                {t(`routes.${item.subNavHeading}`)}
                              </div>}
                              {item.subNav.map((subItem) => (
                                subItem.isSidebar &&
                                <div
                                  key={subItem.name}
                                  onMouseEnter={() => handleSubNavMouseEnter(subItem.name)}
                                  onMouseLeave={handleSubNavMouseLeave}
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
                                              e.preventDefault(); // Prevent default navigation
                                              // Optionally, toggle visibility of sub-items if required
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
                                      )
                                    }
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
                                              )
                                            }
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
                className="rounded-full w-12 h-12 object-cover"
              /> : <EZ />}
              {isOpen && (
                <div className="text-text02 flex items-center">
                  <p>{user.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`flex-grow transition-all duration-300 ease-in-out ${isOpen ? "ml-64" : "ml-20"
          }`}
      >
        <div className={`px-6 relative min-h-screen bg-background02 z-10`}>
          {(hoveredNavItem === "Администрирование" || hoveredNavItem === "Мониторинг") && (
            <div className="absolute z-10 inset-0 bg-background01/65"></div>
          )}
          <div className="flex items-center justify-between">
            <div className="py-5 flex items-center">
              <button
                onClick={toggleNavbar}
                className="p-2 bg-white border border-primary02 text-primary02 rounded"
              >
                {isOpen ? <DoubleArrowLeft /> : <DoubleArrowRight />}
              </button>
              <div className="ms-3 lg:ms-12 flex flex-col items-start">
                {activePageName === "bonus" && <span className="text-sm text-text02">{t("routes.share")}</span>}
                <div className="flex items-center mb-3">
                  <span className="text-3xl font-normal text-text01">{location.pathname === "/equipment/routine/work/progress/item" ? location.state.name : activePageName === "createDo" ? t(`routes.${document}`) : t(`routes.${activePageName}`)}</span>
                  {location.pathname !== "/equipment/routine/work/progress/item" && (activePageName === "bonus" ? <EditIcon className="text-text02 ms-2" /> : <QuestionmarkIcon className="text-2xl ms-2" />)}
                </div>
                {activePage?.filter && (
                  <button
                    disabled={!isData}
                    onClick={() => setFilterOpen(!filterOpen)}
                    className={`flex font-semibold text-primary02 ${isData ? "opacity-100" : "opacity-50"
                      }`}
                  >
                    {filterOpen ? t("routes.filter") : t("routes.expand")} {filterOpen ? <ArrowUp /> : <ArrowDown />}
                  </button>
                )}
              </div>
            </div>
            <div className="flex">
              {location.pathname === "/equipment/routine/work/progress/item" && (
                <div className="flex space-x-4 text-text01 text-2xl">
                  <div>{location.state.type}-</div>
                  <div>{moment(location.state.workDate).add(1, 'days').format('DD.MM.YYYY')}</div>
                </div>
              )}
              {activePage?.name === "nomenclature" && (
                <Button
                  title={t("warehouse.import")}
                  iconPlus={true}
                  type="outline"
                  classname="mr-2"
                  handleClick={() => navigate('/warehouse/inventory/import')}
                />
              )}
              {activePage?.name === "clients" && (
                <Button
                  title={t("routes.importClients")}
                  type="outline"
                  classname="mr-2"
                  handleClick={() => navigate('/marketing/clients/import')}
                />
              )}
              <Can
                requiredPermissions={getRequiredPermissions(activePage?.path || "")}
                userPermissions={userPermissions}
              >
                {(allowed) => allowed && activePage?.addButton && location?.state?.status !== "SENT" && (
                  <Button
                    title={t(`routes.${activePage?.addButtonText}`)}
                    iconPlus={true}
                    handleClick={handleClickButtonCreate}
                  />
                )}
              </Can>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;
