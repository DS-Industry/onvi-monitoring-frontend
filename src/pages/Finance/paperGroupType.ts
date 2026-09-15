import type { ManagerPaperTypeResponse } from '@/services/api/finance';
import { ManagerPaperGroup } from '@/utils/constants';

export type PaperTypeOption = {
  name: string;
  value: number;
  type?: string;
};

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
    })) || []
  ).sort((a, b) => a.name.localeCompare(b.name));
}
