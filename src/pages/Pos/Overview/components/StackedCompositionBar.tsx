import React, { useMemo } from 'react';
import { formatNumber } from '@/utils/tableUnits';

export type CompositionSegment = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type StackedCompositionBarProps = {
  title?: string;
  segments: CompositionSegment[];
  currencySymbol?: string;
  emptyText?: string;
};

const StackedCompositionBar: React.FC<StackedCompositionBarProps> = ({
  title,
  segments,
  currencySymbol = '₽',
  emptyText = '—',
}) => {
  const total = useMemo(
    () => segments.reduce((sum, s) => sum + (s.value || 0), 0),
    [segments]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      {title ? (
        <div className="text-base font-semibold text-text01 mb-4">{title}</div>
      ) : null}

      {total <= 0 ? (
        <div className="text-text02 py-4">{emptyText}</div>
      ) : (
        <>
          <div className="flex h-8 w-full overflow-hidden rounded-full bg-gray-100">
            {segments.map(segment => {
              const width = ((segment.value || 0) / total) * 100;
              if (width <= 0) return null;
              return (
                <div
                  key={segment.key}
                  style={{
                    width: `${width}%`,
                    backgroundColor: segment.color,
                  }}
                  title={`${segment.label}: ${formatNumber(segment.value)} ${currencySymbol}`}
                />
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {segments.map(segment => (
              <div key={segment.key} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-text02">
                  {segment.label}
                  <span className="mx-1.5 text-borderFill">|</span>
                  <span className="font-medium text-text01">
                    {formatNumber(segment.value)} {currencySymbol}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StackedCompositionBar;
