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
    icon: ReviewIcon,
  },
  {
    name: "Администрирование",
    link: "/administration",
    subMenu: true,
    icon: AdministrationIcon,
    subNavHeading: "Справочники",
    subNav: [
      { name: "Управление объектами", path: "/Администрирование/sub1" },
      { name: "Услуги", path: "/Администрирование/sub2" },
      { name: "Подписки", path: "/Администрирование/sub3" },
      { name: "Права доступа", path: "/Администрирование/sub4" },
      { name: "Юридические лица", path: "/Администрирование/sub5" },
    ],
  },
  {
    name: "Станция",
    link: "/station",
    subMenu: false,
    icon: CarWashIcon,
  },
  {
    name: "Hr",
    link: "/Hr",
    subMenu: false,
    icon: PersonnelIcon,
  },
  {
    name: "Финансы",
    link: "/finance",
    subMenu: false,
    icon: FinancesIcon,
  },
  {
    name: "Анализ",
    link: "/analysis",
    subMenu: true,
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
    icon: LoyaltyIcon,
  },
  {
    name: "Оборудование",
    link: "/equipment",
    subMenu: false,
    icon: EquipmentIcon,
  },
  {
    name: "Склад",
    link: "/store",
    subMenu: false,
    icon: WarehouseIcon,
  },
];
