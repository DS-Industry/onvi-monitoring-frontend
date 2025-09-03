import ExpandedCard from '@/components/ui/Card/ExpandedCard';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BasicBouns from '@icons/BasicBonus.svg?react';
import useSWR from 'swr';
import { getPoses } from '@/services/api/equipment';
import {
  Select,
  Row,
  Col,
  Typography,
  Tag,
  Card,
  Input,
  Radio,
  RadioChangeEvent,
} from 'antd';
const { Text } = Typography;
import Percentage from '@icons/Percentage.svg?react';
import DiamondIcon from '@icons/DiamondIcon.svg?react';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [selectedLoyalty, setSelectedLoyalty] = useState(undefined);
  const [selectedCard, setSelectedCard] = useState<'discount' | 'promotion'>(
    'discount'
  );
  const [radioValue, setRadioValue] = useState<'percentage' | 'fix'>(
    'percentage'
  );

  const { data: posData } = useSWR([`get-pos`], () => getPoses({}), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const loyaltyOptions = [
    { value: 'bonus', label: 'Бонусная программа' },
    { value: 'discount', label: 'Скидочная программа' },
  ];

  const handleSelectBranch = (value: number | undefined) => {
    if (typeof value === 'number' && !selectedBranches.includes(value)) {
      setSelectedBranches([...selectedBranches, value]);
    }
  };

  const handleDeselectBranch = (removed: number) => {
    setSelectedBranches(selectedBranches.filter(val => val !== removed));
  };

  return (
    <ExpandedCard
      firstText={t('marketing.basic')}
      secondText={t('marketing.setup')}
      Component={BasicBouns}
      handleClick={() => {}}
    >
      <div className="ml-14">
        <div className="text-text01 font-semibold text-2xl">
          {t('marketing.branch')}
        </div>
        <div className="text-text02">{t('marketing.setUpBranch')}</div>
        <div className="text-text02">{t('marketing.branchCan')}</div>
        <Row style={{ marginTop: 30 }}>
          <Col xs={24} sm={9}>
            <Text
              style={{
                color: '#92929D',
                fontSize: 15,
                marginBottom: 4,
                display: 'block',
              }}
            >
              {t('marketing.carWash')}
            </Text>
            <Select
              placeholder={t('marketing.selectBranch')}
              value={undefined}
              onSelect={handleSelectBranch}
              options={posData
                ?.filter(option => !selectedBranches.includes(option.id))
                .map(item => ({
                  label: item.name,
                  value: item.id,
                }))}
              popupRender={menu => <div>{menu}</div>}
              className="w-full sm:w-80"
              allowClear
            />
            <div style={{ marginTop: 10 }}>
              {selectedBranches.map(branch => (
                <Tag
                  key={branch}
                  closable
                  onClose={() => handleDeselectBranch(branch)}
                  style={{
                    fontWeight: 500,
                    fontSize: 15,
                    marginBottom: 8,
                    padding: '4px 12px',
                  }}
                >
                  {posData?.find(item => item.id === branch)?.name || branch}
                </Tag>
              ))}
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <Text
              style={{
                color: '#92929D',
                fontSize: 15,
                marginBottom: 4,
                display: 'block',
              }}
            >
              {t('marketing.loyalty')}
            </Text>
            <Select
              placeholder={t('marketing.selectLoyaltyProgram')}
              value={selectedLoyalty}
              onChange={setSelectedLoyalty}
              options={loyaltyOptions}
              allowClear
              className="w-full sm:w-80"
            />
          </Col>
        </Row>
        <Row className="flex flex-col sm:flex-row gap-8 mt-10">
          <Col xs={24} sm={9}>
            <Card
              styles={{ body: { padding: 0 } }}
              className={`flex-1 rounded-3xl ${selectedCard === 'discount' ? 'bg-white border-2 border-primary02' : 'bg-[#F6F8FB]'} flex flex-col items-center justify-center cursor-pointer transition-shadow hover:shadow-md h-28 w-80`}
              onClick={() => setSelectedCard('discount')}
            >
              <div className="py-10 flex flex-col items-center justify-center">
                <div
                  className={`flex items-center space-x-2 ${selectedCard === 'discount' ? 'text-primary02' : 'text-text01'}`}
                >
                  <Percentage className="w-6 h-6" />
                  <div className={`font-semibold text-lg`}>
                    {t('marketing.dis')}
                  </div>
                </div>
                <div
                  className={`mt-2  ${selectedCard === 'discount' ? 'text-text01' : 'text-text02'} font-normal`}
                >
                  {t('marketing.give')}
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card
              styles={{ body: { padding: 0 } }}
              className={`flex-1 rounded-3xl ${selectedCard === 'promotion' ? 'bg-white border-2 border-primary02' : 'bg-[#F6F8FB]'} flex flex-col items-center justify-center cursor-pointer transition-shadow hover:shadow-md h-28 w-80`}
              onClick={() => setSelectedCard('promotion')}
            >
              <div className="py-10 flex flex-col items-center justify-center">
                <div
                  className={`flex items-center space-x-2 ${selectedCard === 'promotion' ? 'text-primary02' : 'text-text01'}`}
                >
                  <DiamondIcon className="w-6 h-6" />
                  <div className="font-semibold text-lg">
                    {t('subscriptions.promo')}
                  </div>
                </div>
                <div
                  className={`mt-2  ${selectedCard === 'promotion' ? 'text-text01' : 'text-text02'} font-normal`}
                >
                  {t('marketing.createPromotionalCode')}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        {selectedCard === 'discount' && (
          <div className="mt-10">
            <Input
              placeholder={t('marketing.enterDisc')}
              type="number"
              className="w-80"
              suffix={<div>%</div>}
            />
          </div>
        )}
        {selectedCard === 'promotion' && (
          <div className="mt-10 space-y-6">
            <div className="font-semibold text-2xl">
              {t('subscriptions.promo')}
            </div>
            <Input
              placeholder={t('marketing.enterNamePromo')}
              className="w-80"
            />
            <Radio.Group
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
              onChange={(e: RadioChangeEvent) => {
                setRadioValue(e.target.value);
              }}
              value={radioValue}
              options={[
                { value: 'percentage', label: t('marketing.per') },
                { value: 'fix', label: t('marketing.fix') },
              ]}
            />
            {radioValue === 'percentage' && (
              <div className="mt-10">
                <Input
                  placeholder={t('marketing.enterPer')}
                  type="number"
                  className="w-80"
                  suffix={<div>%</div>}
                />
              </div>
            )}
            {radioValue === 'fix' && (
              <div className="mt-10">
                <Input
                  placeholder={t('marketing.enterBon')}
                  type="number"
                  className="w-80"
                  suffix={<div>₽</div>}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </ExpandedCard>
  );
};

export default Settings;
