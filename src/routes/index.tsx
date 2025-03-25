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
import Collection from "@/pages/Finance/Collection";
import Period from "@/pages/Finance/Period";
import CollectionCreation from "@/pages/Finance/CollectionCreation";
import TimesheetCreation from "@/pages/Finance/TimeSheetCreation";
import Timesheet from "@/pages/Finance/Timesheet";
import Timestamps from "@/pages/Finance/Timestamps";
import Analysis from "@/pages/Analysis/Analysis";
import IncomeReport from "@/pages/Analysis/IncomeReport";
import TimesheetView from "@/pages/Finance/TimesheetView";
import ListOfEmployees from "@/pages/Organization/ListOfEmployees";
import ListOfRoles from "@/pages/Organization/ListOfRoles";
import Transactions from "@/pages/Analysis/Transactions";
import PosConnection from "@/pages/Organization/PosConnection";
import Warehouse from "@/pages/Warehouse/Warehouse";
import PlanAct from "@/pages/Pos/PlanAct";
import InviteUser from "@/pages/Onboarding/InviteUser";
import Employees from "@/pages/Hr/Employees";
import Positions from "@/pages/Hr/Positions";
import SalaryCalculation from "@/pages/Hr/SalaryCalculation";
import EmployeeAdvance from "@/pages/Hr/EmployeeAdvance";
import EmployeeProfile from "@/pages/Hr/EmployeeProfile";
import SalaryCalculationCreation from "@/pages/Hr/SalaryCalculationCreation";
// import DailyReports from "@/pages/Equipment/DailyReports";

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
      { name: "accessRights", filter: false, addButton: false, addButtonText: '', isVisible: true, path: "/administration/accessRights", component: Default, permissions: [{ action: "manage", subject: "Organization" }], isSidebar: true, isHr: false, titleName: "", subNav: [
        { name: "listOf", filter: false, addButton: true, addButtonText: 'add', isVisible: true, path: "/administration/accessRights/employees", component: ListOfEmployees, permissions: [{ action: "manage", subject: "Organization" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
        { name: "listRoles", filter: false, addButton: false, addButtonText: 'addR', isVisible: true, path: "/administration/accessRights/roles", component: ListOfRoles, permissions: [{ action: "manage", subject: "Organization" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
        { name: "pos", filter: false, addButton: false, addButtonText: 'addR', isVisible: true, path: "/administration/accessRights/pos/connection", component: PosConnection, permissions: [{ action: "manage", subject: "Organization" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false }
      ], subMenu: true },
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
      { name: "planAct", filter: true, addButton: false, addButtonText: "", isVisible: true, path: "/station/plan/act", component: PlanAct, permissions: [{ action: "manage", subject: "Pos" },{ action: "create", subject: "Pos" },{ action: "read", subject: "Pos" },{ action: "update", subject: "Pos" },{ action: "delete", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "cleaning", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/cleaning", component: Default, permissions: [{ action: "manag", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "simpleBoxes", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/simpleBoxes", component: Default, permissions: [{ action: "manag", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
    ],
    component: Default,
    isSidebar: true
  },
  {
    name: "hr",
    path: "/Hr",
    subMenu: true,
    filter: false,
    addButton: false,
    addButtonText: "",
    icon: PersonnelIcon,
    component: Default,
    isSidebar: true,
    permissions: [{ action: "manage", subject: "HR"}],
    subNavHeading: "directories",
    subNav: [
      { name: "employees", filter: true, addButton: true, addButtonText: "addE", isVisible: true, path: "/hr/employees", component: Employees, permissions: [], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "sid", filter: false, addButton: true, addButtonText: "save", isVisible: true, path: "/hr/employees/profile", component: EmployeeProfile, permissions: [], isSidebar: false, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "positions", filter: false, addButton: true, addButtonText: "new", isVisible: true, path: "/hr/positions", component: Positions, permissions: [], isSidebar: true, isHr: true, titleName: "", subNav: [], subMenu: false },
      { name: "salary", filter: true, addButton: true, addButtonText: "calc", isVisible: true, path: "/hr/salary", component: SalaryCalculation, permissions: [], isSidebar: true, isHr: false, titleName: "reports", subNav: [], subMenu: false },
      { name: "sal", filter: false, addButton: false, addButtonText: "calc", isVisible: true, path: "/hr/salary/creation", component: SalaryCalculationCreation, permissions: [], isSidebar: true, isHr: false, titleName: "reports", subNav: [], subMenu: false },
      { name: "empAdv", filter: true, addButton: true, addButtonText: "create", isVisible: true, path: "/hr/employee/advance", component: EmployeeAdvance, permissions: [], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false }
    ]
  },
  {
    name: "finance",
    path: "/finance",
    subMenu: true,
    filter: false,
    addButton: false,
    addButtonText: "",
    icon: FinancesIcon,
    component: Default,
    isSidebar: true,
    permissions: [{ action: "manage", subject: "CashCollection"},{ action: "read", subject: "CashCollection"},{ action: "create", subject: "CashCollection"},{ action: "update", subject: "CashCollection"},{ action: "delete", subject: "CashCollection"}],
    subNavHeading: "",
    subNav: [
      { name: "collection", filter: true, addButton: true, addButtonText: "create", isVisible: true, path: "/finance/collection", component: Collection, permissions: [{ action: "manage", subject: "CashCollection"},{ action: "read", subject: "CashCollection"},{ action: "create", subject: "CashCollection"},{ action: "update", subject: "CashCollection"},{ action: "delete", subject: "CashCollection"}], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "collection", filter: false, addButton: false, addButtonText: "create", isVisible: true, path: "/finance/collection/creation", component: CollectionCreation, permissions: [{ action: "manage", subject: "CashCollection"},{ action: "read", subject: "CashCollection"},{ action: "create", subject: "CashCollection"},{ action: "update", subject: "CashCollection"},{ action: "delete", subject: "CashCollection"}], isSidebar: false, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "timestamp", filter: false, addButton: false, addButtonText: "create", isVisible: true, path: "/finance/timestamp", component: Timestamps, permissions: [{ action: "manage", subject: "CashCollection"},{ action: "read", subject: "CashCollection"},{ action: "create", subject: "CashCollection"},{ action: "update", subject: "CashCollection"},{ action: "delete", subject: "CashCollection"}], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "period", filter: true, addButton: true, addButtonText: "add", isVisible: true, path: "/finance/period", component: Period, permissions: [{ action: "manage", subject: "CashCollection"},{ action: "read", subject: "CashCollection"},{ action: "create", subject: "CashCollection"},{ action: "update", subject: "CashCollection"},{ action: "delete", subject: "CashCollection"}], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "employee", filter: true, addButton: true, addButtonText: "add", isVisible: true, path: "/finance/timesheet", component: Timesheet, permissions: [{ action: "manage", subject: "CashCollection"},{ action: "read", subject: "CashCollection"},{ action: "create", subject: "CashCollection"},{ action: "update", subject: "CashCollection"},{ action: "delete", subject: "CashCollection"}], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "employee", filter: false, addButton: false, addButtonText: "add", isVisible: true, path: "/finance/timesheet/creation", component: TimesheetCreation, permissions: [{ action: "manage", subject: "CashCollection"},{ action: "read", subject: "CashCollection"},{ action: "create", subject: "CashCollection"},{ action: "update", subject: "CashCollection"},{ action: "delete", subject: "CashCollection"}], isSidebar: false, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "abcd", filter: false, addButton: false, addButtonText: "add", isVisible: true, path: "/finance/timesheet/view", component: TimesheetView, permissions: [{ action: "manage", subject: "CashCollection"},{ action: "read", subject: "CashCollection"},{ action: "create", subject: "CashCollection"},{ action: "update", subject: "CashCollection"},{ action: "delete", subject: "CashCollection"}], isSidebar: false, isHr: false, titleName: "", subNav: [], subMenu: false }
    ]
  },
  {
    name: "analysis",
    path: "/analysis",
    subMenu: true,
    filter: true,
    addButton: false,
    addButtonText: "",
    icon: MonitoringIcon,
    component: Default,
    isSidebar: true,
    permissions: [{ action: "manage", subject: "ShiftReport" },{ action: "create", subject: "ShiftReport" },{ action: "read", subject: "ShiftReport" },{ action: "update", subject: "ShiftReport" },{ action: "delete", subject: "ShiftReport" }],
    subNavHeading: "",
    subNav: [
      { name: "analysis", filter: true, addButton: false, addButtonText: "create", isVisible: true, path: "/analysis/all", component: Analysis, permissions: [{ action: "manage", subject: "ShiftReport" },{ action: "create", subject: "ShiftReport" },{ action: "read", subject: "ShiftReport" },{ action: "update", subject: "ShiftReport" },{ action: "delete", subject: "ShiftReport" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "income", filter: false, addButton: false, addButtonText: "create", isVisible: true, path: "/analysis/report", component: IncomeReport, permissions: [{ action: "manage", subject: "ShiftReport" },{ action: "create", subject: "ShiftReport" },{ action: "read", subject: "ShiftReport" },{ action: "update", subject: "ShiftReport" },{ action: "delete", subject: "ShiftReport" }], isSidebar: false, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "my", filter: true, addButton: false, addButtonText: "create", isVisible: true, path: "/analysis/transactions", component: Transactions, permissions: [{ action: "manage", subject: "ShiftReport" },{ action: "create", subject: "ShiftReport" },{ action: "read", subject: "ShiftReport" },{ action: "update", subject: "ShiftReport" },{ action: "delete", subject: "ShiftReport" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false }
    ]
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
      { name: "clients", filter: true, addButton: true, addButtonText: "addClient", isVisible: true, path: "/marketing/clients", component: Clients, permissions: [{ action: "manage", subject: "LoyaltyProgram"}], isSidebar: true, subNav: [], subMenu: false },
      { name: "importClients", filter: true, addButton: false, addButtonText: "addClient", isVisible: true, path: "/marketing/clients/import", component: ClientsImport, permissions: [{ action: "manage", subject: "LoyaltyProgram"}], isSidebar: false, subNav: [], subMenu: false },
      { name: "clientProfile", filter: false, addButton: true, addButtonText: "edit", isVisible: true, path: "/marketing/clients/profile", component: ClientsProfile, permissions: [{ action: "manage", subject: "LoyaltyProgram"}], isSidebar: false, subNav: [], subMenu: false },
      { name: "segments", filter: true, addButton: true, addButtonText: "addSeg", isVisible: true, path: "/marketing/segments", component: Segments, permissions: [{ action: "manage", subject: "LoyaltyProgram"}], isSidebar: true, subNav: [], subMenu: false },
      { name: "createSeg", filter: false, addButton: false, addButtonText: "addSeg", isVisible: true, path: "/marketing/segments/new", component: NewSegment, permissions: [{ action: "manage", subject: "LoyaltyProgram"}], isSidebar: false, subNav: [], subMenu: false },
      { name: "loyalty", filter: true, addButton: false, addButtonText: "report", isVisible: true, path: "/marketing/loyalty", component: LoyaltyPrograms, permissions: [{ action: "manage", subject: "LoyaltyProgram"}], isSidebar: true, subNav: [], subMenu: false },
      { name: "share", filter: true, addButton: true, addButtonText: "newPromo", isVisible: true, path: "/marketing/share/constructor", component: ShareConstructor, permissions: [{ action: "manage", subject: "LoyaltyProgram"}], isSidebar: true, subNav: [], subMenu: false },
      { name: "bonus", filter: false, addButton: false, addButtonText: "newPromo", isVisible: true, path: "/marketing/share/constructor/bonus", component: BonusProgram, permissions: [{ action: "manage", subject: "LoyaltyProgram"}], isSidebar: false, subNav: [], subMenu: false },
      { name: "marketRes", filter: true, addButton: false, addButtonText: "report", isVisible: true, path: "/marketing/market/research", component: MarketResearch, permissions: [{ action: "manage", subject: "LoyaltyProgram"}], isSidebar: true, subNav: [], subMenu: false },
    ],
    component: Marketing,
    isSidebar: true,
    permissions: [{ action: "manage", subject: "LoyaltyProgram"}]
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
      { name: "ware", filter: true, addButton: true, addButtonText: "create", isVisible: true, path: "/warehouse/create", component: Warehouse, permissions: [{ action: "manage", subject: "Warehouse"},{ action: "read", subject: "Warehouse"},{ action: "create", subject: "Warehouse"},{ action: "update", subject: "Warehouse"},{ action: "delete", subject: "Warehouse"}], isSidebar: true, subNav: [], subMenu: false, isImport: true },
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
    name: "Invite User",
    path: "/inviteUser",
    subMenu: false,
    component: InviteUser,
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