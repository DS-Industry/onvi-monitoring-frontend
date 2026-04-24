import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface MiniChartProps {
  dataFact: { period: string; value: number }[];
  dataRecalculated: { period: string; value: number }[];
  width?: number;
  height?: number;
  isLarge?: boolean;
  onPointHover?: (period: string, factValue: number, recalcValue: number) => void;
}

const MiniChart: React.FC<MiniChartProps> = ({
  dataFact,
  dataRecalculated,
  width = 110,
  height = 32,
  isLarge = false,
  onPointHover,
}) => {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const factColor = '#1890ff';
  const recalculatedColor = '#fa8c16';

  const allValues = [
    ...(dataFact || []).map(item => item.value),
    ...(dataRecalculated || []).map(item => item.value)
  ];

  if (!dataFact || !dataRecalculated || allValues.length < 2) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: isLarge ? '14px' : '10px'
        }}
      >
        {t('chemicalConsumption.noData')}
      </div>
    );
  }

  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const range = max - min || 1;

  const paddingLeft = isLarge ? 20 : 5;
  const paddingRight = isLarge ? 20 : 5;
  const paddingTop = isLarge ? 20 : 5;
  const paddingBottom = isLarge ? 10 : 5;
  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const xCoords = dataFact.map((_, index) => paddingLeft + (index / (dataFact.length - 1)) * innerWidth);

  const zones = xCoords.map((x, i) => {
    let left: number;
    let right: number;
    if (i === 0) {
      left = paddingLeft;
      right = xCoords.length > 1 ? (xCoords[0] + xCoords[1]) / 2 : x;
    } else if (i === xCoords.length - 1) {
      left = xCoords.length > 1 ? (xCoords[i - 1] + xCoords[i]) / 2 : x;
      right = paddingLeft + innerWidth;
    } else {
      left = (xCoords[i - 1] + xCoords[i]) / 2;
      right = (xCoords[i] + xCoords[i + 1]) / 2;
    }
    return { left, right };
  });

  const handleZoneMouseEnter = (index: number) => {
    setHoveredIndex(index);
    if (onPointHover && dataFact[index] && dataRecalculated[index]) {
      onPointHover(dataFact[index].period, dataFact[index].value, dataRecalculated[index].value);
    }
  };

  const handleZoneMouseLeave = () => {
    setHoveredIndex(null);
  };

  const strokeWidth = isLarge ? 3 : 2;
  const pointRadius = isLarge ? 3 : 1;
  const hoverPointRadius = isLarge ? 5 : 3;

  const calculatePoints = (data: { period: string; value: number }[]) => {
    return data
      .map((item, index) => {
        const x = xCoords[index];
        const y = paddingTop + innerHeight - ((item.value - min) / range) * innerHeight;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const factPoints = calculatePoints(dataFact);
  const recalculatedPoints = calculatePoints(dataRecalculated);

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        cursor: 'pointer'
      }}
      onMouseLeave={handleZoneMouseLeave}
    >
      <svg
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      >
        <rect
          x={paddingLeft - (isLarge ? 3 : 2)}
          y={paddingTop - (isLarge ? 3 : 2)}
          width={innerWidth + (isLarge ? 6 : 4)}
          height={innerHeight + (isLarge ? 6 : 4)}
          fill="#fafafa"
          stroke="#f0f0f0"
          strokeWidth="0.5"
          rx="3"
        />

        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="#d9d9d9"
          strokeWidth="0.5"
        />

        <polyline
          points={recalculatedPoints}
          fill="none"
          stroke={recalculatedColor}
          strokeWidth={strokeWidth - 0.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />

        <polyline
          points={factPoints}
          fill="none"
          stroke={factColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {dataFact.map((item, index) => {
          const x = xCoords[index];
          const y = paddingTop + innerHeight - ((item.value - min) / range) * innerHeight;
          const isHovered = hoveredIndex === index;
          return (
            <circle
              key={`fact-${index}`}
              cx={x}
              cy={y}
              r={isHovered ? hoverPointRadius : pointRadius}
              fill={factColor}
            />
          );
        })}

        {dataRecalculated.map((item, index) => {
          const x = xCoords[index];
          const y = paddingTop + innerHeight - ((item.value - min) / range) * innerHeight;
          const isHovered = hoveredIndex === index;
          return (
            <circle
              key={`recalc-${index}`}
              cx={x}
              cy={y}
              r={isHovered ? hoverPointRadius : pointRadius}
              fill={recalculatedColor}
            />
          );
        })}

        {zones.map((zone, idx) => (
          <rect
            key={`zone-${idx}`}
            x={zone.left}
            y={paddingTop}
            width={zone.right - zone.left}
            height={innerHeight}
            fill="transparent"
            onMouseEnter={() => handleZoneMouseEnter(idx)}
            onMouseLeave={handleZoneMouseLeave}
            style={{ pointerEvents: 'all' }}
          />
        ))}
      </svg>
    </div>
  );
};

export default MiniChart;