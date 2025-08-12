import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  List,
  Checkbox,
  Radio,
  RadioChangeEvent,
  Drawer,
} from 'antd';
import Button from '@/components/ui/Button/Button';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import { UpOutlined, DownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

type TariffType = {
  name: string;
  active: boolean;
  priceMonthly: string;
  priceYearly: string;
  modules: { key: string; label: string }[];
  canChange: boolean;
  t: TFunction;
  setDrawerOpen: (drawerOpen: boolean) => void;
};

const TariffCard: React.FC<TariffType> = ({
  name,
  active,
  priceMonthly,
  priceYearly,
  modules,
  canChange,
  t,
  setDrawerOpen,
}) => {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handledrawerOpen = () => {
    setDrawerOpen(true);
  };

  return (
    <Card className="mb-6 bg-background05 rounded-lg" variant="borderless">
      <Row className="flex items-center space-x-4">
        <Col>
          <Title
            level={4}
            style={{ color: '#0B68E1' }}
            className="!mb-0 text-blue-600"
          >
            {name}
          </Title>
        </Col>
        <Col>
          {active && (
            <Button
              title={t('subscriptions.current')}
              handleClick={handledrawerOpen}
              disabled={true}
            />
          )}
        </Col>
      </Row>
      <Row gutter={[0, 8]} className="mt-8">
        <Col span={24}>
          <Text style={{ fontSize: 22 }}>{t('subscriptions.price')}</Text>
        </Col>
        <Col span={16}>
          <div className="flex items-end space-x-1 w-full">
            <Text className="whitespace-nowrap font-semibold text-lg">
              {t('subscriptions.in')}
            </Text>
            <div className="flex-grow border-b border-gray-300" />
            <Text className="font-semibold text-lg">{priceMonthly}</Text>
          </div>
        </Col>
        <Col span={16}>
          <div className="flex items-end space-x-1 w-full">
            <Text className="whitespace-nowrap font-semibold text-lg">
              {t('subscriptions.for')}
            </Text>
            <div className="flex-grow border-b border-gray-300" />
            <Text className="font-semibold text-lg">{priceYearly}*</Text>
          </div>
        </Col>
        <Col span={24}>
          <Text type="secondary" className="text-text02">
            *{t('subscriptions.when')}
          </Text>
        </Col>
      </Row>
      <Col className="mt-8">
        <Text style={{ fontSize: 22 }}>{t('subscriptions.modules')}</Text>
        <List
          dataSource={modules}
          split={false}
          renderItem={item => {
            const isOpen = openItems[item.key];

            return (
              <List.Item style={{ padding: 0 }}>
                <div className="w-full mb-4">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => toggleItem(item.key)}
                  >
                    <div className="cursor-pointer bg-background03 w-6 h-6 rounded text-text01 flex justify-center items-center">
                      {isOpen ? (
                        <UpOutlined className="w-4 h-4" />
                      ) : (
                        <DownOutlined className="w-4 h-4" />
                      )}
                    </div>
                    <Title level={4} style={{ margin: 0 }}>
                      {item.label}
                    </Title>
                  </div>
                  {isOpen && (
                    <div className="mt-2 pl-8 text-text02 text-sm space-y-2">
                      <Checkbox.Group
                        value={['option1', 'option2', 'option3']}
                        disabled
                      >
                        <div className="flex flex-col space-y-2">
                          <Checkbox value="option1" className="text-text02">
                            {t(`routes.objectManagement`)}
                          </Checkbox>
                          <Checkbox value="option2" className="text-text02">
                            {t(`subscriptions.tar`)}
                          </Checkbox>
                          <Checkbox value="option3" className="text-text02">
                            {t(`subscriptions.legal`)}
                          </Checkbox>
                        </div>
                      </Checkbox.Group>
                    </div>
                  )}
                </div>
              </List.Item>
            );
          }}
        />
      </Col>
      {canChange && (
        <Row justify="start" className="mt-4">
          <Button
            title={t('subscriptions.change')}
            handleClick={handledrawerOpen}
          />
        </Row>
      )}
    </Card>
  );
};

const ChangeTariff: React.FC = () => {
  const { t } = useTranslation();

  const [paymentType, setPaymentType] = useState('bank');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const onChange = (e: RadioChangeEvent) => {
    setPaymentType(e.target.value);
  };

  const tariffs = [
    {
      name: t('subscriptions.tari'),
      active: true,
      priceMonthly: '1 000 ₽',
      priceYearly: '11 000 ₽',
      modules: [
        { key: 'administration', label: t('routes.administration') },
        { key: 'account', label: t('subscriptions.account') },
        { key: 'data', label: t('subscriptions.data') },
      ],
      canChange: false,
    },
    {
      name: t('subscriptions.opt'),
      active: false,
      priceMonthly: '1 000 ₽',
      priceYearly: '11 000 ₽',
      modules: [
        { key: 'administration', label: t('routes.administration') },
        { key: 'account', label: t('subscriptions.account') },
        { key: 'data', label: t('subscriptions.data') },
      ],
      canChange: true,
    },
    {
      name: t('subscriptions.max'),
      active: false,
      priceMonthly: '1 000 ₽',
      priceYearly: '11 000 ₽',
      modules: [
        { key: 'administration', label: t('routes.administration') },
        { key: 'account', label: t('subscriptions.account') },
        { key: 'data', label: t('subscriptions.data') },
      ],
      canChange: true,
    },
  ];

  return (
    <>
      <div className="max-w-3xl py-6 px-4">
        {tariffs.map(tariff => (
          <TariffCard
            key={tariff.name}
            {...tariff}
            t={t}
            setDrawerOpen={setDrawerOpen}
          />
        ))}
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
