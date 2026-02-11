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

  const calculatePoints = (data: { period: string; value: number }[]) => {
    return data
      .map((item, index) => {
        const x = (index / (data.length - 1)) * (width - (isLarge ? 40 : 10)) + (isLarge ? 20 : 5);
        const y = height - (isLarge ? 10 : 5) - ((item.value - min) / range) * (height - (isLarge ? 20 : 10));
        return `${x},${y}`;
      })
      .join(' ');
  };

  const factPoints = calculatePoints(dataFact);
  const recalculatedPoints = calculatePoints(dataRecalculated);

  const handlePointMouseEnter = (index: number) => {
    setHoveredIndex(index);
    if (onPointHover && dataFact[index] && dataRecalculated[index]) {
      onPointHover(dataFact[index].period, dataFact[index].value, dataRecalculated[index].value);
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
        cursor: 'pointer'
      }}
      onMouseLeave={handlePointMouseLeave}
    >
      <svg
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      >
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
          const x = (index / (dataFact.length - 1)) * (width - (isLarge ? 40 : 10)) + (isLarge ? 20 : 5);
          const y = height - (isLarge ? 10 : 5) - ((item.value - min) / range) * (height - (isLarge ? 20 : 10));

          const isHovered = hoveredIndex === index;

          return (
            <g key={`fact-${index}`}>
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
                fill={factColor}
              />
            </g>
          );
        })}

        {dataRecalculated.map((item, index) => {
          const x = (index / (dataRecalculated.length - 1)) * (width - (isLarge ? 40 : 10)) + (isLarge ? 20 : 5);
          const y = height - (isLarge ? 10 : 5) - ((item.value - min) / range) * (height - (isLarge ? 20 : 10));

          const isHovered = hoveredIndex === index;

          return (
            <g key={`recalc-${index}`}>
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
                fill={recalculatedColor}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default MiniChart;