import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import onvi from "../assets/onvi.png";
import onvi_small from "../assets/onvi_small.png";
import { navItem } from "../utils/NavLinks";
import QuestionmarkIcon from "../assets/icons/qustion-mark.svg?react";
import DoubleArrowLeft from "../assets/icons/keyboard_double_arrow_left.svg?react"
import DoubleArrowRight from "../assets/icons/keyboard_double_arrow_right.svg?react"
import ArrowRight from "../assets/icons/keyboard_arrow_right.svg?react"
import NotificationYes from "../assets/icons/Notification_Yes.svg?react"

type Props = {
  children: React.ReactNode;
};

const SideNavbar: React.FC<Props> = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = (item: string) => {
    setHoveredNavItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredNavItem(null);
  };

  return (
    <div className="flex">
      <div
        className={`fixed z-50 top-0 left-0 h-full bg-stone-900 transform ${
          isOpen ? "translate-x-0" : "translate-x-0 w-20"
        } transition-width duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="h-full flex flex-col justify-between relative">
          <div>
            <div
              className={`flex items-center ${
                isOpen ? "" : "justify-center"
              } py-5 px-4`}
            >
              {isOpen ? (
                <img src={onvi} alt="" />
              ) : (
                <img src={onvi_small} alt="" />
              )}
            </div>
            <nav className="mt-5 text-sm grid gap-y-1">
              {navItem.map((item) => (
                <div
                  key={item.name}
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavLink
                    to={item.link}
                    className={({ isActive }) =>
                      isActive
                        ? `flex items-center ${
                            !isOpen && "justify-center"
                          } py-1.5 px-2 mx-4 rounded bg-opacity01/30 text-primary01`
                        : `flex items-center ${
                            !isOpen && "justify-center"
                          } py-1.5 px-2 mx-4 rounded transition duration-200 hover:bg-opacity01/30 hover:text-primary01 text-text02`
                    }
                  >
                    <item.icon className={`${isOpen && "mr-2"}`} />
                    {isOpen && <span>{item.name}</span>}
                    {item.subMenu && isOpen && (
                      <ArrowRight className="ml-auto" />
                    )}
                  </NavLink>
                  {hoveredNavItem === item.name && item.subNav && (
                    <div className="absolute left-full top-0  bg-background02 w-64 h-full py-5">
                      <div className="py-1 mx-4 text-text02 mb-3">
                        {item.subNavHeading}
                      </div>
                      {item.subNav.map((subItem) => (
                        <NavLink
                          key={subItem.name}
                          to={subItem.path}
                          className={({ isActive }) =>
                            isActive
                              ? `flex items-center p-2 mx-4 rounded bg-opacity01/30 text-text01`
                              : `flex items-center p-2 mx-4 rounded transition duration-200 hover:bg-opacity01/30 hover:text-text01 text-text02`
                          }
                        >
                          {subItem.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
          <div>
            <div
              className={`flex items-center ${
                !isOpen && "justify-center"
              } py-2.5 px-4 rounded transition duration-200 hover:bg-opacity01/30 hover:text-primary01 text-text02 cursor-pointer`}
            >
              <NotificationYes className={`${isOpen && "mr-2"}  text-xl`} />
              {isOpen && <span>Notification</span>}
            </div>
            <div className="mt-5 py-3  border-t-2 border-text02 flex gap-2 px-4">
              <div className="h-12 w-12 rounded-full bg-primary01 flex justify-center items-center">
                ЕЖ
              </div>
              {isOpen && (
                <div className="text-text02">
                  <p>Евгения Жальская</p>
                  <p>mail@gmail.com</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`flex-grow transition-all duration-300 ease-in-out ${
          isOpen ? "ml-64" : "ml-20"
        }`}
      >
        <div className=" px-6 relative min-h-screen z-10">
          {(hoveredNavItem === "Администрирование" ||
            hoveredNavItem === "Анализ") && (
            <div className="absolute z-10 inset-0 bg-background01/65"></div>
          )}
          <div className="py-5 flex items-center">
            <button
              onClick={toggleNavbar}
              className="p-2 bg-white border border-primary02 text-primary02 rounded"
            >
              {isOpen ? <DoubleArrowLeft /> : <DoubleArrowRight />}
            </button>
            <div className="ms-12 flex items-center">
              <span className="text-3xl">Hello</span>{" "}
              <QuestionmarkIcon className="text-2xl ms-2" />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;
