import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import WalletIcon from '@icons/WalletIcon.svg?react';
import { Button, Input, Radio, RadioChangeEvent, Select, Switch } from 'antd';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useSearchParams } from 'react-router-dom';
import { RightOutlined } from '@ant-design/icons';

const WriteOffRules: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [radioValue, setRadioValue] = useState('never');

  return (
    <div>
      <div className="flex items-center justify-center bg-background02 p-4">
        <div className="flex flex-col rounded-lg p-8 w-full md:p-0 space-y-10">
          <div className="flex items-center space-x-4">
            <WalletIcon />
            <div>
              <div className="font-semibold text-text01">
                {t('marketingLoyalty.writeOff')}
              </div>
              <div className="text-text03 text-xs">
                {t('marketingLoyalty.settingUp')}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row flex-1">
            <div className="w-7/12">
              <div className="text-text01 font-semibold">
                {t('marketingLoyalty.maximumWriteOff')}
              </div>
              <div className="text-text03">
                {t('marketingLoyalty.maximumPossible')}
              </div>
            </div>
            <div>
              <Input suffix={<div>%</div>} className="w-20" value={50} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-7/12">
              <div className="text-text01 font-semibold">
                {t('marketingLoyalty.useBonuses')}
              </div>
              <div className="text-text03">
                {t('marketingLoyalty.allowBonuses')}
              </div>
            </div>
            <div>
              <Switch defaultChecked />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-7/12">
              <div className="text-text01 font-semibold">
                {t('marketing.burni')}
              </div>
              <div className="text-text03">{t('marketing.bonusesCan')}</div>
            </div>
            <div className="space-y-4">
              <Radio.Group
                value={radioValue}
                onChange={(e: RadioChangeEvent) => {
                  setRadioValue(e.target.value);
                }}
              >
                <Radio
                  value="never"
                  style={{
                    backgroundColor:
                      radioValue === 'never' ? '#E4F0FF' : '#E4E5E7',
                    borderColor: '#E4F0FF',
                    color: '#000',
                    padding: '8px',
                  }}
                >
                  {t('marketing.never')}
                </Radio>
                <Radio
                  value="period"
                  style={{
                    backgroundColor:
                      radioValue === 'period' ? '#E4F0FF' : '#E4E5E7',
                    borderColor: '#E4F0FF',
                    color: '#000',
                    padding: '8px',
                  }}
                >
                  {t('marketingLoyalty.afterPeriod')}
                </Radio>
              </Radio.Group>
              {radioValue === 'period' && (
                <div className="w-96">
                  <Select
                    placeholder={t('techTasks.selectPeriodicity')}
                    options={[]}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex mt-auto justify-end gap-2">
        <Button
          onClick={() =>
            updateSearchParams(searchParams, setSearchParams, {
              step: 3,
            })
          }
          type="primary"
          icon={<RightOutlined />}
          iconPosition="end"
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};

export default WriteOffRules;
