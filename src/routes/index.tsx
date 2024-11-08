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
import EquipmentFailure from "@/pages/Equipment/EquipmentFailure";

const routes = [
    {
        name: "dashboard",
        link: "/",
        subMenu: false,
        filter: false,
        addButton: false,
        addButtonText: '',
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
        addButton: false,
        addButtonText: '',
        icon: AdministrationIcon,
        subNavHeading: "directories",
        component: Default,
        permissions: [{action: "manage", subject: "Organization"}],
        subNav: [
          { name: "subscriptions", filter: false, addButton: false, addButtonText: '', isVisible: true, path: "/administration/subscriptions", component: Default, permissions: [{action: "manag", subject: "Organization"}], isSidebar: true },
          { name: "accessRights", filter: false, addButton: false, addButtonText: '', isVisible: true, path: "/administration/accessRights", component: Default, permissions: [{action: "manag", subject: "Organization"}], isSidebar: true },
          { name: "legalEntities", filter: true, addButton: true, addButtonText: "add", isVisible: true, path: "/administration/legalRights", component: Organization, permissions: [{action: "manage", subject: "Organization"}], isSidebar: true },
        ],
        isSidebar: true
      },
      {
        name: "station",
        link: "/station",
        subMenu: true,
        filter: false,
        addButton: false,
        addButtonText: '',
        icon: CarWashIcon,
        subNavHeading: "directories",
        permissions: [{action: "manage", subject: "Pos"}],
        subNav: [
          { name: "objectManagement", filter: true, addButton: true, addButtonText: "add", isVisible: true, path: "/station/objectManagement", component: Pos, permissions: [{action: "manage", subject: "Pos"}], isSidebar: true },
          { name: "services", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/services", component: Default, permissions: [{action: "manag", subject: "Pos"}], isSidebar: true },
          { name: "deposits", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/enrollments", component: DepositDevices, permissions: [{action: "manage", subject: "Pos"}], isSidebar: true },
          { name: "depositDevices", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/enrollments/devices", component: Deposit, permissions: [{action: "manage", subject: "Pos"}], isSidebar: false },
          { name: "depositDevice", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/enrollments/device", component: DepositDevice, permissions: [{action: "manage", subject: "Pos"}], isSidebar: false },
          { name: "programs", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/programs", component: ProgramDevices, permissions: [{action: "manage", subject: "Pos"}], isSidebar: true },
          { name: "programDevices", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/programs/devices", component: Programs, permissions: [{action: "manage", subject: "Pos"}], isSidebar: false },
          { name: "programDevice", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/programs/device", component: ProgramDevice, permissions: [{action: "manage", subject: "Pos"}], isSidebar: false },
          { name: "planAct", filter: true, addButton: false, addButtonText: "", isVisible: true, path: "/station/plan/act", component: Default, permissions: [{action: "manag", subject: "Pos"}], isSidebar: true },
          { name: "cleaning", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/cleaning", component: Default, permissions: [{action: "manag", subject: "Pos"}], isSidebar: true },
          { name: "simpleBoxes", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/simpleBoxes", component: Default, permissions: [{action: "manag", subject: "Pos"}], isSidebar: true },
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
        addButtonText: "",
        icon: PersonnelIcon,
        component: Default,
        isSidebar: true,
        permissions: [{action: "manage", subject: "HR"}]
      },
      {
        name: "finance",
        link: "/finance",
        subMenu: false,
        filter: false,
        addButton: false,
        addButtonText: "",
        icon: FinancesIcon,
        component: Default,
        isSidebar: true,
        permissions: [{action: "manage", subject: "Finance"}]
      },
      {
        name: "analysis",
        link: "/analysis",
        subMenu: false,
        filter: false,
        addButton: false,
        addButtonText: "",
        icon: MonitoringIcon,
        component: Default,
        isSidebar: true,
        permissions: [{action: "manage", subject: "Analysis"}]
      },
      {
        name: "marketing",
        link: "/marketing",
        subMenu: false,
        filter: false,
        addButton: false,
        addButtonText: "",
        icon: LoyaltyIcon,
        component: Default,
        isSidebar: true,
        permissions: [{action: "manage", subject: "Marketing"}]
      },
      {
        name: "equipment",
        link: "/equipment",
        subMenu: true,
        filter: false,
        addButton: false,
        addButtonText: "",
        icon: EquipmentIcon,
        subNavHeading: "directories",
        subNav: [
          { name: "equipmentFailure", filter: true, addButton: true, addButtonText: "fix", isVisible: true, path: "/equipment/failure", component: EquipmentFailure, permissions: [], isSidebar: true },
        ],
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
        addButtonText: "",
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