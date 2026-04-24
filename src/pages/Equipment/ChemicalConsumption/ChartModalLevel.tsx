import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/tableUnits';
import MiniChartLevel from './MiniChartLevel';

export interface ChartModalLevelProps {
  visible: boolean;
  onClose: () => void;
  category: string;
  data: { date: string; value: number }[];
  dataAdd: { date: string; value: number }[];
}

const ChartModalLevel: React.FC<ChartModalLevelProps> = ({
  visible,
  onClose,
  category,
  data,
  dataAdd,
}) => {
  const { t } = useTranslation();
  const [tooltipData, setTooltipData] = useState<{ date: string; levelValue: number; addValue: number | null } | null>(
    data.length > 0
      ? {
          date: data[data.length - 1].date,
          levelValue: data[data.length - 1].value,
          addValue: dataAdd[dataAdd.length - 1]?.value ?? null,
        }
      : null
  );

  useEffect(() => {
    if (visible && data.length > 0 && !tooltipData) {
      setTooltipData({
        date: data[data.length - 1].date,
        levelValue: data[data.length - 1].value,
        addValue: dataAdd[dataAdd.length - 1]?.value ?? null,
      });
    }
  }, [visible, data, dataAdd]);

  const handlePointHover = (date: string, levelValue: number, addValue: number | null) => {
    setTooltipData({ date, levelValue, addValue });
  };

  return (
    <Modal
      title={`${t('chemicalConsumption.chartLevelTitle')}: ${category}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
    >
      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#fafafa',
          border: '1px solid #e8e8e8',
          borderRadius: '4px',
        }}
      >
        {tooltipData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
              {t('chemicalConsumption.period')}: {tooltipData.date}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#52c41a',
                    borderRadius: '2px',
                  }}
                />
                <span style={{ fontSize: '13px' }}>{t('chemicalConsumption.level')}:</span>
                <span
                  style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#52c41a',
                  }}
                >
                  {formatNumber(tooltipData.levelValue)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px' }}>{t('chemicalConsumption.filling')}:</span>
                <span
                  style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#000',
                  }}
                >
                  {tooltipData.addValue !== null ? formatNumber(tooltipData.addValue) : '—'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#999' }}>
            {t('chemicalConsumption.noDataToDisplay')}
          </div>
        )}
      </div>

      <div
        style={{
          position: 'relative',
          height: '300px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MiniChartLevel
          data={data}
          dataAdd={dataAdd}
          width={600}
          height={250}
          isLarge={true}
          onPointHover={handlePointHover}
        />
      </div>

      <div
        style={{
          marginTop: '20px',
          paddingTop: '15px',
          borderTop: '1px solid #f0f0f0',
          fontSize: '12px',
          color: '#666',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{t('chemicalConsumption.numberOfPeriods')}:</strong> {data.length}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChartModalLevel;