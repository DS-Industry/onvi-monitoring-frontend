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
import LogIn from "@/pages/Onboarding/LogIn";
import ProfileForm from "@/pages/Profile/Profile";
import Default from "@/pages/Default/Default";
import Register from "@/pages/Onboarding/Register";
import ForgotPassword from "@/pages/Onboarding/ForgotPassword";

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
        link: "/administration/subscriptions",
        subMenu: true,
        filter: false,
        addButton: true,
        icon: AdministrationIcon,
        subNavHeading: "Справочники",
        component: Default,
        permissions: [],
        subNav: [
          { name: "Подписки", filter: false, addButton: true, isVisible: true, path: "/administration/subscriptions", component: Default, permissions: [] },
          { name: "Права доступа", filter: false, addButton: false, isVisible: true, path: "/administration/accessRights", component: Default, permissions: [] },
          // { name: "Услуги", filter: false, addButton: false, isVisible: false, path: "/administration/sub2", component: Services, permissions: []},
          // { name: "Подписки", filter: false, addButton: false, isVisible: false, path: "/administration/sub3", component: Contact, permissions: [] },
          // { name: "Права доступа", filter: false, addButton: false, isVisible: false, path: "/administration/sub4", component: Home, permissions: [] },
          { name: "Юридические лица", filter: false, addButton: true, isVisible: true, path: "/administration/legalRights", component: Organization, permissions: [] },
        ],
        isSidebar: true
      },
      {
        name: "Станция",
        link: "/station/objectManagement",
        subMenu: true,
        filter: true,
        addButton: true,
        icon: CarWashIcon,
        subNavHeading: "Справочники",
        permissions: [],
        subNav: [
          { name: "Управление объектами", filter: true, addButton: true, isVisible: true, path: "/station/objectManagement", component: Pos, permissions: [] },
          { name: "Услуги", filter: true, addButton: false, isVisible: false, path: "/station/services", component: Default, permissions: [] },
          { name: "Зачисления", filter: true, addButton: false, isVisible: false, path: "/station/enrollments", component: Default, permissions: [] },
          { name: "План/Факт", filter: true, addButton: false, isVisible: true, path: "/station/plan/act", component: Default, permissions: [] },
          { name: "Уборка", filter: true, addButton: false, isVisible: false, path: "/station/cleaning", component: Default, permissions: [] },
          { name: "Простой боксов", filter: true, addButton: false, isVisible: false, path: "/station/simpleBoxes", component: Default, permissions: [] },
          // { name: "Sub 2", path: "/monitoring/about/sub2", component: ErrorPage, permissions: [] },
          // { name: "Sub 3", path: "/monitoring/about/sub3", component: ErrorPage, permissions: [] },
        ],
        component: Pos,
        isSidebar: true
      },
      {
        name: "Hr",
        link: "/Hr",
        subMenu: false,
        filter: false,
        addButton: false,
        icon: PersonnelIcon,
        component: Default,
        isSidebar: true,
        permissions: []
      },
      {
        name: "Финансы",
        link: "/finance",
        subMenu: false,
        filter: false,
        addButton: false,
        icon: FinancesIcon,
        component: Default,
        isSidebar: true,
        permissions: []
      },
      {
        name: "Анализ",
        link: "/analysis",
        subMenu: false,
        filter: false,
        addButton: false,
        icon: MonitoringIcon,
        component: Default,
        isSidebar: true,
        permissions: []
      },
      {
        name: "Маркетинг",
        link: "/marketing",
        subMenu: false,
        filter: false,
        addButton: false,
        icon: LoyaltyIcon,
        component: Default,
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
        component: Default,
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
        component: Default,
        isSidebar: true,
        permissions: []
      },
      {
        name: "Register",
        link: "/register",
        subMenu: false,
        component: Register,
        isSidebar: false,
        isPublicRoute: true,
        permissions: []
      },
      {
        name: "Login",
        link: "/login",
        subMenu: false,
        component: LogIn,
        isSidebar: false,
        isPublicRoute: true,
        permissions: []
      },
      {
        name: "Forgot Password",
        link: "/forgotPassword",
        subMenu: false,
        component: ForgotPassword,
        isSidebar: false,
        isPublicRoute: true,
        permissions: []
      },
      {
        name: "Профиль",
        link: "/profile",
        subMenu: false,
        component: ProfileForm,
        isSidebar: false,
        permissions: []
      }
  ];
  
  export default routes;