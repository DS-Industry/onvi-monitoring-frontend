import React from "react";
import Dashboard from "../pages/Dashboard/Dashboard";
import Hr from "../pages/Hr/Hr";
import Administration from "../pages/Administration/Administration";
import Analysis from "../pages/Analysis/Analysis";
import ReviewIcon from "@icons/review-icon.svg?react";
import AdministrationIcon from "@icons/administration-icon.svg?react"
import CarWashIcon from "@icons/car_wash-icon.svg?react"
import PersonnelIcon from "@icons/personnel-icon.svg?react"
import FinancesIcon from "@icons/finances-icon.svg?react"
import MonitoringIcon from "@icons/monitoring-icon.svg?react"
import LoyaltyIcon from "@icons/loyalty-icon.svg?react"
import EquipmentIcon from "@icons/equipment-icon.svg?react"
import WarehouseIcon from "@icons/warehouse-icon.svg?react"
import Home from "@/pages/Home";
import About from "@/pages/About";
import Pos from "@/pages/Pos/Pos";
import Device from "@/pages/Device";
import Services from "@/pages/Services";
import Contact from "@/pages/Contact";
import Organization from "@/pages/Organization";
import Deposit from "@/pages/monitoring/Deposit";
import DepositDevices from "@/pages/monitoring/DepositDevices";
import DepositDevice from "@/pages/monitoring/DepositDevice";
import Programs from "@/pages/monitoring/Programs";
import ProgramDevices from "@/pages/monitoring/ProgramDevices";
import ProgramDevice from "@/pages/monitoring/ProgramDevice";
import Finance from "@/pages/Finance/Finance";
import Equipment from "@/pages/Equipment/Equipment";
import Warehouse from "@/pages/Warehouse/Warehouse";
import ErrorPage from "@/pages/Error";
import SignUp from "@/pages/SignUp";
import LogIn from "@/pages/LogIn";
import ProfileForm from "@/pages/Profile/Profile";

const routes = [
    {
        name: "Обзор",
        link: "/",
        subMenu: false,
        filter: false,
        addButton: false,
        icon: ReviewIcon,
        component: Home,
        isSidebar: true,
        permissions: []
      },
      {
        name: "Администрирование",
        link: "/administration",
        subMenu: true,
        filter: false,
        addButton: true,
        icon: AdministrationIcon,
        subNavHeading: "Справочники",
        component: About,
        permissions: [{ object: "Pos", action: "create"}],
        subNav: [
          { name: "Управление объектами", filter: false, addButton: true, isVisible: true, path: "/administration/sub1", component: Pos, permissions: [{ object: "Pos", action: "create" }] },
          { name: "Управление устройствами", filter: false, addButton: false, isVisible: true, path: "/administration/device", component: Device, permissions: [] },
          { name: "Услуги", filter: false, addButton: false, isVisible: false, path: "/administration/sub2", component: Services, permissions: []},
          { name: "Подписки", filter: false, addButton: false, isVisible: false, path: "/administration/sub3", component: Contact, permissions: [] },
          { name: "Права доступа", filter: false, addButton: false, isVisible: false, path: "/administration/sub4", component: Home, permissions: [] },
          { name: "Юридические лица", filter: false, addButton: true, isVisible: true, path: "/administration/sub5", component: Organization, permissions: [] },
        ],
        isSidebar: true
      },
      {
        name: "Мониторинг",
        link: "/monitoring",
        subMenu: true,
        filter: true,
        addButton: false,
        icon: MonitoringIcon,
        subNavHeading: "Операции по устройствам",
        permissions: [],
        subNav: [
          { name: "Зачисления", filter: true, addButton: false, isVisible: true, path: "/monitoring/deposits", component: Deposit, permissions: [] },
          { name: "Зачисления на АМС", filter: true, addButton: false, isVisible: false, path: "/monitoring/deposits/pos", component: DepositDevices, permissions: [] },
          { name: "Зачисления на устройстве", filter: true, addButton: false, isVisible: false, path: "/monitoring/deposits/pos/device", component: DepositDevice, permissions: [] },
          { name: "Программы", filter: true, addButton: false, isVisible: true, path: "/monitoring/programs", component: Programs, permissions: [] },
          { name: "Программы на АМС", filter: true, addButton: false, isVisible: false, path: "/monitoring/programs/pos", component: ProgramDevices, permissions: [] },
          { name: "Программы на устройстве", filter: true, addButton: false, isVisible: false, path: "/monitoring/programs/pos/device", component: ProgramDevice, permissions: [] },
          { name: "Sub 2", path: "/monitoring/about/sub2", component: ErrorPage, permissions: [] },
          { name: "Sub 3", path: "/monitoring/about/sub3", component: ErrorPage, permissions: [] },
        ],
        component: About,
        isSidebar: true
      },
      {
        name: "Станция",
        link: "/station",
        subMenu: false,
        filter: false,
        addButton: false,
        icon: CarWashIcon,
        component: Administration,
        isSidebar: true,
        permissions: [{ object: "Pos", action: "create"}]
      },
      {
        name: "Hr",
        link: "/Hr",
        subMenu: false,
        filter: false,
        addButton: false,
        icon: PersonnelIcon,
        component: Hr,
        isSidebar: true,
        permissions: [{ object: "Pos", action: "create"}]
      },
      {
        name: "Финансы",
        link: "/finance",
        subMenu: false,
        filter: false,
        addButton: false,
        icon: FinancesIcon,
        component: Finance,
        isSidebar: true,
        permissions: [{ object: "Pos", action: "create"}]
      },
      {
        name: "Лояльность",
        link: "/loyalty",
        subMenu: false,
        filter: false,
        addButton: false,
        icon: LoyaltyIcon,
        component: Analysis,
        isSidebar: true,
        permissions: []
      },
      {
        name: "Оборудование",
        link: "/equipment",
        subMenu: false,
        filter: false,
        addButton: false,
        icon: EquipmentIcon,
        component: Equipment,
        isSidebar: true,
        permissions: []
      },
      {
        name: "Склад",
        link: "/store",
        subMenu: false,
        filter: false,
        addButton: false,
        icon: WarehouseIcon,
        component: Warehouse,
        isSidebar: true,
        permissions: []
      },
      {
        name: "Sign Up",
        link: "/signup",
        subMenu: false,
        icon: PersonnelIcon,
        component: SignUp,
        isSidebar: false,
        permissions: []
      },
      {
        name: "Login",
        link: "/login",
        subMenu: false,
        icon: PersonnelIcon,
        component: LogIn,
        isSidebar: false,
        permissions: []
      },
      {
        name: "Profile Page",
        link: "/profile",
        subMenu: false,
        icon: PersonnelIcon,
        component: ProfileForm,
        isSidebar: true,
        permissions: [{ object: "Finance", action: "view" }]
      }
  ];
  
  export default routes;