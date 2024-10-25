// import Hr from "../pages/Hr/Hr";
// import Administration from "../pages/Administration/Administration";
// import Analysis from "../pages/Analysis/Analysis";
import ReviewIcon from "@icons/review-icon.svg?react";
import AdministrationIcon from "@icons/administration-icon.svg?react"
import CarWashIcon from "@icons/car_wash-icon.svg?react"
import PersonnelIcon from "@icons/personnel-icon.svg?react"
import FinancesIcon from "@icons/finances-icon.svg?react"
import MonitoringIcon from "@icons/monitoring-icon.svg?react"
import LoyaltyIcon from "@icons/loyalty-icon.svg?react"
import EquipmentIcon from "@icons/equipment-icon.svg?react"
import WarehouseIcon from "@icons/warehouse-icon.svg?react"
import Pos from "@/pages/Pos/Pos";
import Organization from "@/pages/Organization/Organization";
import DepositDevice from "@/pages/Pos/DepositDevice";
import ProgramDevices from "@/pages/Pos/ProgramDevices";
import ProgramDevice from "@/pages/Pos/ProgramDevice";
// import Finance from "@/pages/Finance/Finance";
// import Equipment from "@/pages/Equipment/Equipment";
// import Warehouse from "@/pages/Warehouse/Warehouse";
import LogIn from "@/pages/Onboarding/LogIn";
import ProfileForm from "@/pages/Profile/Profile";
import Default from "@/pages/Default/Default";
import Register from "@/pages/Onboarding/Register";
import ForgotPassword from "@/pages/Onboarding/ForgotPassword";
import Deposit from "@/pages/Pos/Deposit";
import Programs from "@/pages/Pos/Programs";
import DepositDevices from "@/pages/Pos/DepositDevices";
import Dashboard from "@/pages/Dashboard/Dashboard";

const routes = [
    {
        name: "dashboard",
        link: "/",
        subMenu: false,
        filter: false,
        addButton: false,
        icon: ReviewIcon,
        component: Dashboard,
        isSidebar: true,
        permissions: []
      },
      {
        name: "administration",
        link: "/administration",
        subMenu: true,
        filter: false,
        addButton: true,
        icon: AdministrationIcon,
        subNavHeading: "Справочники",
        component: Default,
        permissions: [],
        subNav: [
          { name: "subscriptions", filter: false, addButton: false, isVisible: true, path: "/administration/subscriptions", component: Default, permissions: [], isSidebar: true },
          { name: "accessRights", filter: false, addButton: false, isVisible: true, path: "/administration/accessRights", component: Default, permissions: [], isSidebar: true },
          { name: "legalEntities", filter: true, addButton: true, isVisible: true, path: "/administration/legalRights", component: Organization, permissions: [], isSidebar: true },
        ],
        isSidebar: true
      },
      {
        name: "station",
        link: "/station",
        subMenu: true,
        filter: true,
        addButton: true,
        icon: CarWashIcon,
        subNavHeading: "Справочники",
        permissions: [],
        subNav: [
          { name: "objectManagement", filter: true, addButton: true, isVisible: true, path: "/station/objectManagement", component: Pos, permissions: [], isSidebar: true },
          { name: "services", filter: true, addButton: false, isVisible: false, path: "/station/services", component: Default, permissions: [], isSidebar: true },
          { name: "deposits", filter: true, addButton: false, isVisible: false, path: "/station/enrollments", component: DepositDevices, permissions: [], isSidebar: true },
          { name: "depositDevices", filter: true, addButton: false, isVisible: false, path: "/station/enrollments/devices", component: Deposit, permissions: [], isSidebar: false },
          { name: "depositDevice", filter: true, addButton: false, isVisible: false, path: "/station/enrollments/device", component: DepositDevice, permissions: [], isSidebar: false },
          { name: "programs", filter: true, addButton: false, isVisible: false, path: "/station/programs", component: ProgramDevices, permissions: [], isSidebar: true },
          { name: "programDevices", filter: true, addButton: false, isVisible: false, path: "/station/programs/devices", component: Programs, permissions: [], isSidebar: false },
          { name: "programDevice", filter: true, addButton: false, isVisible: false, path: "/station/programs/device", component: ProgramDevice, permissions: [], isSidebar: false },
          { name: "planAct", filter: true, addButton: false, isVisible: true, path: "/station/plan/act", component: Default, permissions: [], isSidebar: true },
          { name: "cleaning", filter: true, addButton: false, isVisible: false, path: "/station/cleaning", component: Default, permissions: [], isSidebar: true },
          { name: "simpleBoxes", filter: true, addButton: false, isVisible: false, path: "/station/simpleBoxes", component: Default, permissions: [], isSidebar: true },
        ],
        component: Default,
        isSidebar: true
      },
      {
        name: "hr",
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
        name: "finance",
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
        name: "analysis",
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
        name: "marketing",
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
        name: "equipment",
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
        name: "store",
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
        name: "profile",
        link: "/profile",
        subMenu: false,
        component: ProfileForm,
        isSidebar: false,
        permissions: []
      }
  ];
  
  export default routes;