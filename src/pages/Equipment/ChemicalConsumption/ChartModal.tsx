import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/tableUnits';
import MiniChart from './MiniChart';

export interface ChartModalProps {
  visible: boolean;
  onClose: () => void;
  category: string;
  dataFact: { period: string; value: number }[];
  dataRecalculated: { period: string; value: number }[];
}

const ChartModal: React.FC<ChartModalProps> = ({
  visible,
  onClose,
  category,
  dataFact,
  dataRecalculated,
}) => {
  const { t } = useTranslation();
  const [tooltipData, setTooltipData] = useState<{
    period: string;
    factValue: number;
    recalcValue: number;
  } | null>(dataFact.length > 0 && dataRecalculated.length > 0 ? {
    period: dataFact[dataFact.length - 1].period,
    factValue: dataFact[dataFact.length - 1].value,
    recalcValue: dataRecalculated[dataRecalculated.length - 1].value
  } : null);

  useEffect(() => {
    if (visible && dataFact.length > 0 && dataRecalculated.length > 0 && !tooltipData) {
      setTooltipData({
        period: dataFact[dataFact.length - 1].period,
        factValue: dataFact[dataFact.length - 1].value,
        recalcValue: dataRecalculated[dataRecalculated.length - 1].value
      });
    }
  }, [visible, dataFact, dataRecalculated]);

  const handlePointHover = (period: string, factValue: number, recalcValue: number) => {
    setTooltipData({
      period,
      factValue,
      recalcValue
    });
  };

  return (
    <Modal
      title={`${t('chemicalConsumption.chartTitle')}: ${category}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
    >
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#fafafa',
        border: '1px solid #e8e8e8',
        borderRadius: '4px'
      }}>
        {tooltipData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
              {t('chemicalConsumption.period')}: {tooltipData.period}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#1890ff',
                  borderRadius: '2px'
                }} />
                <span style={{ fontSize: '13px' }}>{t('chemicalConsumption.fact')}:</span>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: '#1890ff'
                }}>
                  {formatNumber(tooltipData.factValue)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#fa8c16',
                  borderRadius: '2px'
                }} />
                <span style={{ fontSize: '13px' }}>{t('chemicalConsumption.recalculation')}:</span>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: '#fa8c16'
                }}>
                  {formatNumber(tooltipData.recalcValue)}
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
          alignItems: 'center'
        }}
      >
        <MiniChart
          dataFact={dataFact}
          dataRecalculated={dataRecalculated}
          width={600}
          height={250}
          isLarge={true}
          onPointHover={handlePointHover}
        />
      </div>

      <div style={{
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '1px solid #f0f0f0',
        fontSize: '12px',
        color: '#666'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{t('chemicalConsumption.numberOfPeriods')}:</strong> {dataFact.length}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChartModal;