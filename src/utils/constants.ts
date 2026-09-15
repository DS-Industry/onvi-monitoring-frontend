export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 15;
export const ALL_PAGE_SIZES = ['15', '50', '100', '120'];
export const MAX_LEVELS = 5;

export enum ManagerPaperGroup {
  AMS_REVENUE = 'AMS_REVENUE',
  CASH_TO_VRN = 'CASH_TO_VRN',
  RENT = 'RENT',
  BANK_DEPOSIT = 'BANK_DEPOSIT',
  PROFIT_WITHDRAWAL = 'PROFIT_WITHDRAWAL',
  WAGES = 'WAGES',
  ACCOUNTABLE_ISSUE = 'ACCOUNTABLE_ISSUE',
  OTHER_INCOME = 'OTHER_INCOME',
  OTHER_EXPENSE = 'OTHER_EXPENSE',
  REVENUE = 'REVENUE',
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

export const WRITABLE_MANAGER_PAPER_GROUPS = [
  ManagerPaperGroup.AMS_REVENUE,
  ManagerPaperGroup.CASH_TO_VRN,
  ManagerPaperGroup.RENT,
  ManagerPaperGroup.BANK_DEPOSIT,
  ManagerPaperGroup.PROFIT_WITHDRAWAL,
  ManagerPaperGroup.WAGES,
  ManagerPaperGroup.ACCOUNTABLE_ISSUE,
  ManagerPaperGroup.OTHER_INCOME,
  ManagerPaperGroup.OTHER_EXPENSE,
] as const;

export const ARCHIVE_MANAGER_PAPER_GROUPS = [
  ManagerPaperGroup.REVENUE,
  ManagerPaperGroup.INVESTMENT_DEVIDENTS,
  ManagerPaperGroup.UTILITY_BILLS,
  ManagerPaperGroup.TAXES,
  ManagerPaperGroup.ACCOUNTABLE_FUNDS,
  ManagerPaperGroup.REPRESENTATIVE_EXPENSES,
  ManagerPaperGroup.SALE_EQUIPMENT,
  ManagerPaperGroup.MANUFACTURE,
  ManagerPaperGroup.OTHER,
  ManagerPaperGroup.SUPPLIES,
  ManagerPaperGroup.P_C,
  ManagerPaperGroup.WAREHOUSE,
  ManagerPaperGroup.CONSTRUCTION,
  ManagerPaperGroup.MAINTENANCE_REPAIR,
  ManagerPaperGroup.TRANSPORTATION_COSTS,
] as const;

const WRITABLE_MANAGER_PAPER_GROUP_SET = new Set<string>(
  WRITABLE_MANAGER_PAPER_GROUPS
);

export function isWritableManagerPaperGroup(value: string): boolean {
  return WRITABLE_MANAGER_PAPER_GROUP_SET.has(value);
}

export function getPaperGroupLabel(
  value: string,
  t: (key: string) => string
): string {
  const nameKey = `finance.paperGroup.${value}`;
  const translated = t(nameKey);
  const name = translated === nameKey ? value : translated;
  if (isWritableManagerPaperGroup(value)) {
    return name;
  }
  const suffixKey = 'finance.paperGroup.archiveSuffix';
  const suffixTranslated = t(suffixKey);
  const suffix = suffixTranslated === suffixKey ? 'архив' : suffixTranslated;
  return `${name} (${suffix})`;
}

export function getWritablePaperGroupOptions(t: (key: string) => string) {
  return WRITABLE_MANAGER_PAPER_GROUPS.map(value => ({
    value,
    name: getPaperGroupLabel(value, t),
  }));
}

export function getAllPaperGroupOptions(t: (key: string) => string) {
  return [
    ...WRITABLE_MANAGER_PAPER_GROUPS,
    ...ARCHIVE_MANAGER_PAPER_GROUPS,
  ].map(value => ({
    value,
    name: getPaperGroupLabel(value, t),
  }));
}

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