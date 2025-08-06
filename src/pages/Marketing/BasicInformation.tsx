import React from 'react';
import { useTranslation } from 'react-i18next';
import PieChart from '@icons/PieChart.png';
import Check from '@/assets/icons/CheckCircle.png';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';
import { getClientById } from '@/services/api/marketing';
import { Skeleton } from 'antd';
import { Form, Typography, Tag, Row, Col, Divider, Space } from 'antd';
import { CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const BasicInformation: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const editClientId = location.state.ownerId;

  const { data: clientData, isValidating: loadingClients } = useSWR(
    editClientId !== 0 ? [`get-client-by-id`] : null,
    () => getClientById(editClientId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  return (
    <div className="max-w-6xl">
      {loadingClients ? (
        <div className="flex flex-col md:flex-row gap-6 mb-5">
          {/* Left Column */}
          <div className="flex flex-col space-y-6 w-full">
            <Skeleton.Input active style={{ width: 150, height: 32 }} />

            {/* Type */}
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 256, height: 40 }} />
            </div>

            {/* Name */}
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 384, height: 40 }} />
            </div>

            {/* Floor */}
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 56, height: 40 }} />
            </div>

            {/* Register Date */}
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 144, height: 40 }} />
            </div>

            {/* Phone */}
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 384, height: 40 }} />
            </div>

            {/* Email */}
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 384, height: 40 }} />
            </div>

            {/* Comment */}
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 384, height: 80 }} />
            </div>

            {/* Tags */}
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton.Button
                    key={i}
                    active
                    size="small"
                    style={{ width: 80, height: 32 }}
                  />
                ))}
              </div>
            </div>

            {/* Segments */}
            <div>
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <div className="flex gap-4">
                <Skeleton.Button active style={{ width: 120, height: 48 }} />
                <Skeleton.Button active style={{ width: 120, height: 48 }} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col lg:ml-40 w-full space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton.Input active style={{ width: 160, height: 32 }} />
              <Skeleton.Avatar active shape="circle" size={32} />
            </div>

            <div className="space-y-3">
              <div className="flex gap-10">
                <div className="flex gap-2 items-center">
                  <Skeleton.Avatar active shape="circle" size={24} />
                  <Skeleton.Input active style={{ width: 120 }} />
                </div>
                <div className="flex gap-2 items-center">
                  <Skeleton.Avatar active shape="circle" size={24} />
                  <Skeleton.Input active style={{ width: 120 }} />
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Skeleton.Avatar active shape="circle" size={24} />
                <Skeleton.Input active style={{ width: 160 }} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Form layout="vertical" className="mb-5">
          <Row gutter={[32, 24]}>
            {/* Left Column */}
            <Col xs={24} lg={12}>
              <Title level={4}>{t('warehouse.basic')}</Title>

              <Form.Item label={t('marketing.type')}>
                <div className="border border-borderFill rounded-md px-3 py-1 w-full max-w-xs">
                  {clientData?.type ? clientData.type : '-'}
                </div>
              </Form.Item>

              <Form.Item label={t('marketing.name')}>
                <div className="border border-borderFill rounded-md px-3 py-1 w-full max-w-md">
                  {clientData?.name ? clientData.name : '-'}
                </div>
              </Form.Item>

              <Form.Item label={t('marketing.floor')}>
                <div className="border border-borderFill rounded-md px-3 py-1 w-20">
                  {clientData?.gender ? clientData.gender : '-'}
                </div>
              </Form.Item>

              <Form.Item label={t('register.date')}>
                <div className="border border-borderFill rounded-md px-3 py-1 w-36">
                  {clientData?.birthday
                    ? dayjs(clientData.birthday).format('DD.MM.YYYY')
                    : '-'}
                </div>
              </Form.Item>

              <Form.Item label={t('profile.telephone')}>
                <div className="border border-borderFill rounded-md px-3 py-1 w-full max-w-md">
                  {clientData?.phone}
                </div>
              </Form.Item>

              <Form.Item label="E-mail">
                <div className="border border-borderFill rounded-md px-3 py-1 w-full max-w-md">
                  {clientData?.email ? clientData.email : '-'}
                </div>
              </Form.Item>

              <Form.Item label={t('equipment.comment')}>
                <div className="border border-borderFill rounded-md px-3 py-2 w-full max-w-md h-20">
                  {clientData?.comment}
                </div>
              </Form.Item>

              <Form.Item label={t('marketing.tags')}>
                <div className="flex flex-wrap gap-2 w-full max-w-md">
                  {clientData?.tags.map(tag => (
                    <Tag
                      key={tag.id}
                      style={{
                        backgroundColor: tag.color,
                        color: '#fff',
                        padding: '6px 10px',
                        fontWeight: '600',
                      }}
                      closable
                      closeIcon={<CloseOutlined style={{ color: '#fff' }} />}
                    >
                      {tag.name}
                    </Tag>
                  ))}
                </div>
              </Form.Item>

              <Form.Item label={t('routes.segments')}>
                <Space wrap>
                  <div className="flex items-center gap-2 border px-3 py-2 rounded-md text-primary border-gray-400">
                    <img src={PieChart} alt="segment" loading="lazy" />
                    <Text>{t('marketing.regular')}</Text>
                  </div>
                  <div className="flex items-center gap-2 border px-3 py-2 rounded-md text-primary border-gray-400">
                    <img src={PieChart} alt="segment" loading="lazy" />
                    <Text>{t('marketing.checks')}</Text>
                  </div>
                </Space>
              </Form.Item>
            </Col>

            {/* Right Column */}
            <Col xs={24} lg={12}>
              <div className="flex items-center space-x-2 mb-3">
                <Title level={4} className="!mb-0 whitespace-nowrap">
                  {t('marketing.mess')}
                </Title>
                <InfoCircleOutlined />
              </div>

              <Divider className="!my-3" />

              <Space direction="vertical" size="middle" className="w-full">
                <Space wrap>
                  <div className="flex items-center gap-2">
                    <img src={Check} alt="check" loading="lazy" />
                    <Text type="secondary">{t('marketing.sub')} WhatsApp</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src={Check} alt="check" loading="lazy" />
                    <Text type="secondary">{t('marketing.sub')} Telegram</Text>
                  </div>
                </Space>

                <div className="flex items-center gap-2">
                  <img src={Check} alt="check" loading="lazy" />
                  <Text type="secondary">{t('marketing.sub')} Email</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </Form>
      )}
    </div>
  );
};

export default BasicInformation;
