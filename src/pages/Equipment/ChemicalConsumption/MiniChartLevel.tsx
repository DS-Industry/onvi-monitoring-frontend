import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

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
  const axisColor = '#999';
  const labelColor = '#666';

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

  const paddingLeft = isLarge ? 40 : 5;
  const paddingRight = isLarge ? 20 : 5;
  const paddingTop = isLarge ? 20 : 5;
  const paddingBottom = isLarge ? 25 : 5;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const calculatePoints = () => {
    return data
      .map((item, index) => {
        const x = paddingLeft + (index / (data.length - 1)) * innerWidth;
        const y = paddingTop + innerHeight - ((item.value - min) / range) * innerHeight;
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

  const strokeWidth = isLarge ? 2 : 1.5;
  const pointRadius = isLarge ? 4 : 2;
  const hoverAreaRadius = isLarge ? 10 : 6;
  const hoverPointRadius = isLarge ? 6 : 4;

  const firstDate = data[0]?.date ? dayjs(data[0].date, 'DD.MM.YYYY HH:mm').format('DD.MM') : '';
  const lastDate = data[data.length - 1]?.date ? dayjs(data[data.length - 1].date, 'DD.MM.YYYY HH:mm').format('DD.MM') : '';

  const yTickValues = [min, max];
  const yTickFormatted = yTickValues.map(v => Math.round(v * 10) / 10);

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
        {isLarge && (
          <>
            <line
              x1={paddingLeft}
              y1={height - paddingBottom}
              x2={width - paddingRight}
              y2={height - paddingBottom}
              stroke={axisColor}
              strokeWidth="1"
            />
            <line
              x1={paddingLeft}
              y1={height - paddingBottom - 4}
              x2={paddingLeft}
              y2={height - paddingBottom + 4}
              stroke={axisColor}
              strokeWidth="1"
            />
            <line
              x1={width - paddingRight}
              y1={height - paddingBottom - 4}
              x2={width - paddingRight}
              y2={height - paddingBottom + 4}
              stroke={axisColor}
              strokeWidth="1"
            />
            <text
              x={paddingLeft}
              y={height - paddingBottom + 14}
              fontSize="10"
              fill={labelColor}
              textAnchor="middle"
            >
              {firstDate}
            </text>
            <text
              x={width - paddingRight}
              y={height - paddingBottom + 14}
              fontSize="10"
              fill={labelColor}
              textAnchor="middle"
            >
              {lastDate}
            </text>

            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={paddingLeft}
              y2={height - paddingBottom}
              stroke={axisColor}
              strokeWidth="1"
            />
            {yTickValues.map((value, idx) => {
              const y = paddingTop + innerHeight - ((value - min) / range) * innerHeight;
              return (
                <g key={`y-tick-${idx}`}>
                  <line
                    x1={paddingLeft - 4}
                    y1={y}
                    x2={paddingLeft + 4}
                    y2={y}
                    stroke={axisColor}
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    fontSize="10"
                    fill={labelColor}
                    textAnchor="end"
                  >
                    {yTickFormatted[idx]}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {isLarge && (
          <rect
            x={paddingLeft}
            y={paddingTop}
            width={innerWidth}
            height={innerHeight}
            fill="#fafafa"
            stroke="#f0f0f0"
            strokeWidth="0.5"
            rx="3"
          />
        )}

        {!isLarge && (
          <rect
            x={paddingLeft - 2}
            y={paddingTop - 2}
            width={innerWidth + 4}
            height={innerHeight + 4}
            fill="#fafafa"
            stroke="#f0f0f0"
            strokeWidth="0.5"
            rx="3"
          />
        )}

        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((item, index) => {
          const x = paddingLeft + (index / (data.length - 1)) * innerWidth;
          const y = paddingTop + innerHeight - ((item.value - min) / range) * innerHeight;
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