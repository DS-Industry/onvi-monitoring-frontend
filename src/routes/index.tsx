import ReviewIcon from '@icons/review-icon.svg?react';
import AdministrationIcon from '@icons/administration-icon.svg?react';
import CarWashIcon from '@icons/car_wash-icon.svg?react';
import PersonnelIcon from '@icons/personnel-icon.svg?react';
import FinancesIcon from '@icons/finances-icon.svg?react';
import MonitoringIcon from '@icons/monitoring-icon.svg?react';
import LoyaltyIcon from '@icons/loyalty-icon.svg?react';
import EquipmentIcon from '@icons/equipment-icon.svg?react';
import WarehouseIcon from '@icons/warehouse-icon.svg?react';
import React from 'react';
import Articles from '@/pages/Finance/Articles';
import MonthlyExpanse from '@/pages/Finance/MonthlyExpanse';
import MonthlyExpanseEdit from '@/pages/Finance/MonthlyExpanseEdit';
import DirectoryArticles from '@/pages/Finance/DirectoryArticles';
import MarketingCompanies from '@/pages/Marketing/MarketingCompanies';
const Pos = React.lazy(() => import('@/pages/Pos/Pos'));
const Organization = React.lazy(
  () => import('@/pages/Organization/Organizations')
);
const FalseDeposits = React.lazy(() => import('@/pages/Finance/FalseDeposits'));
const FalseDeposit = React.lazy(() => import('@/pages/Finance/FalseDeposit'));
const DepositDevice = React.lazy(() => import('@/pages/Pos/DepositDevice'));
const ProgramDevices = React.lazy(() => import('@/pages/Pos/ProgramDevices'));
const ProgramDevice = React.lazy(() => import('@/pages/Pos/ProgramDevice'));
const LogIn = React.lazy(() => import('@/pages/Onboarding/LogIn'));
const ProfileForm = React.lazy(() => import('@/pages/Profile/Profile'));
const Default = React.lazy(() => import('@/pages/Default/Default'));
const Register = React.lazy(() => import('@/pages/Onboarding/Register'));
const ForgotPassword = React.lazy(
  () => import('@/pages/Onboarding/ForgotPassword')
);
const Deposit = React.lazy(() => import('@/pages/Pos/Deposit'));
const Programs = React.lazy(() => import('@/pages/Pos/Programs'));
const DepositDevices = React.lazy(() => import('@/pages/Pos/DepositDevices'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard/Dashboard'));
const EquipmentFailure = React.lazy(
  () => import('@/pages/Equipment/EquipmentFailure')
);
const ChemicalConsumption = React.lazy(
  () => import('@/pages/Equipment/ChemicalConsumption')
);
const TechTasks = React.lazy(() => import('@/pages/Equipment/TechTasks/index'));
const TechTaskItem = React.lazy(() => import('@/pages/Equipment/TechTaskItem'));
const ConsumptionRate = React.lazy(
  () => import('@/pages/Equipment/ConsumptionRate')
);
const InventoryCreation = React.lazy(
  () => import('@/pages/Warehouse/InventoryCreation')
);
const InventoryGroups = React.lazy(
  () => import('@/pages/Warehouse/InventoryGroups')
);
const OverheadCosts = React.lazy(
  () => import('@/pages/Warehouse/OverheadCosts')
);
const Suppliers = React.lazy(() => import('@/pages/Warehouse/Suppliers'));
const InventoryImport = React.lazy(
  () => import('@/pages/Warehouse/InventoryImport')
);
const Documents = React.lazy(() => import('@/pages/Warehouse/Documents'));
const DocumentsCreation = React.lazy(
  () => import('@/pages/Warehouse/DocumentsCreation/index')
);
const SalePrice = React.lazy(
  () => import('@/pages/Warehouse/SalePrice/SalePrice.tsx')
);
const SaleDocument = React.lazy(
  () => import('@/pages/Finance/SaleDocument/SaleDocument.tsx')
);
const SaleDocumentView = React.lazy(
  () => import('@/pages/Finance/SaleDocument/SaleDocumentView.tsx')
);
const SaleDocumentCreate = React.lazy(
  () => import('@/pages/Finance/SaleDocument/SaleDocumentCreate.tsx')
);
const DocumentView = React.lazy(() => import('@/pages/Warehouse/DocumentView'));
const Clients = React.lazy(() => import('@/pages/Marketing/Clients'));
const CorporateClients = React.lazy(
  () => import('@/pages/Marketing/CorporateClients')
);

const MarketingLoyalty = React.lazy(
  () => import('@/pages/Marketing/MarketingLoyalty')
);
const ClientsImport = React.lazy(
  () => import('@/pages/Marketing/ClientsImport')
);
const Marketing = React.lazy(() => import('@/pages/Marketing/Marketing'));
const ClientsProfile = React.lazy(
  () => import('@/pages/Marketing/ClientsProfile')
);
const BonusProgram = React.lazy(() => import('@/pages/Marketing/BonusProgram'));
const NewSegment = React.lazy(() => import('@/pages/Marketing/NewSegment'));
const Collection = React.lazy(() => import('@/pages/Finance/Collection'));
const CollectionCreation = React.lazy(
  () => import('@/pages/Finance/CollectionCreation')
);

const Timesheet = React.lazy(() => import('@/pages/Finance/Timesheet'));
const TimesheetView = React.lazy(() => import('@/pages/Finance/TimeSheetView'));
const Timestamps = React.lazy(() => import('@/pages/Finance/Timestamps'));
const IncomeReport = React.lazy(() => import('@/pages/Analysis/IncomeReport'));
const Transactions = React.lazy(() => import('@/pages/Analysis/Transactions'));
const ListOfEmployees = React.lazy(
  () => import('@/pages/Organization/ListOfEmployees/index')
);
const ListOfRoles = React.lazy(
  () => import('@/pages/Organization/ListOfRoles')
);
const PosTabs = React.lazy(() => import('@/pages/Organization/PosTabs'));
const PlanAct = React.lazy(() => import('@/pages/Pos/PlanAct'));
const InviteUser = React.lazy(() => import('@/pages/Onboarding/InviteUser'));
const Employees = React.lazy(() => import('@/pages/Hr/Employees'));
const Positions = React.lazy(() => import('@/pages/Hr/Positions'));
const SalaryCalculation = React.lazy(
  () => import('@/pages/Hr/SalaryCalculation')
);
const EmployeeAdvance = React.lazy(() => import('@/pages/Hr/EmployeeAdvance'));
const EmployeeProfile = React.lazy(() => import('@/pages/Hr/EmployeeProfile'));
const SalaryCalculationCreation = React.lazy(
  () => import('@/pages/Hr/SalaryCalculationCreation')
);
const Notifications = React.lazy(
  () => import('@/pages/Notifications/Notifications')
);
const RewardsCreation = React.lazy(
  () => import('@/pages/Marketing/RewardsCreation')
);
const LoyaltyHubRequests = React.lazy(
  () => import('@/pages/Marketing/LoyaltyHubRequests')
);
const LoyaltyParticipantRequests = React.lazy(
  () => import('@/pages/Marketing/LoyaltyParticipantRequests')
);
const EmployeeAdvanceCreation = React.lazy(
  () => import('@/pages/Hr/EmployeeAdvanceCreation')
);
const Subscriptions = React.lazy(
  () => import('@/pages/Organization/Subscriptions')
);
const Analysis = React.lazy(() => import('@/pages/Analysis/Analysis'));
const Warehouse = React.lazy(() => import('@/pages/Warehouse/Warehouse'));

const routes = [
  {
    name: 'dashboard',
    path: '/',
    subMenu: false,
    icon: ReviewIcon,
    component: Dashboard,
    isSidebar: true,
    permissions: [],
  },
  {
    name: 'administration',
    path: '/administration',
    subMenu: true,
    icon: AdministrationIcon,
    subNavHeading: '',
    component: Default,
    permissions: [
      { action: 'manage', subject: 'Organization' },
      { action: 'create', subject: 'Organization' },
      { action: 'read', subject: 'Organization' },
      { action: 'update', subject: 'Organization' },
      { action: 'delete', subject: 'Organization' },
      { action: 'manage', subject: 'Pos' },
      { action: 'create', subject: 'Pos' },
      { action: 'read', subject: 'Pos' },
    ],
    subNav: [
      {
        name: 'subscriptions',
        isVisible: true,
        path: '/administration/subscriptions',
        component: Subscriptions,
        permissions: [
          { action: 'manage', subject: 'Organization' },
          { action: 'create', subject: 'Organization' },
          { action: 'read', subject: 'Organization' },
          { action: 'update', subject: 'Organization' },
          { action: 'delete', subject: 'Organization' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'accessRights',
        isVisible: true,
        path: '/administration/accessRights',
        component: Default,
        permissions: [
          { action: 'manage', subject: 'Organization' },
          { action: 'update', subject: 'Organization' },
          { action: 'read', subject: 'Organization' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [
          {
            name: 'listOf',
            isVisible: true,
            path: '/administration/accessRights/employees',
            component: ListOfEmployees,
            permissions: [
              { action: 'manage', subject: 'Organization' },
              { action: 'update', subject: 'Organization' },
            ],
            isSidebar: true,
            isHr: false,
            titleName: '',
            subNav: [],
            subMenu: false,
          },
          {
            name: 'listRoles',
            isVisible: true,
            path: '/administration/accessRights/roles',
            component: ListOfRoles,
            permissions: [
              { action: 'manage', subject: 'Organization' },
              { action: 'read', subject: 'Organization' },
            ],
            isSidebar: true,
            isHr: false,
            titleName: '',
            subNav: [],
            subMenu: false,
          },
          {
            name: 'pos',
            isVisible: true,
            path: '/administration/accessRights/pos/tabs',
            component: PosTabs,
            permissions: [
              { action: 'manage', subject: 'Organization' },
              { action: 'update', subject: 'Organization' },
            ],
            isSidebar: true,
            isHr: false,
            titleName: '',
            subNav: [],
            subMenu: false,
          },
        ],
        subMenu: true,
      },
      {
        name: 'legalEntities',
        isVisible: true,
        path: '/administration/legalRights',
        component: Organization,
        permissions: [
          { action: 'manage', subject: 'Organization' },
          { action: 'create', subject: 'Organization' },
          { action: 'read', subject: 'Organization' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'objectManagement',
        isVisible: true,
        path: '/administration/objectManagement',
        component: Pos,
        permissions: [
          { action: 'manage', subject: 'Pos' },
          { action: 'create', subject: 'Pos' },
          { action: 'read', subject: 'Pos' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
    ],
    isSidebar: true,
  },
  {
    name: 'station',
    path: '/station',
    subMenu: true,
    icon: CarWashIcon,
    subNavHeading: '',
    permissions: [
      { action: 'manage', subject: 'Pos' },
      { action: 'create', subject: 'Pos' },
      { action: 'read', subject: 'Pos' },
      { action: 'update', subject: 'Pos' },
      { action: 'delete', subject: 'Pos' },
    ],
    subNav: [
      {
        name: 'services',
        isVisible: false,
        path: '/station/services',
        component: Default,
        permissions: [{ action: 'manag', subject: 'Pos' }],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'deposits',
        isVisible: false,
        path: '/station/enrollments',
        component: DepositDevices,
        permissions: [
          { action: 'manage', subject: 'Pos' },
          { action: 'read', subject: 'Pos' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'depositDevices',
        isVisible: false,
        path: '/station/enrollments/devices',
        component: Deposit,
        permissions: [
          { action: 'manage', subject: 'Pos' },
          { action: 'read', subject: 'Pos' },
        ],
        isSidebar: false,
      },
      {
        name: 'depositDevice',
        isVisible: false,
        path: '/station/enrollments/device',
        component: DepositDevice,
        permissions: [
          { action: 'manage', subject: 'Pos' },
          { action: 'read', subject: 'Pos' },
        ],
        isSidebar: false,
      },
      {
        name: 'programs',
        isVisible: false,
        path: '/station/programs',
        component: ProgramDevices,
        permissions: [
          { action: 'manage', subject: 'Pos' },
          { action: 'read', subject: 'Pos' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'programDevices',
        isVisible: false,
        path: '/station/programs/devices',
        component: Programs,
        permissions: [
          { action: 'manage', subject: 'Pos' },
          { action: 'read', subject: 'Pos' },
        ],
        isSidebar: false,
      },
      {
        name: 'programDevice',
        isVisible: false,
        path: '/station/programs/device',
        component: ProgramDevice,
        permissions: [
          { action: 'manage', subject: 'Pos' },
          { action: 'read', subject: 'Pos' },
        ],
        isSidebar: false,
      },
      {
        name: 'planAct',
        isVisible: true,
        path: '/station/plan/act',
        component: PlanAct,
        permissions: [
          { action: 'manage', subject: 'Pos' },
          { action: 'read', subject: 'Pos' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'cleaning',
        isVisible: false,
        path: '/station/cleaning',
        component: Default,
        permissions: [{ action: 'manag', subject: 'Pos' }],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'simpleBoxes',
        isVisible: false,
        path: '/station/simpleBoxes',
        component: Default,
        permissions: [{ action: 'manag', subject: 'Pos' }],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
    ],
    component: Default,
    isSidebar: true,
  },
  {
    name: 'hr',
    path: '/Hr',
    subMenu: true,
    icon: PersonnelIcon,
    component: Default,
    isSidebar: true,
    permissions: [
      { action: 'manage', subject: 'Hr' },
      { action: 'create', subject: 'Hr' },
      { action: 'read', subject: 'Hr' },
      { action: 'update', subject: 'Hr' },
    ],
    subNavHeading: '',
    subNav: [
      {
        name: 'employees',
        isVisible: true,
        path: '/hr/employees',
        component: Employees,
        permissions: [
          { action: 'manage', subject: 'Hr' },
          { action: 'read', subject: 'Hr' },
          { action: 'update', subject: 'Hr' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'sid',
        isVisible: true,
        path: '/hr/employees/profile',
        component: EmployeeProfile,
        permissions: [
          { action: 'manage', subject: 'Hr' },
          { action: 'create', subject: 'Hr' },
          { action: 'read', subject: 'Hr' },
          { action: 'update', subject: 'Hr' },
        ],
        isSidebar: false,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'positions',
        isVisible: true,
        path: '/hr/positions',
        component: Positions,
        permissions: [
          { action: 'manage', subject: 'Hr' },
          { action: 'read', subject: 'Hr' },
          { action: 'update', subject: 'Hr' },
        ],
        isSidebar: true,
        isHr: true,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'salary',
        isVisible: true,
        path: '/hr/salary',
        component: SalaryCalculation,
        permissions: [
          { action: 'manage', subject: 'Hr' },
          { action: 'create', subject: 'Hr' },
          { action: 'read', subject: 'Hr' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: 'reports',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'sal',
        isVisible: true,
        path: '/hr/salary/creation',
        component: SalaryCalculationCreation,
        permissions: [
          { action: 'manage', subject: 'Hr' },
          { action: 'create', subject: 'Hr' },
          { action: 'read', subject: 'Hr' },
          { action: 'update', subject: 'Hr' },
        ],
        isSidebar: false,
        isHr: false,
        titleName: 'reports',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'empAdv',
        isVisible: true,
        path: '/hr/employee/advance',
        component: EmployeeAdvance,
        permissions: [
          { action: 'manage', subject: 'Hr' },
          { action: 'create', subject: 'Hr' },
          { action: 'read', subject: 'Hr' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'empAdv',
        isVisible: true,
        path: '/hr/employee/advance/creation',
        component: EmployeeAdvanceCreation,
        permissions: [
          { action: 'manage', subject: 'Hr' },
          { action: 'create', subject: 'Hr' },
          { action: 'read', subject: 'Hr' },
          { action: 'update', subject: 'Hr' },
        ],
        isSidebar: false,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
    ],
  },
  {
    name: 'finance',
    path: '/finance',
    subMenu: true,
    icon: FinancesIcon,
    component: Default,
    isSidebar: true,
    permissions: [
      { action: 'manage', subject: 'CashCollection' },
      { action: 'read', subject: 'CashCollection' },
      { action: 'create', subject: 'CashCollection' },
      { action: 'update', subject: 'CashCollection' },
      { action: 'delete', subject: 'CashCollection' },
      { action: 'manage', subject: 'ShiftReport' },
      { action: 'create', subject: 'ShiftReport' },
      { action: 'read', subject: 'ShiftReport' },
      { action: 'update', subject: 'ShiftReport' },
      { action: 'delete', subject: 'ShiftReport' },
      { action: 'create', subject: 'ManagerPaper' },
      { action: 'read', subject: 'ManagerPaper' },
      { action: 'update', subject: 'ManagerPaper' },
      { action: 'delete', subject: 'ManagerPaper' },
      { action: 'manage', subject: 'Pos' },
      { action: 'read', subject: 'Pos' },
      { action: 'delete', subject: 'Pos' },
    ],
    subNavHeading: '',
    subNav: [
      {
        name: 'collection',
        isVisible: true,
        path: '/finance/collection',
        component: Collection,
        permissions: [
          { action: 'manage', subject: 'CashCollection' },
          { action: 'read', subject: 'CashCollection' },
          { action: 'create', subject: 'CashCollection' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'collection',
        isVisible: true,
        path: '/finance/collection/creation',
        component: CollectionCreation,
        permissions: [
          { action: 'manage', subject: 'CashCollection' },
          { action: 'read', subject: 'CashCollection' },
          { action: 'create', subject: 'CashCollection' },
          { action: 'update', subject: 'CashCollection' },
        ],
        isSidebar: false,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'timestamp',
        isVisible: true,
        path: '/finance/timestamp',
        component: Timestamps,
        permissions: [
          { action: 'manage', subject: 'CashCollection' },
          { action: 'read', subject: 'CashCollection' },
          { action: 'create', subject: 'CashCollection' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'period',
        isVisible: true,
        path: '/finance/period',
        component: Default,
        permissions: [{ action: 'hide', subject: 'CashCollection' }],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'employee',
        isVisible: true,
        path: '/finance/timesheet',
        component: Timesheet,
        permissions: [
          { action: 'manage', subject: 'ShiftReport' },
          { action: 'read', subject: 'ShiftReport' },
          { action: 'create', subject: 'ShiftReport' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'timesheetView',
        isVisible: true,
        path: '/finance/timesheet/view',
        component: TimesheetView,
        permissions: [
          { action: 'manage', subject: 'ShiftReport' },
          { action: 'read', subject: 'ShiftReport' },
          { action: 'create', subject: 'ShiftReport' },
        ],
        isSidebar: false,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'financial',
        isVisible: true,
        path: '/finance/financial/accounting',
        component: Default,
        permissions: [
          { action: 'manage', subject: 'ManagerPaper' },
          { action: 'read', subject: 'ManagerPaper' },
          { action: 'create', subject: 'ManagerPaper' },
          { action: 'update', subject: 'ManagerPaper' },
          { action: 'delete', subject: 'ManagerPaper' },
        ],
        isSidebar: true,
        isHr: true,
        titleName: '',
        subNav: [
          {
            name: 'articles',
            isVisible: true,
            path: '/finance/financial/accounting/articles',
            component: Articles,
            permissions: [
              { action: 'manage', subject: 'ManagerPaper' },
              { action: 'read', subject: 'ManagerPaper' },
              { action: 'create', subject: 'ManagerPaper' },
              { action: 'update', subject: 'ManagerPaper' },
              { action: 'delete', subject: 'ManagerPaper' },
            ],
            isSidebar: true,
            isHr: false,
            titleName: '',
            subNav: [],
            subMenu: false,
          },
          {
            name: 'direct',
            isVisible: true,
            path: '/finance/financial/accounting/directory/articles',
            component: DirectoryArticles,
            permissions: [
              { action: 'manage', subject: 'ManagerPaper' },
              { action: 'read', subject: 'ManagerPaper' },
              { action: 'update', subject: 'ManagerPaper' },
            ],
            isSidebar: true,
            isHr: false,
            titleName: '',
            subNav: [],
            subMenu: false,
          },
          {
            name: 'appo',
            isVisible: true,
            path: '/finance/financial/accounting/directory/appointments',
            component: Default,
            permissions: [{ action: 'hide', subject: 'ManagerPaper' }],
            isSidebar: true,
            isHr: false,
            titleName: '',
            subNav: [],
            subMenu: false,
          },
        ],
        subMenu: true,
      },
      {
        name: 'reportFor',
        isVisible: true,
        path: '/finance/report/period',
        component: MonthlyExpanse,
        permissions: [
          { action: 'manage', subject: 'ManagerPaper' },
          { action: 'read', subject: 'ManagerPaper' },
          { action: 'create', subject: 'ManagerPaper' },
          { action: 'delete', subject: 'ManagerPaper' },
        ],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'reportFor',
        isVisible: true,
        path: '/finance/report/period/edit',
        component: MonthlyExpanseEdit,
        permissions: [
          { action: 'manage', subject: 'ManagerPaper' },
          { action: 'read', subject: 'ManagerPaper' },
          { action: 'create', subject: 'ManagerPaper' },
          { action: 'delete', subject: 'ManagerPaper' },
        ],
        isSidebar: false,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'saleDocument',
        path: '/finance/saleDocument',
        isVisible: true,
        subMenu: false,
        component: SaleDocument,
        isSidebar: true,
        permissions: [],
      },
      {
        name: 'saleDocumentView',
        path: '/finance/saleDocument/view',
        isVisible: true,
        subMenu: false,
        component: SaleDocumentView,
        isSidebar: false,
        permissions: [],
      },
      {
        name: 'saleDocumentCreate',
        path: '/finance/saleDocument/create',
        isVisible: true,
        subMenu: false,
        component: SaleDocumentCreate,
        isSidebar: false,
        permissions: [],
      },
      {
        name: 'debugging',
        isVisible: true,
        path: '/finance/debugging',
        component: Default,
        permissions: [
          { action: 'manage', subject: 'Pos' },
          { action: 'read', subject: 'Pos' },
          { action: 'delete', subject: 'Pos' },
        ],
        isSidebar: true,
        isHr: true,
        titleName: '',
        subNav: [
          {
            name: 'falseDeposits',
            isVisible: true,
            path: '/finance/debugging/false/deposits',
            component: FalseDeposits,
            permissions: [
              { action: 'manage', subject: 'Pos' },
              { action: 'read', subject: 'Pos' },
              { action: 'delete', subject: 'Pos' },
            ],
            isSidebar: true,
            isHr: false,
            titleName: '',
            subNav: [],
            subMenu: false,
          },
          {
            name: 'falseDeposit',
            isVisible: true,
            path: '/finance/debugging/false/deposit',
            component: FalseDeposit,
            permissions: [
              { action: 'manage', subject: 'Pos' },
              { action: 'read', subject: 'Pos' },
              { action: 'delete', subject: 'Pos' },
            ],
            isSidebar: false,
            isHr: false,
            titleName: '',
            subNav: [],
            subMenu: false,
          },
        ],
        subMenu: true,
      },
    ],
  },
  {
    name: 'analysis',
    path: '/analysis',
    subMenu: true,
    icon: MonitoringIcon,
    component: Default,
    isSidebar: true,
    permissions: [],
    subNavHeading: '',
    subNav: [
      {
        name: 'analysis',
        isVisible: true,
        path: '/analysis/all',
        component: Analysis,
        permissions: [],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'income',
        isVisible: true,
        path: '/analysis/report',
        component: IncomeReport,
        permissions: [],
        isSidebar: false,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
      {
        name: 'my',
        isVisible: true,
        path: '/analysis/transactions',
        component: Transactions,
        permissions: [],
        isSidebar: true,
        isHr: false,
        titleName: '',
        subNav: [],
        subMenu: false,
      },
    ],
  },
  {
    name: 'marketing',
    path: '/marketing',
    subMenu: true,
    icon: LoyaltyIcon,
    subNavHeading: '',
    subNav: [
      {
        name: 'clients',
        isVisible: true,
        path: '/marketing/clients',
        component: Clients,
        permissions: [{ action: 'update', subject: 'LTYProgram' }],
        isSidebar: true,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'corporateClients',
        isVisible: true,
        path: '/marketing/corporate-clients',
        component: CorporateClients,
        permissions: [{ action: 'update', subject: 'LTYProgram' }],
        isSidebar: true,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'corporateClientProfile',
        isVisible: true,
        path: '/marketing/corporate-clients/profile',
        component: React.lazy(
          () => import('@/pages/Marketing/CorporateClients/CorporateProfile')
        ),
        permissions: [{ action: 'update', subject: 'LTYProgram' }],
        isSidebar: false,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'marketingCompanies',
        isVisible: true,
        path: '/marketing/companies',
        component: MarketingCompanies,
        permissions: [{ action: 'update', subject: 'LTYProgram' }],
        isSidebar: true,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'newMarketingCampaign',
        isVisible: true,
        path: '/marketing/companies/new/marketing/campaign',
        component: React.lazy(
          () => import('@/pages/Marketing/NewMarketingCampaign')
        ),
        permissions: [{ action: 'update', subject: 'LTYProgram' }],
        isSidebar: false,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'importClients',
        isVisible: true,
        path: '/marketing/clients/import',
        component: ClientsImport,
        permissions: [{ action: 'update', subject: 'LTYProgram' }],
        isSidebar: false,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'clientProfile',
        isVisible: true,
        path: '/marketing/clients/profile',
        component: ClientsProfile,
        permissions: [{ action: 'update', subject: 'LTYProgram' }],
        isSidebar: false,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'segments',
        isVisible: false,
        path: '/marketing/segments',
        component: Default,
        permissions: [{ action: 'manage', subject: 'LTYProgram' }],
        isSidebar: false,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'createSeg',
        isVisible: true,
        path: '/marketing/segments/new',
        component: NewSegment,
        permissions: [{ action: 'manage', subject: 'LTYProgram' }],
        isSidebar: false,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'loyalty',
        isVisible: true,
        path: '/marketing/loyalty',
        component: MarketingLoyalty,
        permissions: [{ action: 'update', subject: 'LTYProgram' }],
        isSidebar: true,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'bonus',
        isVisible: true,
        path: '/marketing/loyalty/rewards',
        component: RewardsCreation,
        permissions: [{ action: 'update', subject: 'LTYProgram' }],
        isSidebar: false,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'bonus',
        isVisible: true,
        path: '/marketing/loyalty/bonus',
        component: BonusProgram,
        permissions: [{ action: 'update', subject: 'LTYProgram' }],
        isSidebar: false,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'hubRequests',
        isVisible: true,
        path: '/marketing/hub-requests',
        component: LoyaltyHubRequests,
        permissions: [{ action: 'manage', subject: 'LTYProgram' }],
        isSidebar: true,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'participantRequests',
        isVisible: true,
        path: '/marketing/participant-requests',
        component: LoyaltyParticipantRequests,
        permissions: [{ action: 'manage', subject: 'LTYProgram' }],
        isSidebar: true,
        subNav: [],
        subMenu: false,
      },
    ],
    component: Marketing,
    isSidebar: true,
    permissions: [{ action: 'update', subject: 'LTYProgram' }],
  },
  {
    name: 'equipment',
    path: '/equipment',
    subMenu: true,
    icon: EquipmentIcon,
    subNavHeading: 'dailyOptions',
    subNav: [
      {
        name: 'chemical',
        isVisible: true,
        path: '/equipment/chemical/consumption',
        component: ChemicalConsumption,
        permissions: [
          { action: 'manage', subject: 'Incident' },
          { action: 'read', subject: 'Incident' },
        ],
        isSidebar: true,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'technicalTasks',
        isVisible: true,
        path: '/equipment/technical/tasks',
        component: TechTasks,
        permissions: [
          { action: 'manage', subject: 'TechTask' },
          { action: 'create', subject: 'TechTask' },
          { action: 'read', subject: 'TechTask' },
          { action: 'update', subject: 'TechTask' },
          { action: 'delete', subject: 'TechTask' },
        ],
        isSidebar: true,
        subNav: [
          {
            name: 'list',
            isVisible: true,
            path: '/equipment/technical/tasks/list',
            component: TechTasks,
            permissions: [
              { action: 'manage', subject: 'TechTask' },
              { action: 'create', subject: 'TechTask' },
              { action: 'read', subject: 'TechTask' },
              { action: 'update', subject: 'TechTask' },
              { action: 'delete', subject: 'TechTask' },
            ],
            isSidebar: true,
          },
          {
            name: 'list',
            isVisible: true,
            path: '/equipment/technical/tasks/list/item',
            component: TechTaskItem,
            permissions: [
              { action: 'manage', subject: 'TechTask' },
              { action: 'create', subject: 'TechTask' },
              { action: 'read', subject: 'TechTask' },
              { action: 'update', subject: 'TechTask' },
              { action: 'delete', subject: 'TechTask' },
            ],
            isSidebar: false,
          },
        ],
        subMenu: true,
      },
      {
        name: 'consumption',
        isVisible: true,
        path: '/equipment/consumption/rate',
        component: ConsumptionRate,
        permissions: [
          { action: 'manage', subject: 'Incident' },
          { action: 'update', subject: 'Incident' },
        ],
        isSidebar: true,
        subNav: [],
        isHr: true,
      },
      {
        titleName: 'from',
        name: 'equipmentFailure',
        isVisible: true,
        path: '/equipment/failure',
        component: EquipmentFailure,
        permissions: [
          { action: 'manage', subject: 'Incident' },
          { action: 'create', subject: 'Incident' },
          { action: 'read', subject: 'Incident' },
          { action: 'update', subject: 'Incident' },
        ],
        isSidebar: true,
        subNav: [],
        isHr: true,
      },
      {
        titleName: '',
        name: 'replacing',
        isVisible: true,
        path: '/equipment/replacing/programs',
        component: Default,
        permissions: [{ action: 'hide', subject: 'Incident' }],
        isSidebar: true,
        subNav: [],
      },
    ],
    component: Default,
    isSidebar: true,
    permissions: [
      { action: 'manage', subject: 'Incident' },
      { action: 'create', subject: 'Incident' },
      { action: 'read', subject: 'Incident' },
      { action: 'update', subject: 'Incident' },
      { action: 'delete', subject: 'Incident' },
      { action: 'manage', subject: 'TechTask' },
      { action: 'create', subject: 'TechTask' },
      { action: 'read', subject: 'TechTask' },
      { action: 'update', subject: 'TechTask' },
      { action: 'delete', subject: 'TechTask' },
    ],
  },
  {
    name: 'store',
    path: '/warehouse',
    subMenu: true,
    icon: WarehouseIcon,
    component: Default,
    isSidebar: true,
    subNavHeading: '',
    subNav: [
      {
        name: 'ware',
        isVisible: true,
        path: '/warehouse/create',
        component: Warehouse,
        permissions: [
          { action: 'manage', subject: 'Warehouse' },
          { action: 'read', subject: 'Warehouse' },
          { action: 'update', subject: 'Warehouse' },
        ],
        isSidebar: true,
        subNav: [],
        subMenu: false,
        isImport: true,
      },
      {
        name: 'nomenclature',
        isVisible: true,
        path: '/warehouse/inventory',
        component: InventoryCreation,
        permissions: [
          { action: 'manage', subject: 'Warehouse' },
          { action: 'read', subject: 'Warehouse' },
          { action: 'update', subject: 'Warehouse' },
          { action: 'delete', subject: 'Warehouse' },
        ],
        isSidebar: true,
        subNav: [],
        subMenu: false,
        isImport: true,
      },
      {
        name: 'import',
        isVisible: true,
        path: '/warehouse/inventory/import',
        component: InventoryImport,
        permissions: [
          { action: 'manage', subject: 'Warehouse' },
          { action: 'read', subject: 'Warehouse' },
          { action: 'create', subject: 'Warehouse' },
          { action: 'update', subject: 'Warehouse' },
          { action: 'delete', subject: 'Warehouse' },
        ],
        isSidebar: false,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'groups',
        isVisible: true,
        path: '/warehouse/inventoryGroups',
        component: InventoryGroups,
        permissions: [
          { action: 'manage', subject: 'Warehouse' },
          { action: 'read', subject: 'Warehouse' },
          { action: 'create', subject: 'Warehouse' },
          { action: 'update', subject: 'Warehouse' },
          { action: 'delete', subject: 'Warehouse' },
        ],
        isSidebar: true,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'documents',
        isVisible: true,
        path: '/warehouse/documents',
        component: Documents,
        permissions: [
          { action: 'manage', subject: 'Warehouse' },
          { action: 'read', subject: 'Warehouse' },
          { action: 'create', subject: 'Warehouse' },
          { action: 'update', subject: 'Warehouse' },
          { action: 'delete', subject: 'Warehouse' },
        ],
        isSidebar: true,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'createDo',
        isVisible: true,
        path: '/warehouse/documents/creation',
        component: DocumentsCreation,
        permissions: [
          { action: 'manage', subject: 'Warehouse' },
          { action: 'read', subject: 'Warehouse' },
          { action: 'create', subject: 'Warehouse' },
          { action: 'update', subject: 'Warehouse' },
          { action: 'delete', subject: 'Warehouse' },
        ],
        isSidebar: false,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'createDo',
        isVisible: true,
        path: '/warehouse/documents/view',
        component: DocumentView,
        permissions: [
          { action: 'manage', subject: 'Warehouse' },
          { action: 'read', subject: 'Warehouse' },
          { action: 'create', subject: 'Warehouse' },
          { action: 'update', subject: 'Warehouse' },
          { action: 'delete', subject: 'Warehouse' },
        ],
        isSidebar: false,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'left',
        isVisible: true,
        path: '/warehouse/leftovers',
        component: OverheadCosts,
        permissions: [
          { action: 'manage', subject: 'Warehouse' },
          { action: 'read', subject: 'Warehouse' },
          { action: 'create', subject: 'Warehouse' },
          { action: 'update', subject: 'Warehouse' },
          { action: 'delete', subject: 'Warehouse' },
        ],
        isSidebar: true,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'suppliers',
        isVisible: true,
        path: '/warehouse/suppliers',
        component: Suppliers,
        permissions: [
          { action: 'manage', subject: 'Warehouse' },
          { action: 'read', subject: 'Warehouse' },
          { action: 'create', subject: 'Warehouse' },
          { action: 'update', subject: 'Warehouse' },
          { action: 'delete', subject: 'Warehouse' },
        ],
        isSidebar: true,
        subNav: [],
        subMenu: false,
      },
      {
        name: 'salePrice',
        path: '/warehouse/salePrice',
        isVisible: true,
        subMenu: false,
        component: SalePrice,
        isSidebar: true,
        permissions: [],
      },
    ],
    permissions: [
      { action: 'manage', subject: 'Warehouse' },
      { action: 'read', subject: 'Warehouse' },
      { action: 'create', subject: 'Warehouse' },
      { action: 'update', subject: 'Warehouse' },
      { action: 'delete', subject: 'Warehouse' },
    ],
  },
  {
    name: 'Register',
    path: '/register',
    subMenu: false,
    component: Register,
    isSidebar: false,
    isPublicRoute: true,
    permissions: [],
  },
  {
    name: 'Login',
    path: '/login',
    subMenu: false,
    component: LogIn,
    isSidebar: false,
    isPublicRoute: true,
    permissions: [],
  },
  {
    name: 'Forgot Password',
    path: '/forgotPassword',
    subMenu: false,
    component: ForgotPassword,
    isSidebar: false,
    isPublicRoute: true,
    permissions: [],
  },
  {
    name: 'Invite User',
    path: '/inviteUser',
    subMenu: false,
    component: InviteUser,
    isSidebar: false,
    isPublicRoute: true,
    permissions: [],
  },
  {
    name: 'profile',
    path: '/profile',
    subMenu: false,
    component: ProfileForm,
    isSidebar: false,
    permissions: [],
  },
  {
    name: 'notifications',
    path: '/notifications',
    subMenu: false,
    component: Notifications,
    isSidebar: false,
    permissions: [],
  },
];

export default routes;

interface Permission {
  action: string;
  subject: string;
}

export interface RouteItem {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  isSidebar?: boolean;
  permissions?: Permission[];
  subMenu?: boolean;
  subNav?: RouteItem[];
  subNavHeading?: string;
  titleName?: string;
  isHr?: boolean;
}
