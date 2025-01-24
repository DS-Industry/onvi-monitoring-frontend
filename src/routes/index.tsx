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
// import DailyReports from "@/pages/Equipment/DailyReports";
import ChemicalConsumption from "@/pages/Equipment/ChemicalConsumption";
import RoutineWork from "@/pages/Equipment/RoutineWork";
import ProgressReport from "@/pages/Equipment/ProgressReport";
import ProgressReportItem from "@/pages/Equipment/ProgressReportItem";
import ConsumptionRate from "@/pages/Equipment/ConsumptionRate";
import InventoryCreation from "@/pages/Warehouse/InventoryCreation";
import InventoryGroups from "@/pages/Warehouse/InventoryGroups";
import OverheadCosts from "@/pages/Warehouse/OverheadCosts";
import Suppliers from "@/pages/Warehouse/Suppliers";
import InventoryImport from "@/pages/Warehouse/InventoryImport";
import Documents from "@/pages/Warehouse/Documents";
import DocumentsCreation from "@/pages/Warehouse/DocumentsCreation";
import DocumentView from "@/pages/Warehouse/DocumentView";
import Clients from "@/pages/Marketing/Clients";
import Segments from "@/pages/Marketing/Segments";
import LoyaltyPrograms from "@/pages/Marketing/LoyaltyPrograms";
import ShareConstructor from "@/pages/Marketing/ShareConstructor";
import MarketResearch from "@/pages/Marketing/MarketResearch";
import ClientsImport from "@/pages/Marketing/ClientsImport";
import Marketing from "@/pages/Marketing/Marketing";
import ClientsProfile from "@/pages/Marketing/ClientsProfile";
import BonusProgram from "@/pages/Marketing/BonusProgram";
import NewSegment from "@/pages/Marketing/NewSegment";

