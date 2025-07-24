import { Tag } from "antd";
import dayjs from "dayjs";
import React from "react";
import { TFunction } from "i18next";

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
    return `${formatNumber(val)} ₽`;
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

  return (
    new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: type === "double" ? 2 : 0,
      maximumFractionDigits: type === "double" ? 2 : 0,
      useGrouping: true,
    }).format(num)
  );
}

/**
 * Formats a number as a percentage.
 */
export function getPercentRender() {
  return (val: number | null | undefined): string => {
    if (val === null || val === undefined || isNaN(val)) return "—";
    return `${formatNumber(val, "double")} %`;
  };
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

export function getStatusTagRender(t: TFunction) {
  return (status: string): React.ReactNode => {
    const greenStatuses = [
      t("tables.ACTIVE"),
      t("tables.SENT"),
      t("tables.In Progress"),
      t("analysis.PROGRESS"),
      t("finance.RECEIPT"),
    ];

    const redStatuses = [
      t("tables.OVERDUE"),
      t("tables.Done"),
      t("tables.FINISHED"),
      t("tables.PAUSE"),
      t("analysis.DONE"),
      t("finance.EXPENDITURE"),
    ];

    const orangeStatuses = [
      t("tables.SAVED"),
      t("tables.VERIFICATE"),
    ];

    if (greenStatuses.includes(status)) {
      return <Tag color="green">{status}</Tag>;
    }

    if (redStatuses.includes(status)) {
      return <Tag color="red">{status}</Tag>;
    }

    if (orangeStatuses.includes(status)) {
      return <Tag color="orange">{status}</Tag>;
    }

    return <Tag color="default">{status}</Tag>;
  };
}

export function getFormatPeriodType() {
  return (periodString: string | null): string => {
    if (!periodString) return "";

    const [startStr, endStr] = periodString.split("-").map(s => s.trim());

    const parseDate = (dateString: string) => {
      const cleanedDate = dateString.split("GMT")[0].trim();
      const parsed = dayjs(cleanedDate);

      if (!parsed.isValid()) return "";
      return parsed.format("DD.MM.YYYY");
    };

    return `${parseDate(startStr)} - ${parseDate(endStr)}`;
  };
}

export function getNumberRender() {
  return (val: number | null | undefined): React.ReactNode => {
    if (val === null || val === undefined || isNaN(val)) return "—";
    return <div className={`${val < 0 ? "text-errorFill" : "text-text01"}`}>
      {formatNumber(val)}
    </div>;
  };
}
