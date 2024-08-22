import ReviewIcon from "../assets/icons/review-icon.svg?react";
import AdministrationIcon from "../assets/icons/administration-icon.svg?react"
import CarWashIcon from "../assets/icons/car_wash-icon.svg?react"
import PersonnelIcon from "../assets/icons/personnel-icon.svg?react"
import FinancesIcon from "../assets/icons/finances-icon.svg?react"
import MonitoringIcon from "../assets/icons/monitoring-icon.svg?react"
import LoyaltyIcon from "../assets/icons/loyalty-icon.svg?react"
import EquipmentIcon from "../assets/icons/equipment-icon.svg?react"
import WarehouseIcon from "../assets/icons/warehouse-icon.svg?react"

export const navItem = [
  {
    name: "Обзор",
    link: "/",
    subMenu: false,
    filter: false,
    addButton: false,
    icon: ReviewIcon,
  },
  {
    name: "Администрирование",
    link: "/administration",
    subMenu: true,
    filter: true,
    addButton: false,
    icon: AdministrationIcon,
    subNavHeading: "Справочники",
    subNav: [
      { name: "Управление объектами", filter: true, addButton: true, path: "/administration/sub1" },
      { name: "Услуги", filter: false, addButton: false, path: "/administration/sub2" },
      { name: "Подписки", filter: false, addButton: false, path: "/administration/sub3" },
      { name: "Права доступа", filter: false, addButton: false, path: "/administration/sub4" },
      { name: "Юридические лица", filter: false, addButton: true, path: "/administration/sub5" },
    ],
  },
  {
    name: "Станция",
    link: "/station",
    subMenu: false,
    filter: false,
    addButton: false,
    icon: CarWashIcon,
  },
  {
    name: "Hr",
    link: "/Hr",
    subMenu: false,
    filter: false,
    addButton: false,
    icon: PersonnelIcon,
  },
  {
    name: "Финансы",
    link: "/finance",
    subMenu: false,
    filter: false,
    addButton: false,
    icon: FinancesIcon,
  },
  {
    name: "Анализ",
    link: "/analysis",
    subMenu: true,
    filter: false,
    addButton: false,
    icon: MonitoringIcon,
    subNav: [
      { name: "Sub 1", path: "/about/sub1" },
      { name: "Sub 2", path: "/about/sub2" },
      { name: "Sub 3", path: "/about/sub3" },
    ],
  },
  {
    name: "Лояльность",
    link: "/loyalty",
    subMenu: false,
    filter: false,
    addButton: false,
    icon: LoyaltyIcon,
  },
  {
    name: "Оборудование",
    link: "/equipment",
    subMenu: false,
    filter: false,
    addButton: false,
    icon: EquipmentIcon,
  },
  {
    name: "Склад",
    link: "/store",
    subMenu: false,
    filter: false,
    addButton: false,
    icon: WarehouseIcon,
  },
];
