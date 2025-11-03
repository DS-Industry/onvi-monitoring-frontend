import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BoxPlotOutlined,
  CheckOutlined,
  CloseOutlined,
  GiftOutlined,
  PercentageOutlined,
  PlusOutlined,
  RightOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Button, Input } from 'antd';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useSearchParams } from 'react-router-dom';
import ConditionModal from './ConditionModal';

const Terms: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [card, setCard] = useState<'percent' | 'graph' | 'diamond'>('percent');
  const [currentCondition, setCurrentCondition] = useState<{
    type?: string;
    value?: any;
  }>({});
  const [conditions, setConditions] = useState<
    { type?: string; value?: any }[]
  >([]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleApply = () => {
    if (currentCondition.type && currentCondition.value) {
      setConditions(prev => [...prev, currentCondition]);
    }
    setCurrentCondition({});
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col space-y-6 sm:space-y-8 lg:space-y-10 bg-background02 p-6 rounded-lg">
     <ConditionModal
        open={isModalOpen}
        onCancel={handleCloseModal}
        onApply={handleApply}
        currentCondition={currentCondition}
        setCurrentCondition={setCurrentCondition}
      />
      <div className="flex items-center justify-center">
        <div className="flex flex-col rounded-lg w-full space-y-6 sm:space-y-8 lg:space-y-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary02 flex items-center justify-center rounded-full text-white">
              <CheckOutlined style={{ fontSize: 24 }} />
            </div>
            <div>
              <div className="font-bold text-text01 text-2xl">
                {t('marketingCampaigns.term')}
              </div>
              <div className="text-base03 text-md">
                {t('marketingCampaigns.settingUp')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className='text-lg font-semibold'>{t('marketingCampaigns.if')}</div>
        {conditions.map((cond, index) => {
          let valueDisplay = '';
          if (
            cond.type === 'timePeriod' &&
            cond.value?.start &&
            cond.value?.end
          ) {
            valueDisplay = `${cond.value.start} - ${cond.value.end}`;
          } else if (Array.isArray(cond.value)) {
            valueDisplay = cond.value
              .map(v => t(`marketingCampaigns.${v}`) || v)
              .join(', ');
          } else {
            valueDisplay = cond.value;
          }

          return (
            <React.Fragment key={index}>
              <div className="relative flex items-center justify-center w-52 h-24 border-[0.5px] border-primary02 rounded-lg bg-white shadow-sm">
                <Button
                  size="small"
                  type="text"
                  icon={<CloseOutlined />}
                  className="!absolute top-1 right-1 text-text02 hover:text-primary02"
                  onClick={() =>
                    setConditions(conditions.filter((_, i) => i !== index))
                  }
                />

                <div className="flex flex-col items-center justify-center text-center px-2">
                  <div className="text-sm font-semibold text-text01">
                    {t(`marketingCampaigns.${cond.type}`)}
                  </div>
                  <div className="text-sm text-text02">{valueDisplay}</div>
                </div>
              </div>

              {index < conditions.length - 1 && (
                <div className="text-primary02 font-semibold border-primary02 border-b-[0.5px]">
                  {index % 2 === 0 ? t('common.and') : t('common.or')}
                </div>
              )}
            </React.Fragment>
          );
        })}

        <div
          className="w-10 h-10 flex items-center justify-center rounded-full bg-background05 cursor-pointer hover:bg-background04 transition"
          onClick={handleOpenModal}
        >
          <PlusOutlined style={{ fontSize: 18 }} />
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex flex-col rounded-lg w-full space-y-6 sm:space-y-8 lg:space-y-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary02 flex items-center justify-center rounded-full text-white">
              <GiftOutlined style={{ fontSize: 24 }} />
            </div>
            <div>
              <div className="font-bold text-text01 text-2xl">
                {t('marketingCampaigns.reward')}
              </div>
              <div className="text-base03 text-md">
                {t('marketingCampaigns.sett')}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-text01">{t('marketingCampaigns.discount')}</div>
        <Input
          type="number"
          className="w-28"
          value={percentage}
          suffix={<div>%</div>}
          onChange={e => setPercentage(Number(e.target.value))}
        />
      </div>

      <div className="flex flex-wrap gap-4 mt-5">
        <div
          onClick={() => {
            setCard('percent');
          }}
          className={`w-full sm:w-64 h-24 flex flex-col justify-center text-center cursor-pointer border-[0.5px] ${
            card === 'percent' ? 'bg-white border-primary02' : 'bg-opacity02'
          } rounded-2xl transition-all duration-200 hover:shadow-md`}
        >
          <div
            className={`flex justify-center text-center items-center ${
              card === 'percent' ? 'text-primary02' : 'text-text01'
            }`}
          >
            <PercentageOutlined className="font-semibold text-primary02" />
            <div className="ml-2 font-semibold text-base">
              {t('marketing.discount')}
            </div>
          </div>
          <div className={`px-4 text-sm ${'text-text02'} font-normal`}>
            {t('marketingCampaigns.give')}
          </div>
        </div>
        <div
          onClick={() => {
            setCard('graph');
          }}
          className={`w-full sm:w-64 h-24 flex flex-col justify-center text-center cursor-pointer border-[0.5px] ${
            card === 'graph' ? 'bg-white border-primary02' : 'bg-opacity02'
          } rounded-2xl transition-all duration-200 hover:shadow-md`}
        >
          <div
            className={`flex justify-center text-center items-center ${
              card === 'graph' ? 'text-primary02' : 'text-text01'
            }`}
          >
            <RiseOutlined className="font-semibold text-primary02" />
            <div className="ml-2 font-semibold text-base">
              {t('marketingCampaigns.increased')}
            </div>
          </div>
          <div className={`px-4 text-sm ${'text-text02'} font-normal`}>
            {t('marketingCampaigns.increase')}
          </div>
        </div>
        <div
          onClick={() => {
            setCard('diamond');
          }}
          className={`w-full sm:w-64 h-24 flex flex-col justify-center text-center cursor-pointer border-[0.5px] ${
            card === 'diamond' ? 'bg-white border-primary02' : 'bg-opacity02'
          } rounded-2xl transition-all duration-200 hover:shadow-md`}
        >
          <div
            className={`flex justify-center text-center items-center ${
              card === 'diamond' ? 'text-primary02' : 'text-text01'
            }`}
          >
            <BoxPlotOutlined className="font-semibold text-primary02" />
            <div className="ml-2 font-semibold text-base">
              {t('marketingCampaigns.accrual')}
            </div>
          </div>
          <div className={`px-4 text-sm ${'text-text02'} font-normal`}>
            {t('marketingCampaigns.award')}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-3">
        <Button
          type="primary"
          icon={<RightOutlined />}
          iconPosition="end"
          onClick={() => {
            updateSearchParams(searchParams, setSearchParams, {
              step: 3,
            });
          }}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};

export default Terms;
