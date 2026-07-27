import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GoalStatus } from '../utils/goalStatus';

type StatusBadgeProps = {
  status: GoalStatus;
  color: string;
  bgColor: string;
  className?: string;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  color,
  bgColor,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${className}`}
      style={{ color, backgroundColor: bgColor }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      {t(`posOverview.status.${status}`)}
    </span>
  );
};

export default StatusBadge;
