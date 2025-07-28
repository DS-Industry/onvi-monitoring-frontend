import ReviewIcon from "@icons/review-icon.svg?react";
import AdministrationIcon from "@icons/administration-icon.svg?react"
import CarWashIcon from "@icons/car_wash-icon.svg?react"
import PersonnelIcon from "@icons/personnel-icon.svg?react"
import FinancesIcon from "@icons/finances-icon.svg?react"
import MonitoringIcon from "@icons/monitoring-icon.svg?react"
import LoyaltyIcon from "@icons/loyalty-icon.svg?react"
import EquipmentIcon from "@icons/equipment-icon.svg?react"
import WarehouseIcon from "@icons/warehouse-icon.svg?react"
import React from "react";
import Articles from "@/pages/Finance/Articles";
import MonthlyExpanse from "@/pages/Finance/MonthlyExpanse";
import MonthlyExpanseEdit from "@/pages/Finance/MonthlyExpanseEdit";
import DirectoryArticles from "@/pages/Finance/DirectoryArticles";
import TechTaskCreate from "@/pages/Equipment/TechTaskCreate";
const Pos = React.lazy(() => import("@/pages/Pos/Pos"));
const Organization = React.lazy(() => import("@/pages/Organization/Organization"));
const DepositDevice = React.lazy(() => import("@/pages/Pos/DepositDevice"));
const ProgramDevices = React.lazy(() => import("@/pages/Pos/ProgramDevices"));
const ProgramDevice = React.lazy(() => import("@/pages/Pos/ProgramDevice"));
const LogIn = React.lazy(() => import("@/pages/Onboarding/LogIn"));
const ProfileForm = React.lazy(() => import("@/pages/Profile/Profile"));
const Default = React.lazy(() => import("@/pages/Default/Default"));
const Register = React.lazy(() => import("@/pages/Onboarding/Register"));
const ForgotPassword = React.lazy(() => import("@/pages/Onboarding/ForgotPassword"));
const Deposit = React.lazy(() => import("@/pages/Pos/Deposit"));
const Programs = React.lazy(() => import("@/pages/Pos/Programs"));
const DepositDevices = React.lazy(() => import("@/pages/Pos/DepositDevices"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard/Dashboard"));
const EquipmentFailure = React.lazy(() => import("@/pages/Equipment/EquipmentFailure"));
const ChemicalConsumption = React.lazy(() => import("@/pages/Equipment/ChemicalConsumption"));
const RoutineWork = React.lazy(() => import("@/pages/Equipment/RoutineWork"));
const RoutineWorkItem = React.lazy(() => import("@/pages/Equipment/RoutineWorkItem"));
const ProgressReport = React.lazy(() => import("@/pages/Equipment/ProgressReport"));
const ProgressReportItem = React.lazy(() => import("@/pages/Equipment/ProgressReportItem"));
const ConsumptionRate = React.lazy(() => import("@/pages/Equipment/ConsumptionRate"));
const InventoryCreation = React.lazy(() => import("@/pages/Warehouse/InventoryCreation"));
const InventoryGroups = React.lazy(() => import("@/pages/Warehouse/InventoryGroups"));
const OverheadCosts = React.lazy(() => import("@/pages/Warehouse/OverheadCosts"));
const Suppliers = React.lazy(() => import("@/pages/Warehouse/Suppliers"));
const InventoryImport = React.lazy(() => import("@/pages/Warehouse/InventoryImport"));
const Documents = React.lazy(() => import("@/pages/Warehouse/Documents"));
const DocumentsCreation = React.lazy(() => import("@/pages/Warehouse/DocumentsCreation/index"));
const DocumentView = React.lazy(() => import("@/pages/Warehouse/DocumentView"));
const Clients = React.lazy(() => import("@/pages/Marketing/Clients"));
const ShareConstructor = React.lazy(() => import("@/pages/Marketing/ShareConstructor"));
const ClientsImport = React.lazy(() => import("@/pages/Marketing/ClientsImport"));
const Marketing = React.lazy(() => import("@/pages/Marketing/Marketing"));
const ClientsProfile = React.lazy(() => import("@/pages/Marketing/ClientsProfile"));
const BonusProgram = React.lazy(() => import("@/pages/Marketing/BonusProgram"));
const NewSegment = React.lazy(() => import("@/pages/Marketing/NewSegment"));
const Collection = React.lazy(() => import("@/pages/Finance/Collection"));
const CollectionCreation = React.lazy(() => import("@/pages/Finance/CollectionCreation"));
const TimesheetCreation = React.lazy(() => import("@/pages/Finance/TimeSheetCreation"));
const Timesheet = React.lazy(() => import("@/pages/Finance/Timesheet"));
const TimesheetView = React.lazy(() => import("@/pages/Finance/TimesheetView"));
const Timestamps = React.lazy(() => import("@/pages/Finance/Timestamps"));
const IncomeReport = React.lazy(() => import("@/pages/Analysis/IncomeReport"));
const Transactions = React.lazy(() => import("@/pages/Analysis/Transactions"));
const ListOfEmployees = React.lazy(() => import("@/pages/Organization/ListOfEmployees"));
const ListOfRoles = React.lazy(() => import("@/pages/Organization/ListOfRoles"));
const PosConnection = React.lazy(() => import("@/pages/Organization/PosConnection"));
const PlanAct = React.lazy(() => import("@/pages/Pos/PlanAct"));
const InviteUser = React.lazy(() => import("@/pages/Onboarding/InviteUser"));
const Employees = React.lazy(() => import("@/pages/Hr/Employees"));
const Positions = React.lazy(() => import("@/pages/Hr/Positions"));
const SalaryCalculation = React.lazy(() => import("@/pages/Hr/SalaryCalculation"));
const EmployeeAdvance = React.lazy(() => import("@/pages/Hr/EmployeeAdvance"));
const EmployeeProfile = React.lazy(() => import("@/pages/Hr/EmployeeProfile"));
const SalaryCalculationCreation = React.lazy(() => import("@/pages/Hr/SalaryCalculationCreation"));
const Notifications = React.lazy(() => import("@/pages/Notifications/Notifications"));
const RewardsCreation = React.lazy(() => import("@/pages/Marketing/RewardsCreation"));
const EmployeeAdvanceCreation = React.lazy(() => import("@/pages/Hr/EmployeeAdvanceCreation"));
const Subscriptions = React.lazy(() => import("@/pages/Organization/Subscriptions"));
const Analysis = React.lazy(() => import("@/pages/Analysis/Analysis"));
const Warehouse = React.lazy(() => import("@/pages/Warehouse/Warehouse"));

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
    subNavHeading: "",
    component: Default,
    permissions: [{ action: "manage", subject: "Organization" }, { action: "create", subject: "Organization" }, { action: "read", subject: "Organization" }, { action: "update", subject: "Organization" }, { action: "delete", subject: "Organization" }],
    subNav: [
      { name: "subscriptions", filter: false, addButton: false, addButtonText: '', isVisible: true, path: "/administration/subscriptions", component: Subscriptions, permissions: [{ action: "manage", subject: "Organization" }, { action: "create", subject: "Organization" }, { action: "read", subject: "Organization" }, { action: "update", subject: "Organization" }, { action: "delete", subject: "Organization" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      {
        name: "accessRights", filter: false, addButton: false, addButtonText: '', isVisible: true, path: "/administration/accessRights", component: Default, permissions: [{ action: "manage", subject: "Organization" }], isSidebar: true, isHr: false, titleName: "", subNav: [
          { name: "listOf", filter: false, addButton: true, addButtonText: 'add', isVisible: true, path: "/administration/accessRights/employees", component: ListOfEmployees, permissions: [{ action: "manage", subject: "Organization" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
          { name: "listRoles", filter: false, addButton: false, addButtonText: 'addR', isVisible: true, path: "/administration/accessRights/roles", component: ListOfRoles, permissions: [{ action: "manage", subject: "Organization" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
          { name: "pos", filter: false, addButton: false, addButtonText: 'addR', isVisible: true, path: "/administration/accessRights/pos/connection", component: PosConnection, permissions: [{ action: "manage", subject: "Organization" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false }
        ], subMenu: true
      },
      { name: "legalEntities", filter: true, addButton: true, addButtonText: "add", isVisible: true, path: "/administration/legalRights", component: Organization, permissions: [{ action: "manage", subject: "Organization" }, { action: "create", subject: "Organization" }, { action: "read", subject: "Organization" }, { action: "update", subject: "Organization" }, { action: "delete", subject: "Organization" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "objectManagement", filter: true, addButton: true, addButtonText: "add", isVisible: true, path: "/administration/objectManagement", component: Pos, permissions: [{ action: "manage", subject: "Pos" }, { action: "create", subject: "Pos" }, { action: "read", subject: "Pos" }, { action: "update", subject: "Pos" }, { action: "delete", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
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
    subNavHeading: "",
    permissions: [{ action: "manage", subject: "Pos" }, { action: "create", subject: "Pos" }, { action: "read", subject: "Pos" }, { action: "update", subject: "Pos" }, { action: "delete", subject: "Pos" }],
    subNav: [
      { name: "services", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/services", component: Default, permissions: [{ action: "manag", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "deposits", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/enrollments", component: DepositDevices, permissions: [{ action: "manage", subject: "Pos" }, { action: "read", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "depositDevices", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/enrollments/devices", component: Deposit, permissions: [{ action: "manage", subject: "Pos" }, { action: "read", subject: "Pos" }], isSidebar: false },
      { name: "depositDevice", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/enrollments/device", component: DepositDevice, permissions: [{ action: "manage", subject: "Pos" }, { action: "read", subject: "Pos" }], isSidebar: false },
      { name: "programs", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/programs", component: ProgramDevices, permissions: [{ action: "manage", subject: "Pos" }, { action: "read", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "programDevices", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/programs/devices", component: Programs, permissions: [{ action: "manage", subject: "Pos" }, { action: "read", subject: "Pos" }], isSidebar: false },
      { name: "programDevice", filter: true, addButton: false, addButtonText: "", isVisible: false, path: "/station/programs/device", component: ProgramDevice, permissions: [{ action: "manage", subject: "Pos" }, { action: "read", subject: "Pos" }], isSidebar: false },
      { name: "planAct", filter: true, addButton: false, addButtonText: "", isVisible: true, path: "/station/plan/act", component: PlanAct, permissions: [{ action: "manage", subject: "Pos" }, { action: "read", subject: "Pos" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
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
    permissions: [{ action: "manage", subject: "Hr" }, { action: "create", subject: "Hr" }, { action: "read", subject: "Hr" }, { action: "update", subject: "Hr" }, { action: "delete", subject: "Hr" }],
    subNavHeading: "",
    subNav: [
      { name: "employees", filter: true, addButton: true, addButtonText: "addE", isVisible: true, path: "/hr/employees", component: Employees, permissions: [{ action: "manage", subject: "Hr" }, { action: "read", subject: "Hr" }, { action: "update", subject: "Hr" }, { action: "delete", subject: "Hr" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "sid", filter: false, addButton: true, addButtonText: "save", isVisible: true, path: "/hr/employees/profile", component: EmployeeProfile, permissions: [{ action: "manage", subject: "Hr" }, { action: "create", subject: "Hr" }, { action: "read", subject: "Hr" }, { action: "update", subject: "Hr" }, { action: "delete", subject: "Hr" }], isSidebar: false, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "positions", filter: false, addButton: true, addButtonText: "new", isVisible: true, path: "/hr/positions", component: Positions, permissions: [{ action: "manage", subject: "Hr" }, { action: "read", subject: "Hr" }, { action: "update", subject: "Hr" }, { action: "delete", subject: "Hr" }], isSidebar: true, isHr: true, titleName: "", subNav: [], subMenu: false },
      { name: "salary", filter: true, addButton: true, addButtonText: "calc", isVisible: true, path: "/hr/salary", component: SalaryCalculation, permissions: [{ action: "manage", subject: "Hr" }, { action: "create", subject: "Hr" }, { action: "read", subject: "Hr" }, { action: "delete", subject: "Hr" }], isSidebar: true, isHr: false, titleName: "reports", subNav: [], subMenu: false },
      { name: "sal", filter: false, addButton: false, addButtonText: "calc", isVisible: true, path: "/hr/salary/creation", component: SalaryCalculationCreation, permissions: [{ action: "manage", subject: "Hr" }, { action: "create", subject: "Hr" }, { action: "read", subject: "Hr" }, { action: "update", subject: "Hr" }, { action: "delete", subject: "Hr" }], isSidebar: false, isHr: false, titleName: "reports", subNav: [], subMenu: false },
      { name: "empAdv", filter: true, addButton: true, addButtonText: "create", isVisible: true, path: "/hr/employee/advance", component: EmployeeAdvance, permissions: [{ action: "manage", subject: "Hr" }, { action: "create", subject: "Hr" }, { action: "read", subject: "Hr" }, { action: "delete", subject: "Hr" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "empAdv", filter: false, addButton: true, addButtonText: "create", isVisible: true, path: "/hr/employee/advance/creation", component: EmployeeAdvanceCreation, permissions: [{ action: "manage", subject: "Hr" }, { action: "create", subject: "Hr" }, { action: "read", subject: "Hr" }, { action: "update", subject: "Hr" }, { action: "delete", subject: "Hr" }], isSidebar: false, isHr: false, titleName: "", subNav: [], subMenu: false }
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
    permissions: [{ action: "manage", subject: "CashCollection" }, { action: "read", subject: "CashCollection" }, { action: "create", subject: "CashCollection" }, { action: "update", subject: "CashCollection" }, { action: "delete", subject: "CashCollection" }, { action: "manage", subject: "ShiftReport" }, { action: "create", subject: "ShiftReport" }, { action: "read", subject: "ShiftReport" }, { action: "update", subject: "ShiftReport" }, { action: "delete", subject: "ShiftReport" }, { action: "create", subject: "ManagerPaper" }, { action: "read", subject: "ManagerPaper" }, { action: "update", subject: "ManagerPaper" }, { action: "delete", subject: "ManagerPaper" }],
    subNavHeading: "",
    subNav: [
      { name: "collection", filter: true, addButton: true, addButtonText: "create", isVisible: true, path: "/finance/collection", component: Collection, permissions: [{ action: "manage", subject: "CashCollection" }, { action: "read", subject: "CashCollection" }, { action: "create", subject: "CashCollection" }, { action: "update", subject: "CashCollection" }, { action: "delete", subject: "CashCollection" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "collection", filter: false, addButton: false, addButtonText: "create", isVisible: true, path: "/finance/collection/creation", component: CollectionCreation, permissions: [{ action: "manage", subject: "CashCollection" }, { action: "read", subject: "CashCollection" }, { action: "create", subject: "CashCollection" }, { action: "update", subject: "CashCollection" }, { action: "delete", subject: "CashCollection" }], isSidebar: false, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "timestamp", filter: false, addButton: false, addButtonText: "create", isVisible: true, path: "/finance/timestamp", component: Timestamps, permissions: [{ action: "manage", subject: "CashCollection" }, { action: "read", subject: "CashCollection" }, { action: "create", subject: "CashCollection" }, { action: "update", subject: "CashCollection" }, { action: "delete", subject: "CashCollection" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "period", filter: false, addButton: false, addButtonText: "add", isVisible: true, path: "/finance/period", component: Default, permissions: [{ action: "hide", subject: "CashCollection" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "employee", filter: true, addButton: true, addButtonText: "add", isVisible: true, path: "/finance/timesheet", component: Timesheet, permissions: [{ action: "manage", subject: "ShiftReport" }, { action: "read", subject: "ShiftReport" }, { action: "create", subject: "ShiftReport" }, { action: "update", subject: "ShiftReport" }, { action: "delete", subject: "ShiftReport" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "employee", filter: false, addButton: false, addButtonText: "add", isVisible: true, path: "/finance/timesheet/creation", component: TimesheetCreation, permissions: [{ action: "manage", subject: "ShiftReport" }, { action: "read", subject: "ShiftReport" }, { action: "create", subject: "ShiftReport" }, { action: "update", subject: "ShiftReport" }, { action: "delete", subject: "ShiftReport" }], isSidebar: false, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "abcd", filter: false, addButton: false, addButtonText: "add", isVisible: true, path: "/finance/timesheet/view", component: TimesheetView, permissions: [{ action: "manage", subject: "ShiftReport" }, { action: "read", subject: "ShiftReport" }, { action: "create", subject: "ShiftReport" }, { action: "update", subject: "ShiftReport" }, { action: "delete", subject: "ShiftReport" }], isSidebar: false, isHr: false, titleName: "", subNav: [], subMenu: false },
      {
        name: "financial", filter: true, addButton: true, addButtonText: "add", isVisible: true, path: "/finance/financial/accounting", component: Default, permissions: [{ action: "manage", subject: "ManagerPaper" }, { action: "read", subject: "ManagerPaper" }, { action: "create", subject: "ManagerPaper" }, { action: "update", subject: "ManagerPaper" }, { action: "delete", subject: "ManagerPaper" }], isSidebar: true, isHr: true, titleName: "", subNav: [
          { name: "articles", filter: true, addButton: false, addButtonText: "add", isVisible: true, path: "/finance/financial/accounting/articles", component: Articles, permissions: [{ action: "manage", subject: "ManagerPaper" }, { action: "read", subject: "ManagerPaper" }, { action: "create", subject: "ManagerPaper" }, { action: "update", subject: "ManagerPaper" }, { action: "delete", subject: "ManagerPaper" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
          { name: "direct", filter: false, addButton: true, addButtonText: "add", isVisible: true, path: "/finance/financial/accounting/directory/articles", component: DirectoryArticles, permissions: [{ action: "manage", subject: "ManagerPaper" }, { action: "read", subject: "ManagerPaper" }, { action: "create", subject: "ManagerPaper" }, { action: "update", subject: "ManagerPaper" }, { action: "delete", subject: "ManagerPaper" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
          { name: "appo", filter: true, addButton: true, addButtonText: "add", isVisible: true, path: "/finance/financial/accounting/directory/appointments", component: Default, permissions: [{ action: "hide", subject: "ManagerPaper" }], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false }
        ], subMenu: true
      },
      { name: "reportFor", filter: true, addButton: true, addButtonText: "add", isVisible: true, path: "/finance/report/period", component: MonthlyExpanse, permissions: [{ action: "manage", subject: "ManagerPaper" }, { action: "read", subject: "ManagerPaper" }, { action: "create", subject: "ManagerPaper" }, { action: "update", subject: "ManagerPaper" }, { action: "delete", subject: "ManagerPaper" }], isSidebar: true, isHr: false, titleName: "from", subNav: [], subMenu: false },
      { name: "reportFor", filter: false, addButton: false, addButtonText: "add", isVisible: true, path: "/finance/report/period/edit", component: MonthlyExpanseEdit, permissions: [{ action: "manage", subject: "ManagerPaper" }, { action: "read", subject: "ManagerPaper" }, { action: "create", subject: "ManagerPaper" }, { action: "update", subject: "ManagerPaper" }, { action: "delete", subject: "ManagerPaper" }], isSidebar: false, isHr: false, titleName: "", subNav: [], subMenu: false },
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
    permissions: [],
    subNavHeading: "",
    subNav: [
      { name: "analysis", filter: true, addButton: false, addButtonText: "create", isVisible: true, path: "/analysis/all", component: Analysis, permissions: [], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "income", filter: false, addButton: false, addButtonText: "create", isVisible: true, path: "/analysis/report", component: IncomeReport, permissions: [], isSidebar: false, isHr: false, titleName: "", subNav: [], subMenu: false },
      { name: "my", filter: true, addButton: false, addButtonText: "create", isVisible: true, path: "/analysis/transactions", component: Transactions, permissions: [], isSidebar: true, isHr: false, titleName: "", subNav: [], subMenu: false }
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
      { name: "clients", filter: true, addButton: true, addButtonText: "addClient", isVisible: true, path: "/marketing/clients", component: Clients, permissions: [{ action: "hide", subject: "LoyaltyProgram" }], isSidebar: true, subNav: [], subMenu: false },
      { name: "importClients", filter: true, addButton: false, addButtonText: "addClient", isVisible: true, path: "/marketing/clients/import", component: ClientsImport, permissions: [{ action: "hide", subject: "LoyaltyProgram" }], isSidebar: false, subNav: [], subMenu: false },
      { name: "clientProfile", filter: false, addButton: false, addButtonText: "edit", isVisible: true, path: "/marketing/clients/profile", component: ClientsProfile, permissions: [{ action: "hide", subject: "LoyaltyProgram" }], isSidebar: false, subNav: [], subMenu: false },
      { name: "segments", filter: false, addButton: false, addButtonText: "addSeg", isVisible: true, path: "/marketing/segments", component: Default, permissions: [{ action: "hide", subject: "LoyaltyProgram" }], isSidebar: true, subNav: [], subMenu: false },
      { name: "createSeg", filter: false, addButton: false, addButtonText: "addSeg", isVisible: true, path: "/marketing/segments/new", component: NewSegment, permissions: [{ action: "hide", subject: "LoyaltyProgram" }], isSidebar: false, subNav: [], subMenu: false },
      { name: "share", filter: false, addButton: false, addButtonText: "report", isVisible: true, path: "/marketing/share/constructor", component: Default, permissions: [{ action: "hide", subject: "LoyaltyProgram" }], isSidebar: true, subNav: [], subMenu: false },
      { name: "loyalty", filter: false, addButton: true, addButtonText: "newPromo", isVisible: true, path: "/marketing/loyalty", component: ShareConstructor, permissions: [{ action: "hide", subject: "LoyaltyProgram" }], isSidebar: true, subNav: [], subMenu: false },
      { name: "bonus", filter: false, addButton: false, addButtonText: "newPromo", isVisible: true, path: "/marketing/loyalty/rewards", component: RewardsCreation, permissions: [{ action: "hide", subject: "LoyaltyProgram" }], isSidebar: false, subNav: [], subMenu: false },
      { name: "bonus", filter: false, addButton: false, addButtonText: "newPromo", isVisible: true, path: "/marketing/loyalty/bonus", component: BonusProgram, permissions: [{ action: "hide", subject: "LoyaltyProgram" }], isSidebar: false, subNav: [], subMenu: false },
      { name: "marketRes", filter: false, addButton: false, addButtonText: "report", isVisible: true, path: "/marketing/market/research", component: Default, permissions: [{ action: "hide", subject: "LoyaltyProgram" }], isSidebar: true, subNav: [], subMenu: false },
    ],
    component: Marketing,
    isSidebar: true,
    permissions: [{ action: "hide", subject: "LoyaltyProgram" }]
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
      { name: "chemical", filter: true, addButton: false, addButtonText: "report", isVisible: true, path: "/equipment/chemical/consumption", component: ChemicalConsumption, permissions: [{ action: "manage", subject: "Incident" }, { action: "create", subject: "Incident" }, { action: "read", subject: "Incident" }, { action: "update", subject: "Incident" }, { action: "delete", subject: "Incident" }], isSidebar: true, subNav: [], subMenu: false },
      {
        name: "routine", filter: true, addButton: true, addButtonText: "create", isVisible: true, path: "/equipment/routine/work", component: RoutineWork, permissions: [{ action: "manage", subject: "TechTask" }, { action: "create", subject: "TechTask" }, { action: "read", subject: "TechTask" }, { action: "update", subject: "TechTask" }, { action: "delete", subject: "TechTask" }], isSidebar: true, subNav: [
          { name: "list", filter: true, addButton: false, addButtonText: "create", isVisible: true, path: "/equipment/routine/work/list", component: RoutineWork, permissions: [{ action: "manage", subject: "TechTask" }, { action: "create", subject: "TechTask" }, { action: "read", subject: "TechTask" }, { action: "update", subject: "TechTask" }, { action: "delete", subject: "TechTask" }], isSidebar: true },
          { name: "list", filter: false, addButton: false, addButtonText: "create", isVisible: true, path: "/equipment/routine/work/list/item", component: RoutineWorkItem, permissions: [{ action: "manage", subject: "TechTask" }, { action: "create", subject: "TechTask" }, { action: "read", subject: "TechTask" }, { action: "update", subject: "TechTask" }, { action: "delete", subject: "TechTask" }], isSidebar: false },
          { name: "progress", filter: true, addButton: false, addButtonText: "create", isVisible: true, path: "/equipment/routine/work/progress", component: ProgressReport, permissions: [{ action: "manage", subject: "TechTask" }, { action: "create", subject: "TechTask" }, { action: "read", subject: "TechTask" }, { action: "update", subject: "TechTask" }, { action: "delete", subject: "TechTask" }], isSidebar: true },
          { name: "progress", filter: false, addButton: false, addButtonText: "create", isVisible: true, path: "/equipment/routine/work/progress/item", component: ProgressReportItem, permissions: [{ action: "manage", subject: "TechTask" }, { action: "create", subject: "TechTask" }, { action: "read", subject: "TechTask" }, { action: "update", subject: "TechTask" }, { action: "delete", subject: "TechTask" }], isSidebar: false },
          { name: "createTask", filter: true, addButton: true, addButtonText: "create", isVisible: true, path: "/equipment/techtask/create", component: TechTaskCreate, permissions: [{ action: "manage", subject: "TechTask" }, { action: "create", subject: "TechTask" }, { action: "read", subject: "TechTask" }, { action: "update", subject: "TechTask" }, { action: "delete", subject: "TechTask" }], isSidebar: true }
        ], subMenu: true
      },
      { name: "consumption", filter: true, addButton: false, addButtonText: "create", isVisible: true, path: "/equipment/consumption/rate", component: ConsumptionRate, permissions: [{ action: "manage", subject: "Incident" }, { action: "create", subject: "Incident" }, { action: "read", subject: "Incident" }, { action: "update", subject: "Incident" }, { action: "delete", subject: "Incident" }], isSidebar: true, subNav: [], isHr: true },
      { titleName: "from", name: "equipmentFailure", filter: true, addButton: true, addButtonText: "fix", isVisible: true, path: "/equipment/failure", component: EquipmentFailure, permissions: [{ action: "manage", subject: "Incident" }, { action: "create", subject: "Incident" }, { action: "read", subject: "Incident" }, { action: "update", subject: "Incident" }, { action: "delete", subject: "Incident" }], isSidebar: true, subNav: [], isHr: true },
      { titleName: "settings", name: "replacing", filter: false, addButton: false, addButtonText: "fix", isVisible: true, path: "/equipment/replacing/programs", component: Default, permissions: [{ action: "hide", subject: "Incident" }], isSidebar: true, subNav: [] },
    ],
    component: Default,
    isSidebar: true,
    permissions: [{ action: "manage", subject: "Incident" }, { action: "create", subject: "Incident" }, { action: "read", subject: "Incident" }, { action: "update", subject: "Incident" }, { action: "delete", subject: "Incident" }, { action: "manage", subject: "TechTask" }, { action: "create", subject: "TechTask" }, { action: "read", subject: "TechTask" }, { action: "update", subject: "TechTask" }, { action: "delete", subject: "TechTask" }]
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
      { name: "ware", filter: true, addButton: true, addButtonText: "create", isVisible: true, path: "/warehouse/create", component: Warehouse, permissions: [{ action: "manage", subject: "Warehouse" }, { action: "read", subject: "Warehouse" }, { action: "create", subject: "Warehouse" }, { action: "update", subject: "Warehouse" }, { action: "delete", subject: "Warehouse" }], isSidebar: true, subNav: [], subMenu: false, isImport: true },
      { name: "nomenclature", filter: true, addButton: true, addButtonText: "create", isVisible: true, path: "/warehouse/inventory", component: InventoryCreation, permissions: [{ action: "manage", subject: "Warehouse" }, { action: "read", subject: "Warehouse" }, { action: "create", subject: "Warehouse" }, { action: "update", subject: "Warehouse" }, { action: "delete", subject: "Warehouse" }], isSidebar: true, subNav: [], subMenu: false, isImport: true },
      { name: "import", filter: false, addButton: false, addButtonText: "create", isVisible: true, path: "/warehouse/inventory/import", component: InventoryImport, permissions: [{ action: "manage", subject: "Warehouse" }, { action: "read", subject: "Warehouse" }, { action: "create", subject: "Warehouse" }, { action: "update", subject: "Warehouse" }, { action: "delete", subject: "Warehouse" }], isSidebar: false, subNav: [], subMenu: false },
      { name: "groups", filter: false, addButton: true, addButtonText: "create", isVisible: true, path: "/warehouse/inventoryGroups", component: InventoryGroups, permissions: [{ action: "manage", subject: "Warehouse" }, { action: "read", subject: "Warehouse" }, { action: "create", subject: "Warehouse" }, { action: "update", subject: "Warehouse" }, { action: "delete", subject: "Warehouse" }], isSidebar: true, subNav: [], subMenu: false },
      { name: "documents", filter: true, addButton: true, addButtonText: "createDo", isVisible: true, path: "/warehouse/documents", component: Documents, permissions: [{ action: "manage", subject: "Warehouse" }, { action: "read", subject: "Warehouse" }, { action: "create", subject: "Warehouse" }, { action: "update", subject: "Warehouse" }, { action: "delete", subject: "Warehouse" }], isSidebar: true, subNav: [], subMenu: false },
      { name: "createDo", filter: false, addButton: false, addButtonText: "create", isVisible: true, path: "/warehouse/documents/creation", component: DocumentsCreation, permissions: [{ action: "manage", subject: "Warehouse" }, { action: "read", subject: "Warehouse" }, { action: "create", subject: "Warehouse" }, { action: "update", subject: "Warehouse" }, { action: "delete", subject: "Warehouse" }], isSidebar: false, subNav: [], subMenu: false },
      { name: "createDo", filter: false, addButton: true, addButtonText: "edit", isVisible: true, path: "/warehouse/documents/view", component: DocumentView, permissions: [{ action: "manage", subject: "Warehouse" }, { action: "read", subject: "Warehouse" }, { action: "create", subject: "Warehouse" }, { action: "update", subject: "Warehouse" }, { action: "delete", subject: "Warehouse" }], isSidebar: false, subNav: [], subMenu: false },
      { name: "left", filter: true, addButton: false, addButtonText: "create", isVisible: true, path: "/warehouse/leftovers", component: OverheadCosts, permissions: [{ action: "manage", subject: "Warehouse" }, { action: "read", subject: "Warehouse" }, { action: "create", subject: "Warehouse" }, { action: "update", subject: "Warehouse" }, { action: "delete", subject: "Warehouse" }], isSidebar: true, subNav: [], subMenu: false },
      { name: "suppliers", filter: false, addButton: true, addButtonText: "create", isVisible: true, path: "/warehouse/suppliers", component: Suppliers, permissions: [{ action: "manage", subject: "Warehouse" }, { action: "read", subject: "Warehouse" }, { action: "create", subject: "Warehouse" }, { action: "update", subject: "Warehouse" }, { action: "delete", subject: "Warehouse" }], isSidebar: true, subNav: [], subMenu: false },
    ],
    permissions: [{ action: "manage", subject: "Warehouse" }, { action: "read", subject: "Warehouse" }, { action: "create", subject: "Warehouse" }, { action: "update", subject: "Warehouse" }, { action: "delete", subject: "Warehouse" }]
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
  },
  {
    name: "notifications",
    path: "/notifications",
    subMenu: false,
    component: Notifications,
    isSidebar: false,
    permissions: []
  }
];

export default routes;