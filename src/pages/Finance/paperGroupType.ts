import type { ManagerPaperTypeResponse } from '@/services/api/finance';
import { ManagerPaperGroup } from '@/utils/constants';

export const SYSTEM_PAPER_TYPE_CASH_COLLECTION = 'Инкассация';
export const SYSTEM_PAPER_TYPE_SALE = 'Продажа';

export type PaperTypeOption = {
  name: string;
  value: number;
  type?: string;
  group?: ManagerPaperGroup | null;
};

export function isSystemPaperType(name: string, type?: string): boolean {
  return (
    name === SYSTEM_PAPER_TYPE_CASH_COLLECTION ||
    (name === SYSTEM_PAPER_TYPE_SALE && type === 'RECEIPT')
  );
}

export function resolvePaperGroup(paperType: {
  name: string;
  type?: string;
  group?: ManagerPaperGroup | null;
}): ManagerPaperGroup | undefined {
  if (isSystemPaperType(paperType.name, paperType.type)) {
    return ManagerPaperGroup.AMS_REVENUE;
  }
  if (paperType.group) {
    return paperType.group;
  }
  if (paperType.type === 'EXPENDITURE') {
    return ManagerPaperGroup.OTHER_EXPENSE;
  }
  if (paperType.type === 'RECEIPT') {
    return ManagerPaperGroup.OTHER_INCOME;
  }
  return undefined;
}

export function isRestrictedPaperTypeId(
  paperTypeId: number,
  options: PaperTypeOption[]
): boolean {
  const option = options.find(item => item.value === paperTypeId);
  if (!option?.type) {
    return false;
  }
  return isSystemPaperType(option.name, option.type);
}

export function applyGroupChange<
  T extends { paperTypeId: number; group?: ManagerPaperGroup },
>(prev: T, nextGroup: ManagerPaperGroup | undefined): T {
  return {
    ...prev,
    group: nextGroup,
    paperTypeId: 0,
  };
}

export function shouldFetchPaperTypesByGroup(
  group?: ManagerPaperGroup
): group is ManagerPaperGroup {
  return group != null;
}

export function isPaperTypeSelected(paperTypeId?: number): boolean {
  return typeof paperTypeId === 'number' && paperTypeId > 0;
}

export function mapPaperTypeOptions(
  data: ManagerPaperTypeResponse[] | undefined
): PaperTypeOption[] {
  return (
    data?.map(item => ({
      name: item.props.name,
      value: item.props.id,
      type: item.props.type,
      group: item.props.group ?? null,
    })) || []
  ).sort((a, b) => a.name.localeCompare(b.name));
}
