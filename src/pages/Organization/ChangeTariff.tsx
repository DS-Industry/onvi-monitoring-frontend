import React, { useState } from 'react';
import {
  Radio,
  RadioChangeEvent,
  Drawer,
} from 'antd';
import Button from '@/components/ui/Button/Button';
import { useTranslation } from 'react-i18next';
import DropdownInput from '@/components/ui/Input/DropdownInput';

const ChangeTariff: React.FC = () => {
  const { t } = useTranslation();

  const [paymentType, setPaymentType] = useState('bank');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const onChange = (e: RadioChangeEvent) => {
    setPaymentType(e.target.value);
  };

  return (
    <>
      <div className="max-w-3xl py-6 px-4 space-y-4">
        <p className="text-sm text-text02">
          {t(
            'subscriptions.changeTariffSupport',
            'To change your tariff, please contact support.'
          )}
        </p>
      </div>
      <Drawer
        placement="right"
        size="large"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        className="custom-drawer"
      >
        <form className="space-y-6">
          <div className="font-semibold text-2xl text-text01">
            {t('subscriptions.payment')}
          </div>
          <div className="font-semibold text-lg text-primary02">
            {t('subscriptions.opt')}
          </div>
          <div className="grid grid-cols-[200px_1fr] gap-y-6 gap-x-10">
            <div className="text-text01">{t('subscriptions.method')}</div>
            <Radio.Group
              onChange={onChange}
              value={paymentType}
              className="space-y-2 flex flex-col"
            >
              <Radio value="bank" className="!flex !items-start">
                <div>
                  <div className="text-base text-text01">
                    {t('subscriptions.bank')}
                  </div>
                  <div className="text-sm text-text02">
                    {t('subscriptions.invoice')}
                  </div>
                </div>
              </Radio>
              <Radio value="online" className="!flex !items-start">
                <div>
                  <div className="text-base text-text01">
                    {t('subscriptions.online')}
                  </div>
                  <div className="text-sm text-text02">
                    {t('subscriptions.master')}
                  </div>
                </div>
              </Radio>
            </Radio.Group>

            <div className="text-text01">{t('subscriptions.promo')}</div>
            <DropdownInput
              value={undefined}
              options={[]}
              classname="w-80"
              label={t('subscriptions.enter')}
            />

            <div className="text-text01">{t('subscriptions.per')}</div>
            <div className="font-semibold text-lg text-text01">3 500 ₽</div>

            <div className="text-text01">{t('subscriptions.period')}</div>
            <DropdownInput
              value={undefined}
              options={[]}
              classname="w-80"
              label={t('subscriptions.3')}
            />

            <div className="text-text01">{t('subscriptions.no')}</div>
            <div className="font-semibold text-lg text-text01">3</div>

            <div className="text-text01">{t('subscriptions.paid')}</div>
            <div className="font-semibold text-lg text-text01">
              с 3 августа 2024 по 3 октября 2024
            </div>

            <div className="text-text01 text-2xl font-semibold">
              {t('finance.total')}:
            </div>
            <div className="font-semibold text-2xl text-text01">10 500 ₽</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              title={t('organizations.cancel')}
              type="outline"
              handleClick={() => {
                setDrawerOpen(!drawerOpen);
              }}
            />
            <Button title={t('subscriptions.pay')} />
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default ChangeTariff;
