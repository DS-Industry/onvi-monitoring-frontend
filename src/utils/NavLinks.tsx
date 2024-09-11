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
    link: "/administration/sub5",
    subMenu: true,
    filter: false,
    addButton: true,
    icon: AdministrationIcon,
    subNavHeading: "Справочники",
    subNav: [
      { name: "Управление объектами", filter: false, addButton: true, isVisible: true, path: "/administration/sub1" },
      { name: "Управление устройствами", filter: false, addButton: false, isVisible: true, path: "/administration/device" },
      { name: "Услуги", filter: false, addButton: false, isVisible: false, path: "/administration/sub2" },
      { name: "Подписки", filter: false, addButton: false, isVisible: false, path: "/administration/sub3" },
      { name: "Права доступа", filter: false, addButton: false, isVisible: false, path: "/administration/sub4" },
      { name: "Юридические лица", filter: false, addButton: true, isVisible: true, path: "/administration/sub5" },
    ],
  },
  {
    name: "Мониторинг",
    link: "/monitoring/deposits",
    subMenu: true,
    filter: true,
    addButton: false,
    icon: MonitoringIcon,
    subNavHeading: "Операции по устройствам",
    subNav: [
      { name: "Зачисления", filter: true, addButton: false, isVisible: true, path: "/monitoring/deposits" },
      { name: "Зачисления на АМС", filter: true, addButton: false, isVisible: false, path: "/monitoring/deposits/pos" },
      { name: "Зачисления на устройстве", filter: true, addButton: false, isVisible: false, path: "/monitoring/deposits/pos/device" },
      { name: "Программы", filter: true, addButton: false, isVisible: true, path: "/monitoring/programs" },
      { name: "Программы на АМС", filter: true, addButton: false, isVisible: false, path: "/monitoring/programs/pos" },
      { name: "Программы на устройстве", filter: true, addButton: false, isVisible: false, path: "/monitoring/programs/pos/device" },
      { name: "Sub 2", path: "/about/sub2" },
      { name: "Sub 3", path: "/about/sub3" },
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
  {
    name: "Sign Up",
    link: "/signup",
    subMenu: false,
    icon: PersonnelIcon,
  },
  {
    name: "Login Up",
    link: "/login",
    subMenu: false,
    icon: PersonnelIcon,
  },
];