const routes = [
  {
    name: "dashboard",
    path: "/",
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
    path: "/administration",
    subMenu: true,
    filter: false,
    addButton: false,
    addButtonText: '',
    icon: AdministrationIcon,
    subNavHeading: "directories",
    component: Default,
    permissions: [{ action: "manage", subject: "Organization" },{ action: "create", subject: "Organization" },{ action: "read", subject: "Organization" },{ action: "update", subject: "Organization" },{ action: "delete", subject: "Organization" }],
    subNav: [
      { name: "subscriptions", filter: false, addButton: false, addButtonText: '', isVisible: true, path: "/administration/subscriptions", component: Default, permissions: [{ action: "manag", subject: "Organization" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "accessRights", filter: false, addButton: false, addButtonText: '', isVisible: true, path: "/administration/accessRights", component: Default, permissions: [{ action: "manag", subject: "Organization" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "legalEntities", filter: true, addButton: true, addButtonText: "add", isVisible: true, path: "/administration/legalRights", component: Organization, permissions: [{ action: "manage", subject: "Organization" },{ action: "create", subject: "Organization" },{ action: "read", subject: "Organization" },{ action: "update", subject: "Organization" },{ action: "delete", subject: "Organization" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
    ],
    isSidebar: true
  },
  {
    name: "station",
    path: "/station",
    subMenu: true,
    filter: false,
    addButton: false,
    addButtonText: '',
    icon: CarWashIcon,
    subNavHeading: "directories",
    permissions: [{ action: "manage", subject: "Pos" },{ action: "create", subject: "Pos" },{ action: "read", subject: "Pos" },{ action: "update", subject: "Pos" },{ action: "delete", subject: "Pos" }],
    subNav: [
      { name: "objectManagement", filter: true, addButton: true, addButtonText: "add", isVisible: true, path: "/station/objectManagement", component: Pos, permissions: [{ action: "manage", subject: "Pos" },{ action: "create", subject: "Pos" },{ action: "read", subject: "Pos" },{ action: "update", subject: "Pos" },{ action: "delete", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "services", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/services", component: Default, permissions: [{ action: "manag", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "deposits", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/enrollments", component: DepositDevices, permissions: [{ action: "manage", subject: "Pos" },{ action: "create", subject: "Pos" },{ action: "read", subject: "Pos" },{ action: "update", subject: "Pos" },{ action: "delete", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "depositDevices", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/enrollments/devices", component: Deposit, permissions: [{ action: "manage", subject: "Pos" },{ action: "create", subject: "Pos" },{ action: "read", subject: "Pos" },{ action: "update", subject: "Pos" },{ action: "delete", subject: "Pos" }], isSidebar: false },
      { name: "depositDevice", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/enrollments/device", component: DepositDevice, permissions: [{ action: "manage", subject: "Pos" },{ action: "create", subject: "Pos" },{ action: "read", subject: "Pos" },{ action: "update", subject: "Pos" },{ action: "delete", subject: "Pos" }], isSidebar: false },
      { name: "programs", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/programs", component: ProgramDevices, permissions: [{ action: "manage", subject: "Pos" },{ action: "create", subject: "Pos" },{ action: "read", subject: "Pos" },{ action: "update", subject: "Pos" },{ action: "delete", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "programDevices", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/programs/devices", component: Programs, permissions: [{ action: "manage", subject: "Pos" },{ action: "create", subject: "Pos" },{ action: "read", subject: "Pos" },{ action: "update", subject: "Pos" },{ action: "delete", subject: "Pos" }], isSidebar: false },
      { name: "programDevice", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/programs/device", component: ProgramDevice, permissions: [{ action: "manage", subject: "Pos" },{ action: "create", subject: "Pos" },{ action: "read", subject: "Pos" },{ action: "update", subject: "Pos" },{ action: "delete", subject: "Pos" }], isSidebar: false },
      { name: "planAct", filter: true, addButton: false, addButtonText: "", isVisible: true, path: "/station/plan/act", component: Default, permissions: [{ action: "manag", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "cleaning", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/cleaning", component: Default, permissions: [{ action: "manag", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "simpleBoxes", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/simpleBoxes", component: Default, permissions: [{ action: "manag", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
    ],
    component: Default,
    isSidebar: true
  },
  {
    name: "hr",
    path: "/Hr",
    subMenu: false,
    filter: false,
    addButton: false,
    addButtonText: "",
    icon: PersonnelIcon,
    component: Default,
    isSidebar: true,
    permissions: [{ action: "manage", subject: "HR" }]
  },
  {
    name: "finance",
    path: "/finance",
    subMenu: false,
    filter: false,
    addButton: false,
    addButtonText: "",
    icon: FinancesIcon,
    component: Default,
    isSidebar: true,
    permissions: [{ action: "manage", subject: "Finance" }]
  },
  {
    name: "analysis",
    path: "/analysis",
    subMenu: false,
    filter: false,
    addButton: false,
    addButtonText: "",
    icon: MonitoringIcon,
    component: Default,
    isSidebar: true,
    permissions: [{ action: "manage", subject: "Analysis" }]
  },
  {
    name: "marketing",
    path: "/marketing",
    subMenu: true,
    filter: false,
    addButton: false,
    addButtonText: "",
    icon: LoyaltyIcon,
    subNavHeading: "",
    subNav: [
      { name: "clients", filter: true, addButton: true, addButtonText: "addClient", isVisible: true, path: "/marketing/clients", component: Clients, permissions: [], isSidebar: true, subNav: [], subMenu: false },
      { name: "importClients", filter: true, addButton: false, addButtonText: "addClient", isVisible: true, path: "/marketing/clients/import", component: ClientsImport, permissions: [], isSidebar: false, subNav: [], subMenu: false },
      { name: "clientProfile", filter: false, addButton: true, addButtonText: "edit", isVisible: true, path: "/marketing/clients/profile", component: ClientsProfile, permissions: [], isSidebar: false, subNav: [], subMenu: false },
      { name: "segments", filter: true, addButton: true, addButtonText: "addSeg", isVisible: true, path: "/marketing/segments", component: Segments, permissions: [], isSidebar: true, subNav: [], subMenu: false },
      { name: "createSeg", filter: false, addButton: false, addButtonText: "addSeg", isVisible: true, path: "/marketing/segments/new", component: NewSegment, permissions: [], isSidebar: false, subNav: [], subMenu: false },
      { name: "loyalty", filter: true, addButton: false, addButtonText: "report", isVisible: true, path: "/marketing/loyalty", component: LoyaltyPrograms, permissions: [], isSidebar: true, subNav: [], subMenu: false },
      { name: "share", filter: true, addButton: true, addButtonText: "newPromo", isVisible: true, path: "/marketing/share/constructor", component: ShareConstructor, permissions: [], isSidebar: true, subNav: [], subMenu: false },
      { name: "bonus", filter: false, addButton: false, addButtonText: "newPromo", isVisible: true, path: "/marketing/share/constructor/bonus", component: BonusProgram, permissions: [], isSidebar: false, subNav: [], subMenu: false },
      { name: "marketRes", filter: true, addButton: false, addButtonText: "report", isVisible: true, path: "/marketing/market/research", component: MarketResearch, permissions: [], isSidebar: true, subNav: [], subMenu: false },
    ],
    component: Marketing,
    isSidebar: true,
    permissions: []
  },
  {
    name: "equipment",
    path: "/equipment",
    subMenu: true,
    filter: false,
    addButton: false,
    addButtonText: "",
    icon: EquipmentIcon,
    subNavHeading: "dailyOptions",
    subNav: [
      // { name: "daily", filter: true, addButton: true, addButtonText: "report", isVisible: true, path: "/equipment/daily/options", component: DailyReports, permissions: [], isSidebar: true, subNav: [], subMenu: false },
      { name: "chemical", filter: true, addButton: false, addButtonText: "report", isVisible: true, path: "/equipment/chemical/consumption", component: ChemicalConsumption, permissions: [{ action: "manage", subject: "TechTask" },{ action: "create", subject: "TechTask" },{ action: "read", subject: "TechTask" },{ action: "update", subject: "TechTask" },{ action: "delete", subject: "TechTask" }], isSidebar: true, subNav: [], subMenu: false },
      {
        name: "routine", filter: true, addButton: true, addButtonText: "create", isVisible: true, path: "/equipment/routine/work", component: RoutineWork, permissions: [{ action: "manage", subject: "TechTask" },{ action: "create", subject: "TechTask" },{ action: "read", subject: "TechTask" },{ action: "update", subject: "TechTask" },{ action: "delete", subject: "TechTask" }], isSidebar: true, subNav: [
          { name: "list", filter: true, addButton: true, addButtonText: "create", isVisible: true, path: "/equipment/routine/work/list", component: RoutineWork, permissions: [{ action: "manage", subject: "TechTask" },{ action: "create", subject: "TechTask" },{ action: "read", subject: "TechTask" },{ action: "update", subject: "TechTask" },{ action: "delete", subject: "TechTask" }], isSidebar: true },
          { name: "progress", filter: true, addButton: false, addButtonText: "create", isVisible: true, path: "/equipment/routine/work/progress", component: ProgressReport, permissions: [{ action: "manage", subject: "TechTask" },{ action: "create", subject: "TechTask" },{ action: "read", subject: "TechTask" },{ action: "update", subject: "TechTask" },{ action: "delete", subject: "TechTask" }], isSidebar: true },
          { name: "progress", filter: false, addButton: false, addButtonText: "create", isVisible: true, path: "/equipment/routine/work/progress/item", component: ProgressReportItem, permissions: [{ action: "manage", subject: "TechTask" },{ action: "create", subject: "TechTask" },{ action: "read", subject: "TechTask" },{ action: "update", subject: "TechTask" },{ action: "delete", subject: "TechTask" }], isSidebar: false }
        ], subMenu: true
      },
      { name: "consumption", filter: true, addButton: false, addButtonText: "create", isVisible: true, path: "/equipment/consumption/rate", component: ConsumptionRate, permissions: [], isSidebar: true, subNav: [], isHr: true },
      { titleName: "from", name: "equipmentFailure", filter: true, addButton: true, addButtonText: "fix", isVisible: true, path: "/equipment/failure", component: EquipmentFailure, permissions: [{ action: "manage", subject: "Incident" },{ action: "create", subject: "Incident" },{ action: "read", subject: "Incident" },{ action: "update", subject: "Incident" },{ action: "delete", subject: "Incident" }], isSidebar: true, subNav: [], isHr: true },
      { titleName: "settings", name: "replacing", filter: true, addButton: true, addButtonText: "fix", isVisible: true, path: "/equipment/replacing/programs", component: Default, permissions: [], isSidebar: true, subNav: [] },
    ],
    component: Default,
    isSidebar: true,
    permissions: [{ action: "manage", subject: "Incident" },{ action: "create", subject: "Incident" },{ action: "read", subject: "Incident" },{ action: "update", subject: "Incident" },{ action: "delete", subject: "Incident" }, { action: "manage", subject: "TechTask" },{ action: "create", subject: "TechTask" },{ action: "read", subject: "TechTask" },{ action: "update", subject: "TechTask" },{ action: "delete", subject: "TechTask" }]
  },
  {
    name: "store",
    path: "/warehouse",
    subMenu: true,
    filter: false,
    addButton: false,
    addButtonText: "",
    icon: WarehouseIcon,
    component: Default,
    isSidebar: true,
    subNavHeading: "",
    subNav: [
      { name: "nomenclature", filter: true, addButton: true, addButtonText: "create", isVisible: true, path: "/warehouse/inventory", component: InventoryCreation, permissions: [{ action: "manage", subject: "Warehouse"},{ action: "read", subject: "Warehouse"},{ action: "create", subject: "Warehouse"},{ action: "update", subject: "Warehouse"},{ action: "delete", subject: "Warehouse"}], isSidebar: true, subNav: [], subMenu: false, isImport: true },
      { name: "import", filter: false, addButton: false, addButtonText: "create", isVisible: true, path: "/warehouse/inventory/import", component: InventoryImport, permissions: [{ action: "manage", subject: "Warehouse"},{ action: "read", subject: "Warehouse"},{ action: "create", subject: "Warehouse"},{ action: "update", subject: "Warehouse"},{ action: "delete", subject: "Warehouse"}], isSidebar: false, subNav: [], subMenu: false },
      { name: "groups", filter: false, addButton: true, addButtonText: "create", isVisible: true, path: "/warehouse/inventoryGroups", component: InventoryGroups, permissions: [{ action: "manage", subject: "Warehouse"},{ action: "read", subject: "Warehouse"},{ action: "create", subject: "Warehouse"},{ action: "update", subject: "Warehouse"},{ action: "delete", subject: "Warehouse"}], isSidebar: true, subNav: [], subMenu: false },
      { name: "documents", filter: true, addButton: true, addButtonText: "createDo", isVisible: true, path: "/warehouse/documents", component: Documents, permissions: [{ action: "manage", subject: "Warehouse"},{ action: "read", subject: "Warehouse"},{ action: "create", subject: "Warehouse"},{ action: "update", subject: "Warehouse"},{ action: "delete", subject: "Warehouse"}], isSidebar: true, subNav: [], subMenu: false },
      { name: "createDo", filter: false, addButton: false, addButtonText: "create", isVisible: true, path: "/warehouse/documents/creation", component: DocumentsCreation, permissions: [{ action: "manage", subject: "Warehouse"},{ action: "read", subject: "Warehouse"},{ action: "create", subject: "Warehouse"},{ action: "update", subject: "Warehouse"},{ action: "delete", subject: "Warehouse"}], isSidebar: false, subNav: [], subMenu: false },
      { name: "createDo", filter: false, addButton: true, addButtonText: "edit", isVisible: true, path: "/warehouse/documents/view", component: DocumentView, permissions: [{ action: "manage", subject: "Warehouse"},{ action: "read", subject: "Warehouse"},{ action: "create", subject: "Warehouse"},{ action: "update", subject: "Warehouse"},{ action: "delete", subject: "Warehouse"}], isSidebar: false, subNav: [], subMenu: false },
      { name: "left", filter: true, addButton: false, addButtonText: "create", isVisible: true, path: "/warehouse/leftovers", component: OverheadCosts, permissions: [{ action: "manage", subject: "Warehouse"},{ action: "read", subject: "Warehouse"},{ action: "create", subject: "Warehouse"},{ action: "update", subject: "Warehouse"},{ action: "delete", subject: "Warehouse"}], isSidebar: true, subNav: [], subMenu: false },
      { name: "suppliers", filter: true, addButton: true, addButtonText: "create", isVisible: true, path: "/warehouse/suppliers", component: Suppliers, permissions: [{ action: "manage", subject: "Warehouse"},{ action: "read", subject: "Warehouse"},{ action: "create", subject: "Warehouse"},{ action: "update", subject: "Warehouse"},{ action: "delete", subject: "Warehouse"}], isSidebar: true, subNav: [], subMenu: false },
    ],
    permissions: [{ action: "manage", subject: "Warehouse"},{ action: "read", subject: "Warehouse"},{ action: "create", subject: "Warehouse"},{ action: "update", subject: "Warehouse"},{ action: "delete", subject: "Warehouse"}]
  },
  {
    name: "Register",
    path: "/register",
    subMenu: false,
    component: Register,
    isSidebar: false,
    isPublicRoute: true,
    permissions: []
  },
  {
    name: "Login",
    path: "/login",
    subMenu: false,
    component: LogIn,
    isSidebar: false,
    isPublicRoute: true,
    permissions: []
  },
  {
    name: "Forgot Password",
    path: "/forgotPassword",
    subMenu: false,
    component: ForgotPassword,
    isSidebar: false,
    isPublicRoute: true,
    permissions: []
  },
  {
    name: "profile",
    path: "/profile",
    subMenu: false,
    component: ProfileForm,
    isSidebar: false,
    permissions: []
  }
];

export default routes;