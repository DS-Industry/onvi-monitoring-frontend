import i18n from '@/config/i18n';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 15;
export const ALL_PAGE_SIZES = ['15', '50', '100', '120'];
export const MAX_LEVELS = 5;
export const SIDEBAR_WIDTH = 256;
export const SIDEBAR_COLLAPSED_WIDTH = 80;

export enum ManagerPaperGroup {
  RENT = 'RENT',
  REVENUE = 'REVENUE',
  WAGES = 'WAGES',
  INVESTMENT_DEVIDENTS = 'INVESTMENT_DEVIDENTS',
  UTILITY_BILLS = 'UTILITY_BILLS',
  TAXES = 'TAXES',
  ACCOUNTABLE_FUNDS = 'ACCOUNTABLE_FUNDS',
  REPRESENTATIVE_EXPENSES = 'REPRESENTATIVE_EXPENSES',
  SALE_EQUIPMENT = 'SALE_EQUIPMENT',
  MANUFACTURE = 'MANUFACTURE',
  OTHER = 'OTHER',
  SUPPLIES = 'SUPPLIES',
  P_C = 'P_C',
  WAREHOUSE = 'WAREHOUSE',
  CONSTRUCTION = 'CONSTRUCTION',
  MAINTENANCE_REPAIR = 'MAINTENANCE_REPAIR',
  TRANSPORTATION_COSTS = 'TRANSPORTATION_COSTS',
}

export const groups: { name: string; value: string }[] = [
  { value: ManagerPaperGroup.RENT, name: i18n.t('finance.RENT') },
  { value: ManagerPaperGroup.REVENUE, name: i18n.t('finance.REVENUE') },
  { value: ManagerPaperGroup.WAGES, name: i18n.t('finance.WAGES') },
  {
    value: ManagerPaperGroup.INVESTMENT_DEVIDENTS,
    name: i18n.t('finance.INVESTMENT_DEVIDENTS'),
  },
  {
    value: ManagerPaperGroup.UTILITY_BILLS,
    name: i18n.t('finance.UTILITY_BILLS'),
  },
  { value: ManagerPaperGroup.TAXES, name: i18n.t('finance.TAXES') },
  {
    value: ManagerPaperGroup.ACCOUNTABLE_FUNDS,
    name: i18n.t('finance.ACCOUNTABLE_FUNDS'),
  },
  {
    value: ManagerPaperGroup.REPRESENTATIVE_EXPENSES,
    name: i18n.t('finance.REPRESENTATIVE_EXPENSES'),
  },
  {
    value: ManagerPaperGroup.SALE_EQUIPMENT,
    name: i18n.t('finance.SALE_EQUIPMENT'),
  },
  { value: ManagerPaperGroup.MANUFACTURE, name: i18n.t('finance.MANUFACTURE') },
  { value: ManagerPaperGroup.OTHER, name: i18n.t('finance.OTHER') },
  { value: ManagerPaperGroup.SUPPLIES, name: i18n.t('finance.SUPPLIES') },
  { value: ManagerPaperGroup.P_C, name: i18n.t('finance.P_C') },
  { value: ManagerPaperGroup.WAREHOUSE, name: i18n.t('finance.WAREHOUSE') },
  {
    value: ManagerPaperGroup.CONSTRUCTION,
    name: i18n.t('finance.CONSTRUCTION'),
  },
  {
    value: ManagerPaperGroup.MAINTENANCE_REPAIR,
    name: i18n.t('finance.MAINTENANCE_REPAIR'),
  },
  {
    value: ManagerPaperGroup.TRANSPORTATION_COSTS,
    name: i18n.t('finance.TRANSPORTATION_COSTS'),
  },
];

export enum ContractType {
  CORPORATE = 'CORPORATE',
  INDIVIDUAL = 'INDIVIDUAL',
}


export enum MarketingCampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}