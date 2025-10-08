import { Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { TFunction } from 'i18next';

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
    if (val === null || val === undefined || isNaN(val)) return '—';
    return `${formatNumber(val)} ₽`;
  };
}

/**
 * Render function for dates in "YYYY-MM-DD HH:mm" format.
 */
export function getDateRender() {
  return (val: Date | string | null | undefined): string => {
    if (!val || !dayjs(val).isValid()) return '—';
    return dayjs(val).format('YYYY-MM-DD HH:mm');
  };
}

/**
 * Formats a number with grouping and optional precision.
 */
export function formatNumber(
  num: number | null | undefined,
  type: 'number' | 'double' = 'number'
): string {
  if (num === null || num === undefined || isNaN(num)) return '—';

  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: type === 'double' ? 2 : 0,
    maximumFractionDigits: type === 'double' ? 2 : 0,
    useGrouping: true,
  }).format(num);
}

/**
 * Formats a number as a percentage.
 */
export function getPercentRender() {
  return (val: number | null | undefined): string => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    return `${formatNumber(val, 'double')} %`;
  };
}

const TAG_COLOR_PALETTE = [
  { bg: '#e6f3ff', border: '#1890ff', text: '#1890ff' }, // Blue
  { bg: '#f6ffed', border: '#52c41a', text: '#52c41a' }, // Green
  { bg: '#fff7e6', border: '#fa8c16', text: '#fa8c16' }, // Orange
  { bg: '#fff2f0', border: '#f5222d', text: '#f5222d' }, // Red
  { bg: '#f9f0ff', border: '#722ed1', text: '#722ed1' }, // Purple
  { bg: '#e6fffb', border: '#13c2c2', text: '#13c2c2' }, // Cyan
  { bg: '#fff0f6', border: '#eb2f96', text: '#eb2f96' }, // Magenta
  { bg: '#fcffe6', border: '#a0d911', text: '#a0d911' }, // Lime
  { bg: '#fffbe6', border: '#faad14', text: '#faad14' }, // Gold
  { bg: '#fff2e8', border: '#fa541c', text: '#fa541c' }, // Volcano
  { bg: '#f0f5ff', border: '#2f54eb', text: '#2f54eb' }, // Geekblue
  { bg: '#fff0f6', border: '#eb2f96', text: '#eb2f96' }, // Pink
  { bg: '#feffe6', border: '#fadb14', text: '#fadb14' }, // Yellow
  { bg: '#f0f5ff', border: '#531dab', text: '#531dab' }, // Indigo
  { bg: '#e6fffb', border: '#08979c', text: '#08979c' }, // Teal
  { bg: '#fff7e6', border: '#ad6800', text: '#ad6800' }, // Brown
];

function getTagColorScheme(tagName: string, existingColor?: string): { bg: string; border: string; text: string } {
  if (existingColor) {
    const colorMap: { [key: string]: { bg: string; border: string; text: string } } = {
      'blue': TAG_COLOR_PALETTE[0],
      'green': TAG_COLOR_PALETTE[1],
      'orange': TAG_COLOR_PALETTE[2],
      'red': TAG_COLOR_PALETTE[3],
      'purple': TAG_COLOR_PALETTE[4],
      'cyan': TAG_COLOR_PALETTE[5],
      'magenta': TAG_COLOR_PALETTE[6],
      'lime': TAG_COLOR_PALETTE[7],
      'gold': TAG_COLOR_PALETTE[8],
      'volcano': TAG_COLOR_PALETTE[9],
      'geekblue': TAG_COLOR_PALETTE[10],
      'pink': TAG_COLOR_PALETTE[11],
      'yellow': TAG_COLOR_PALETTE[12],
      'indigo': TAG_COLOR_PALETTE[13],
      'teal': TAG_COLOR_PALETTE[14],
      'brown': TAG_COLOR_PALETTE[15],
    };
    return colorMap[existingColor] || TAG_COLOR_PALETTE[0];
  }
  
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    const char = tagName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  
  const colorIndex = Math.abs(hash) % TAG_COLOR_PALETTE.length;
  return TAG_COLOR_PALETTE[colorIndex];
}

export function getTagRender(tags?: TagItem[]): React.ReactNode {
  if (!tags || tags.length === 0) return '—';

  return (
    <div className="flex flex-wrap gap-2 max-w-64">
      {tags.map(tag => {
        const colorScheme = getTagColorScheme(tag.name, tag.color);
        return (
          <span
            key={tag.id}
            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border"
            style={{
              backgroundColor: colorScheme.bg,
              borderColor: colorScheme.border,
              color: colorScheme.text,
            }}
          >
            {tag.name}
          </span>
        );
      })}
    </div>
  );
}

export function getStatusTagRender(t: TFunction) {
  return (status: string): React.ReactNode => {
    const greenStatuses = [
      t('tables.ACTIVE'),
      t('tables.SENT'),
      t('tables.In Progress'),
      t('analysis.PROGRESS'),
      t('finance.RECEIPT'),
    ];

    const redStatuses = [
      t('tables.INACTIVE'),
      t('tables.OVERDUE'),
      t('tables.Done'),
      t('tables.FINISHED'),
      t('tables.PAUSE'),
      t('analysis.DONE'),
      t('finance.EXPENDITURE'),
      t('tables.BLOCKED'),
      t('tables.DRAFT'),
      t('tables.DELETED'),
    ];

    const orangeStatuses = [
      t('tables.SAVE'),
      t('tables.SAVED'),
      t('tables.VERIFICATE'),
      t('tables.RETURNED'),
      t('tables.COMPLETED'),
      t('tables.PENDING'),
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
    if (!periodString) return '';

    const [startStr, endStr] = periodString.split('-').map(s => s.trim());

    const parseDate = (dateString: string) => {
      const cleanedDate = dateString.split('GMT')[0].trim();
      const parsed = dayjs(cleanedDate);

      if (!parsed.isValid()) return '';
      return parsed.format('DD.MM.YYYY');
    };

    return `${parseDate(startStr)} - ${parseDate(endStr)}`;
  };
}

export function getNumberRender() {
  return (val: number | null | undefined): React.ReactNode => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    return (
      <div className={`${val < 0 ? 'text-errorFill' : 'text-text01'}`}>
        {formatNumber(val)}
      </div>
    );
  };
}

export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const formatRussianPhone = (input: string) => {
  let digits = input.replace(/\D/g, '');

  if (digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  }
  if (!digits.startsWith('7')) digits = '7' + digits;
  digits = digits.slice(0, 11);

  const masked = `+7${digits.length > 1 ? ' (' : ''}${digits.slice(
    1,
    4
  )}${digits.length > 4 ? ') ' : ''}${digits.slice(4, 7)}${
    digits.length > 7 ? '-' : ''
  }${digits.slice(7, 9)}${digits.length > 9 ? '-' : ''}${digits.slice(9, 11)}`;
  return masked.trim();
};
