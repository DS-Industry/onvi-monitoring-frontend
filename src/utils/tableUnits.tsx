import { Tag } from "antd";
import dayjs from "dayjs";
import React from "react";

interface TagItem {
  id: number;
  color?: string;
  name: string;
}

/**
 * Render function for currency values (₽ formatted).
 */
export function getCurrencyRender() {
  return (val: number | null | undefined): string => {
    if (val === null || val === undefined || isNaN(val)) return "—";
    return `${val.toFixed(2)} ₽`;
  };
}

/**
 * Render function for dates in "YYYY-MM-DD HH:mm" format.
 */
export function getDateRender() {
  return (val: Date | string | null | undefined): string => {
    if (!val || !dayjs(val).isValid()) return "—";
    return dayjs(val).format("YYYY-MM-DD HH:mm");
  };
}

/**
 * Formats a number with grouping and optional precision.
 */
export function formatNumber(
  num: number | null | undefined,
  type: "number" | "double" = "number"
): string {
  if (num === null || num === undefined || isNaN(num)) return "—";

  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: type === "double" ? 2 : 0,
    maximumFractionDigits: type === "double" ? 2 : 0,
    useGrouping: true,
  }).format(num);
}

/**
 * Render AntD tags from a list of { id, name, color } objects.
 */
export function getTagRender(tags?: TagItem[]): React.ReactNode {
  if (!tags || tags.length === 0) return "—";

  return (
    <div className="flex flex-wrap gap-2 max-w-64">
      {tags.map((tag) => (
        <Tag key={tag.id} color={tag.color ?? "cyan"}>
          {tag.name}
        </Tag>
      ))}
    </div>
  );
}
