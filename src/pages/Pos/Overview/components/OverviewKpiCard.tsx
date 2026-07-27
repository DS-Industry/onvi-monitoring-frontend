import React from 'react';
import { Skeleton } from 'antd';

type Trend = 'up' | 'down' | 'neutral';

type OverviewKpiCardProps = {
  label: string;
  value: React.ReactNode;
  loading?: boolean;
  className?: string;
  delta?: React.ReactNode;
  trend?: Trend;
};

const trendColor: Record<Trend, string> = {
  up: 'text-successFill',
  down: 'text-errorFill',
  neutral: 'text-text02',
};

const OverviewKpiCard: React.FC<OverviewKpiCardProps> = ({
  label,
  value,
  loading = false,
  className = '',
  delta,
  trend = 'neutral',
}) => {
  return (
    <div
      className={`rounded-xl bg-background05 px-5 py-4 shadow-sm ${className}`}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-text02 mb-2">
        {label}
      </div>
      {loading ? (
        <Skeleton.Input active size="large" style={{ width: 120 }} />
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          <div className="text-2xl sm:text-3xl font-semibold text-text01 leading-tight">
            {value}
          </div>
          {delta != null && delta !== '' ? (
            <div
              className={`mb-0.5 text-sm font-medium ${trendColor[trend]}`}
            >
              {delta}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default OverviewKpiCard;
