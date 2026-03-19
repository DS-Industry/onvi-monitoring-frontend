import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Card, Typography, Divider, List, Checkbox } from 'antd';
import Button from '@/components/ui/Button/Button';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import useSubscriptionStore from '@/config/store/subscriptionSlice';
import { calculateMonthlyAmountFromSubscription } from './subscriptionPricing';

const { Title, Text } = Typography;

type Props = {
  setActiveTab: (tab: string) => void;
};

const CurrentTariff: React.FC<Props> = ({ setActiveTab }: Props) => {
  const { t } = useTranslation();
  const activeSubscription = useSubscriptionStore(
    state => state.activeSubscription
  );

  const items = useMemo(
    () => [
      { key: 'administration', label: t('routes.administration') },
      { key: 'account', label: t('subscriptions.account') },
      { key: 'data', label: t('subscriptions.data') },
    ],
    [t]
  );

  const formattedDate = useMemo(() => {
    if (!activeSubscription?.nextBillingAt) return '';
    try {
      const value = activeSubscription.nextBillingAt;
      const date =
        typeof value === 'string' ? new Date(value) : new Date(value as any);
      return Number.isNaN(date.getTime())
        ? typeof value === 'string'
          ? value
          : ''
        : date.toLocaleDateString();
    } catch {
      return typeof activeSubscription.nextBillingAt === 'string'
        ? activeSubscription.nextBillingAt
        : '';
    }
  }, [activeSubscription]);

  const monthlyAmount = useMemo(() => {
    if (!activeSubscription) return 0;
    return calculateMonthlyAmountFromSubscription(activeSubscription);
  }, [activeSubscription]);

  const yearlyAmount = useMemo(
    () => monthlyAmount * 12,
    [monthlyAmount]
  );

  const isCustomPlan = activeSubscription?.planCode === 'CUSTOM';

  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-full p-6 space-y-8">
      {/* Tariff Section */}
      <Row justify="end" align="top">
        <Col xs={24} md={12}>
          <Row align={'bottom'} gutter={8}>
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                {t('subscriptions.tariff')}
              </Title>
            </Col>
            <Col flex={'auto'}>
              <Divider style={{ margin: 0 }} />
            </Col>
          </Row>
        </Col>
        <Col xs={24} md={12} className="justify-end mt-4 md:mt-0">
          <Row justify={'space-between'}>
            <Title level={3}>
              {activeSubscription?.planName || t('subscriptions.base')}
            </Title>
            <Button
              title={t('subscriptions.change')}
              handleClick={() => setActiveTab('change')}
            />
          </Row>
          {formattedDate && (
            <Text type="secondary">
              {t('subscriptions.the')} {formattedDate}
            </Text>
          )}
          <Card className="bg-background05 rounded-lg" variant="borderless">
            <Col>
              <Row className="w-full flex justify-between items-center">
                <Title level={4} style={{ margin: 0 }}>
                  {t('subscriptions.cost')}
                </Title>
                <Title level={4} style={{ margin: 0 }}>
                  {monthlyAmount.toLocaleString('ru-RU')} ₽
                </Title>
              </Row>
              <Row className="w-full flex justify-between items-center mt-2">
                <Title level={4} style={{ margin: 0 }}>
                  {t('subscriptions.costYr')}
                </Title>
                <Title level={4} style={{ margin: 0 }}>
                  {yearlyAmount.toLocaleString('ru-RU')} ₽
                </Title>
              </Row>
              <Text type="secondary" style={{ fontSize: 16 }}>
                {t('subscriptions.when')}
              </Text>
              {(activeSubscription?.onviFeature ||
                activeSubscription?.corporateClientsFeature ||
                (isCustomPlan &&
                  (activeSubscription?.posesCount != null ||
                    activeSubscription?.usersCount != null))) && (
                <div className="mt-3 space-y-1">
                  {activeSubscription?.onviFeature && (
                    <Text type="secondary">
                      {t('subscriptionRequests.onviFeature')}
                    </Text>
                  )}
                  {activeSubscription?.corporateClientsFeature && (
                    <Text type="secondary">
                      {t('subscriptionRequests.corporateClientsFeature')}
                    </Text>
                  )}
                  {isCustomPlan && (
                    <>
                      {activeSubscription?.posesCount != null && (
                        <Text type="secondary">
                          {t('subscriptionRequests.posesCount')}:{' '}
                          {activeSubscription.posesCount}
                        </Text>
                      )}
                      {activeSubscription?.usersCount != null && (
                        <Text type="secondary">
                          {t('subscriptionRequests.usersCount')}:{' '}
                          {activeSubscription.usersCount}
                        </Text>
                      )}
                    </>
                  )}
                </div>
              )}
            </Col>
          </Card>
        </Col>
      </Row>

      <Row justify="end" align="top">
        <Col xs={24} md={12}>
          <Row align={'bottom'} gutter={8}>
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                {t('subscriptions.modules')}
              </Title>
            </Col>
            <Col flex={'auto'}>
              <Divider style={{ margin: 0 }} />
            </Col>
          </Row>
        </Col>
        <Col xs={24} md={12} className="justify-end mt-4 md:mt-0">
          <Title level={4} style={{ margin: 0 }}>
            3 {t('subscriptions.modules')}
          </Title>
          <Card className="bg-background05 rounded-lg" variant="borderless">
            <List
              dataSource={items}
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
          </Card>
        </Col>
      </Row>

      {/* <Row justify="end" align="top">
                <Col xs={24} md={12}>
                    <Row align={"bottom"} gutter={8}>
                        <Col>
                            <Title level={4} style={{ margin: 0 }}>
                                {t("subscriptions.curr")}
                            </Title>
                        </Col>
                        <Col flex={"auto"}>
                            <Divider style={{ margin: 0 }} />
                        </Col>
                    </Row>
                </Col>
                <Col xs={24} md={12}>
                    <Row justify={"space-between"}>
                        <Title level={4} style={{ margin: 0 }}>0 ₽</Title>
                        <Button title={t("subscriptions.top")} />
                    </Row>
                </Col>
            </Row> */}
    </div>
  );
};

export default CurrentTariff;
