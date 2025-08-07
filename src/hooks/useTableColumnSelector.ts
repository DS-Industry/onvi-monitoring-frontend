import { useMemo, useState, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { CheckboxOptionType } from 'antd/es/checkbox';

export function useColumnSelector<T>(
  columns: ColumnsType<T>,
  tableKey: string
) {
  const storageKey = `visibleColumns-${tableKey}`;

  const defaultCheckedList = useMemo(
    () => columns.map(col => col.key as string | number),
    [columns]
  );

  const [checkedList, setCheckedList] = useState<(string | number)[]>(() => {
    if (typeof window === 'undefined') return defaultCheckedList;

    try {
      const saved = localStorage.getItem(storageKey);
      return saved
        ? (JSON.parse(saved) as (string | number)[])
        : defaultCheckedList;
    } catch (error) {
      console.warn('Failed to read from localStorage', error);
      return defaultCheckedList;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checkedList));
    } catch (error) {
      console.warn('Failed to save to localStorage', error);
    }
  }, [checkedList, storageKey]);

  const options: CheckboxOptionType[] = useMemo(
    () =>
      columns.map(({ key, title }) => ({
        label: typeof title === 'string' ? title : String(title),
        value: key as string | number,
      })),
    [columns]
  );

  const visibleColumns = useMemo(
    () =>
      columns.filter(col => checkedList.includes(col.key as string | number)),
    [columns, checkedList]
  );

  return {
    checkedList,
    setCheckedList,
    options,
    visibleColumns,
  };
}
