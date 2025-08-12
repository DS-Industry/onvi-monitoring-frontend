import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';
import { getClientById } from '@/services/api/marketing';
import { Row, Col, Card, Typography, Button as AntButton } from 'antd';
import {
  ClockCircleOutlined,
  FireOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Loyalty: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const editClientId = location.state.ownerId;

  const { data: clientData } = useSWR(
    editClientId !== 0 ? [`get-client-by-id`] : null,
    () => getClientById(editClientId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  return (
    <>
      <Row gutter={[24, 24]} className="flex-wrap">
        <Col xs={24} md={12} lg={8}>
          <Card className="rounded-2xl shadow-card h-80">
            <Title level={4} className="text-text01 mb-4">
              {t('marketing.loyalty')}
            </Title>

            <div className="mb-3">
              <Text type="secondary" className="text-sm">
                {t('marketing.card')}
              </Text>
              <div className="border border-borderFill rounded-md px-2 py-1 mt-1 text-text01">
                {clientData?.card?.devNumber || '-'}
              </div>
            </div>

            <div className="mb-3">
              <Text type="secondary" className="text-sm">
                {t('marketing.un')}
              </Text>
              <div className="border border-borderFill rounded-md px-2 py-1 mt-1 text-text01">
                {clientData?.card?.number || '-'}
              </div>
            </div>

            <div>
              <Text type="secondary" className="text-sm">
                {t('equipment.start')}
              </Text>
              <div className="border border-borderFill rounded-md px-2 py-1 mt-1 w-32 text-text01">
                01.06.2023
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card className="rounded-2xl shadow-card h-80">
            <Title level={4} className="text-text01 mb-4">
              {t('marketing.purchase')}
            </Title>

            <Text className="text-xs font-semibold text-text01">
              {t('marketing.detail')}
            </Text>
            <Row justify="space-between" className="my-2">
              <Col className="w-20">
                <Title level={5} className="text-text01 m-0">
                  12 500
                </Title>
                <Text className="text-sm text-text02">
                  {t('marketing.acc')}
                </Text>
              </Col>
              <Col className="w-28">
                <div className="text-end">
                  <Title level={5} className="text-text01 m-0">
                    2 500
                  </Title>
                  <Text className="text-sm text-text02">
                    {t('marketing.until')}
                  </Text>
                </div>
              </Col>
            </Row>

            <div className="flex space-x-1.5 mt-2">
              {Array.from({ length: 20 }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2.5 h-5 ${index < 15 ? 'bg-primary02/30' : 'bg-background07'}`}
                />
              ))}
            </div>

            <Row justify="space-between" className="mt-6">
              <Col>
                <Text className="text-lg font-semibold text-text01">
                  {t('marketing.newbie')}
                </Text>
                <div className="text-sm text-text02">
                  {t('marketing.current')}
                </div>
              </Col>
              <Col className="text-end">
                <Text className="text-lg font-semibold text-text01">
                  {t('marketing.amateur')}
                </Text>
                <div className="text-sm text-text02">{t('marketing.next')}</div>
              </Col>
            </Row>

            <Row align="middle" className="mt-6 space-x-2">
              <ClockCircleOutlined className="text-primary02 text-lg" />
              <Text className="text-primary02 font-semibold">
                {t('marketing.accrual')}
              </Text>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={24} lg={8}>
          <div className="rounded-2xl shadow-card h-80">
            <div className="flex flex-col h-full">
              <div className="flex-1 bg-white p-4">
                <Row className="flex justify-between">
                  <Title level={4} className="text-text01">
                    {t('marketing.bonus')}
                  </Title>
                  <AntButton
                    icon={<PlusOutlined />}
                    type="default"
                    className="ml-auto border-primary02 text-primary02 w-28"
                  >
                    {t('marketing.accrue')}
                  </AntButton>
                </Row>

                <div className="mt-4">
                  <Text className="text-xs font-semibold text-text01">
                    {t('marketing.detail')}
                  </Text>
                  <Row justify="space-between" className="mt-2">
                    <Col className="w-20">
                      <Text className="text-lg font-semibold text-text01">
                        100
                      </Text>
                      <div className="text-sm text-text02">
                        {t('marketing.active')}
                      </div>
                    </Col>
                    <Col className="w-20">
                      <Text className="text-lg font-semibold text-text01">
                        0
                      </Text>
                      <div className="text-sm text-text02">
                        {t('marketing.wait')}
                      </div>
                    </Col>
                    <Col className="w-24">
                      <div className="flex items-center">
                        <FireOutlined className="text-warningFill mr-1" />
                        <Text className="text-lg font-semibold text-warningFill">
                          100
                        </Text>
                      </div>
                      <div className="text-sm text-text02">
                        {t('marketing.will')}
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>

              <div className="flex-1 bg-background07 p-4 rounded-b-2xl">
                <Text className="text-xs font-semibold text-text01">
                  {t('marketing.during')}
                </Text>
                <Row justify="space-between" className="mt-2">
                  <Col>
                    <Text className="text-lg font-semibold text-text01">
                      100
                    </Text>
                    <div className="text-sm text-text02">
                      {t('marketing.accr')}
                    </div>
                  </Col>
                  <Col>
                    <Text className="text-lg font-semibold text-text01">0</Text>
                    <div className="text-sm text-text02">
                      {t('marketing.writ')}
                    </div>
                  </Col>
                  <Col>
                    <Text className="text-lg font-semibold text-text01">
                      100
                    </Text>
                    <div className="text-sm text-text02">
                      {t('marketing.burn')}
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Loyalty;
