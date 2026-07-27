import React, { useMemo } from 'react';
import { formatNumber } from '@/utils/tableUnits';

export type HorizontalBarItem = {
  key: string;
  label: string;
  value: number;
  displayValue?: string;
  barColor?: string;
  /** When set, bar width is value/maxScale*100 instead of relative to max item */
  maxScale?: number;
};

type HorizontalBarListProps = {
  title?: string;
  items: HorizontalBarItem[];
  barColor?: string;
  emptyText?: string;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
  /** Show colored bullet before label */
  showBullet?: boolean;
  className?: string;
};

const HorizontalBarList: React.FC<HorizontalBarListProps> = ({
  title,
  items,
  barColor = '#0B68E1',
  emptyText = '—',
  footer,
  headerRight,
  showBullet = false,
  className = '',
}) => {
  const maxValue = useMemo(
    () => Math.max(...items.map(item => item.value || 0), 0),
    [items]
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 ${className}`}>
      {(title || headerRight) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <div className="text-base font-semibold text-text01">{title}</div>
          ) : (
            <div />
          )}
          {headerRight}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-text02 py-4">{emptyText}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map(item => {
            const scale = item.maxScale ?? maxValue;
            const width =
              scale > 0
                ? Math.max(((item.value || 0) / scale) * 100, item.value > 0 ? 2 : 0)
                : 0;
            const color = item.barColor ?? barColor;
            return (
              <div key={item.key}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 min-w-0 text-text01 truncate">
                    {showBullet ? (
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ) : null}
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="shrink-0 font-medium text-text01">
                    {item.displayValue ?? formatNumber(item.value)}
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${width}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {footer ? (
        <div className="mt-5 pt-3 border-t border-gray-100">{footer}</div>
      ) : null}
    </div>
  );
};

export default HorizontalBarList;
