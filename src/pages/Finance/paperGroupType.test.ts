/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { ManagerPaperTypeClass } from '@/services/api/finance';
import { ManagerPaperGroup } from '@/utils/constants';
import {
  applyGroupChange,
  isPaperTypeSelected,
  mapPaperTypeOptions,
  shouldFetchPaperTypesByGroup,
} from './paperGroupType';

describe('applyGroupChange', () => {
  it('should reset paperTypeId when group changes', () => {
    const next = applyGroupChange(
      {
        group: ManagerPaperGroup.WAGES,
        paperTypeId: 12,
        posId: 3,
      },
      ManagerPaperGroup.RENT
    );

    expect(next.group).toBe(ManagerPaperGroup.RENT);
    expect(next.paperTypeId).toBe(0);
    expect(next.posId).toBe(3);
  });
});

describe('shouldFetchPaperTypesByGroup', () => {
  it('should not fetch types when group is missing', () => {
    expect(shouldFetchPaperTypesByGroup(undefined)).toBe(false);
  });

  it('should fetch types when group is selected', () => {
    expect(shouldFetchPaperTypesByGroup(ManagerPaperGroup.WAGES)).toBe(true);
  });
});

describe('isPaperTypeSelected', () => {
  it('should return false when paperTypeId is empty', () => {
    expect(isPaperTypeSelected(0)).toBe(false);
    expect(isPaperTypeSelected(undefined)).toBe(false);
  });

  it('should return true when paperTypeId is set', () => {
    expect(isPaperTypeSelected(8)).toBe(true);
  });
});

describe('mapPaperTypeOptions', () => {
  it('should map type props to dropdown options', () => {
    const options = mapPaperTypeOptions([
      {
        props: {
          id: 2,
          name: 'Заработная плата',
          type: ManagerPaperTypeClass.EXPENDITURE,
          group: ManagerPaperGroup.WAGES,
        },
      },
      {
        props: {
          id: 1,
          name: 'Аванс',
          type: ManagerPaperTypeClass.EXPENDITURE,
          group: ManagerPaperGroup.WAGES,
        },
      },
    ]);

    expect(options).toEqual([
      { name: 'Аванс', value: 1, type: 'EXPENDITURE' },
      { name: 'Заработная плата', value: 2, type: 'EXPENDITURE' },
    ]);
  });
});
