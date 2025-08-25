import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { getClientById } from '@/services/api/marketing';
import { Skeleton } from 'antd';
import { Form, Typography, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { ContractType } from '@/utils/constants';
// import api from '@/config/axiosConfig';

const { Title } = Typography;

const BasicInformation: React.FC = () => {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();

  const userId = searchParams.get('userId')
    ? Number(searchParams.get('userId'))
    : undefined;

  const { data: clientData, isValidating: loadingClients } = useSWR(
    userId ? [`get-client-by-id`] : null,
    () => getClientById(userId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  // const { data } = useSWR(
  //   'get-key-stats',
  //   () => api.get('user/loyalty/key-stats').then(res => res.data),
  //   {
  //     revalidateOnFocus: false,
  //     revalidateOnReconnect: false,
  //     keepPreviousData: true,
  //   }
  // );

  return (
    <div className="max-w-6xl">
      {loadingClients ? (
        <div className="flex flex-col md:flex-row gap-6 mb-5">
          <div className="flex flex-col space-y-6 w-full">
            <Skeleton.Input active style={{ width: 150, height: 32 }} />
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 256, height: 40 }} />
            </div>
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 384, height: 40 }} />
            </div>
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 56, height: 40 }} />
            </div>
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 144, height: 40 }} />
            </div>
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 384, height: 40 }} />
            </div>
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 384, height: 40 }} />
            </div>
            <div className="flex flex-col space-y-2">
              <Skeleton.Input
                active
                style={{ width: 100, height: 24, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: 384, height: 80 }} />
            </div>
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
                  {clientData?.contractType
                    ? ContractType[
                        clientData.contractType as unknown as keyof typeof ContractType
                      ]
                    : '-'}
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
            </Col>
          </Row>
        </Form>
      )}
    </div>
  );
};

export default BasicInformation;
