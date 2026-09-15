/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import ru from '@/config/i18n/locales/ru/ru.json';
import {
  ARCHIVE_MANAGER_PAPER_GROUPS,
  ManagerPaperGroup,
  WRITABLE_MANAGER_PAPER_GROUPS,
  getAllPaperGroupOptions,
  getPaperGroupLabel,
  getWritablePaperGroupOptions,
  isWritableManagerPaperGroup,
} from './constants';

function t(key: string): string {
  const parts = key.split('.');
  let current: unknown = ru;
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return key;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : key;
}

describe('WRITABLE_MANAGER_PAPER_GROUPS', () => {
  it('should contain exactly nine groups when listing form options', () => {
    expect(WRITABLE_MANAGER_PAPER_GROUPS).toHaveLength(9);
    expect([...WRITABLE_MANAGER_PAPER_GROUPS]).toEqual([
      ManagerPaperGroup.AMS_REVENUE,
      ManagerPaperGroup.CASH_TO_VRN,
      ManagerPaperGroup.RENT,
      ManagerPaperGroup.BANK_DEPOSIT,
      ManagerPaperGroup.PROFIT_WITHDRAWAL,
      ManagerPaperGroup.WAGES,
      ManagerPaperGroup.ACCOUNTABLE_ISSUE,
      ManagerPaperGroup.OTHER_INCOME,
      ManagerPaperGroup.OTHER_EXPENSE,
    ]);
  });

  it('should not include archived REVENUE when building writable groups', () => {
    expect(WRITABLE_MANAGER_PAPER_GROUPS).not.toContain(ManagerPaperGroup.REVENUE);
    expect(isWritableManagerPaperGroup(ManagerPaperGroup.REVENUE)).toBe(false);
    expect(ARCHIVE_MANAGER_PAPER_GROUPS).toContain(ManagerPaperGroup.REVENUE);
  });
});

describe('getPaperGroupLabel', () => {
  it('should return the Russian writable name when group is AMS_REVENUE', () => {
    expect(getPaperGroupLabel(ManagerPaperGroup.AMS_REVENUE, t)).toBe(
      'Выручка мойки инкассация'
    );
  });

  it('should not equal the enum key when labeling a writable group', () => {
    for (const value of WRITABLE_MANAGER_PAPER_GROUPS) {
      const label = getPaperGroupLabel(value, t);
      expect(label).not.toBe(value);
      expect(label).not.toContain('(архив)');
    }
  });

  it('should mark historical REVENUE as archive when labeling', () => {
    expect(getPaperGroupLabel(ManagerPaperGroup.REVENUE, t)).toBe(
      'Выручка (архив)'
    );
  });

  it('should append archive suffix when group key is unknown', () => {
    expect(getPaperGroupLabel('LEGACY_UNKNOWN', t)).toBe(
      'LEGACY_UNKNOWN (архив)'
    );
  });
});

describe('getWritablePaperGroupOptions', () => {
  it('should omit archive groups when used as form options', () => {
    const options = getWritablePaperGroupOptions(t);
    expect(options).toHaveLength(9);
    expect(options.map(option => option.value)).not.toContain(
      ManagerPaperGroup.REVENUE
    );
    expect(options.map(option => option.name)).not.toContain('Выручка (архив)');
  });
});

describe('getAllPaperGroupOptions', () => {
  it('should list writable groups before archive when building filter options', () => {
    const options = getAllPaperGroupOptions(t);
    const writableCount = WRITABLE_MANAGER_PAPER_GROUPS.length;
    expect(options.slice(0, writableCount).map(option => option.value)).toEqual(
      [...WRITABLE_MANAGER_PAPER_GROUPS]
    );
    expect(
      options.slice(writableCount).map(option => option.value)
    ).toEqual([...ARCHIVE_MANAGER_PAPER_GROUPS]);
  });

  it('should distinguish archive labels in filters when group is historical', () => {
    const revenue = getAllPaperGroupOptions(t).find(
      option => option.value === ManagerPaperGroup.REVENUE
    );
    expect(revenue?.name).toBe('Выручка (архив)');
    expect(revenue?.name).not.toBe(ManagerPaperGroup.REVENUE);
  });

  it('should keep finance.REVENUE as Выручка when paper groups use a separate namespace', () => {
    expect(ru.finance.REVENUE).toBe('Выручка');
    expect(ru.finance.paperGroup.REVENUE).toBe('Выручка');
  });
});
