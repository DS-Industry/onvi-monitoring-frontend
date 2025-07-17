import { useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import type { CheckboxOptionType } from "antd/es/checkbox";

export function useColumnSelector<T>(columns: ColumnsType<T>) {
  const defaultCheckedList = useMemo(
    () => columns.map((col) => col.key as string | number),
    [columns]
  );

  const [checkedList, setCheckedList] =
    useState<(string | number)[]>(defaultCheckedList);

  const options: CheckboxOptionType[] = useMemo(
    () =>
      columns.map(({ key, title }) => ({
        label: typeof title === "string" ? title : String(title),
        value: key as string | number,
      })),
    [columns]
  );

  const visibleColumns = useMemo(
    () =>
      columns.filter((col) => checkedList.includes(col.key as string | number)),
    [columns, checkedList]
  );

  return {
    checkedList,
    setCheckedList,
    options,
    visibleColumns,
  };
}
