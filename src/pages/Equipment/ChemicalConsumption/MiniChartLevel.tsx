import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface MiniChartLevelProps {
  data: { date: string; value: number }[];
  width?: number;
  height?: number;
  isLarge?: boolean;
  onPointHover?: (date: string, value: number) => void;
}

const MiniChartLevel: React.FC<MiniChartLevelProps> = ({
  data,
  width = 110,
  height = 32,
  isLarge = false,
  onPointHover,
}) => {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const lineColor = '#52c41a';

  if (!data || data.length < 2) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: isLarge ? '14px' : '10px',
        }}
      >
        {t('chemicalConsumption.noData')}
      </div>
    );
  }

  const values = data.map(d => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const calculatePoints = () => {
    return data
      .map((item, index) => {
        const x = (index / (data.length - 1)) * (width - (isLarge ? 40 : 10)) + (isLarge ? 20 : 5);
        const y = height - (isLarge ? 10 : 5) - ((item.value - min) / range) * (height - (isLarge ? 20 : 10));
        return `${x},${y}`;
      })
      .join(' ');
  };

  const points = calculatePoints();

  const handlePointMouseEnter = (index: number) => {
    setHoveredIndex(index);
    if (onPointHover && data[index]) {
      onPointHover(data[index].date, data[index].value);
    }
  };

  const handlePointMouseLeave = () => {
    setHoveredIndex(null);
  };

  const strokeWidth = isLarge ? 3 : 2;
  const pointRadius = isLarge ? 3 : 1;
  const hoverAreaRadius = isLarge ? 8 : 4;
  const hoverPointRadius = isLarge ? 5 : 3;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        cursor: 'pointer',
      }}
      onMouseLeave={handlePointMouseLeave}
    >
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <rect
          x={isLarge ? 17 : 2}
          y={isLarge ? 17 : 2}
          width={width - (isLarge ? 34 : 4)}
          height={height - (isLarge ? 34 : 4)}
          fill="#fafafa"
          stroke="#f0f0f0"
          strokeWidth="0.5"
          rx="3"
        />

        <line
          x1={isLarge ? 20 : 5}
          y1={height - (isLarge ? 10 : 5)}
          x2={width - (isLarge ? 20 : 5)}
          y2={height - (isLarge ? 10 : 5)}
          stroke="#d9d9d9"
          strokeWidth="0.5"
        />

        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * (width - (isLarge ? 40 : 10)) + (isLarge ? 20 : 5);
          const y = height - (isLarge ? 10 : 5) - ((item.value - min) / range) * (height - (isLarge ? 20 : 10));
          const isHovered = hoveredIndex === index;
          return (
            <g key={`level-${index}`}>
              <circle
                cx={x}
                cy={y}
                r={hoverAreaRadius}
                fill="transparent"
                onMouseEnter={() => handlePointMouseEnter(index)}
              />
              <circle
                cx={x}
                cy={y}
                r={isHovered ? hoverPointRadius : pointRadius}
                fill={lineColor}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default MiniChartLevel;