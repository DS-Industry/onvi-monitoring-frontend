import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BoxPlotOutlined,
  CheckOutlined,
  GiftOutlined,
  PercentageOutlined,
  PlusOutlined,
  RightOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Modal, Select, Button, Input } from 'antd';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useSearchParams } from 'react-router-dom';

const Terms: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conditionType, setConditionType] = useState<string | undefined>();
  const [conditionValue, setConditionValue] = useState<string | undefined>();
  const [percentage, setPercentage] = useState<number>(0);
  const [card, setCard] = useState<'percent' | 'graph' | 'diamond'>('percent');

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleApply = () => {
    console.log('Applied condition:', { conditionType, conditionValue });
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col space-y-6 sm:space-y-8 lg:space-y-10 bg-background02 p-6 rounded-lg">
      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            {t('common.cancel')}
          </Button>,
          <Button
            key="apply"
            type="primary"
            onClick={handleApply}
            disabled={!conditionType || !conditionValue}
          >
            {t('marketing.apply')}
          </Button>,
        ]}
        centered
        className="rounded-2xl"
      >
        <div className="flex flex-col space-y-6 mb-40">
          <div>
            <div className="text-base font-semibold mb-2">
              {t('marketingCampaigns.conditionType')}
            </div>
            <Select
              className="w-60"
              placeholder={t('marketingCampaigns.day')}
              value={conditionType}
              onChange={setConditionType}
              options={[]}
            />
          </div>
          <div>
            <div className="text-base font-semibold mb-2">
              {t('marketing.value')}
            </div>
            <Select
              className="w-60"
              placeholder={t('marketingCampaigns.day')}
              value={conditionValue}
              onChange={setConditionValue}
              options={[]}
            />
          </div>
        </div>
      </Modal>
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

      <div className="flex items-center space-x-4">
        <div className="text-lg font-semibold">
          {t('marketingCampaigns.if')}
        </div>
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
