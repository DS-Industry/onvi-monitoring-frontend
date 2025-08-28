import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Descriptions, Spin, Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import useSWR from 'swr';

import { CorporateClientResponse, getCorporateClientById } from '@/services/api/marketing';

const CorporateClientProfile: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const clientId = searchParams.get('clientId');

  const { data: client, error, isLoading } = useSWR<CorporateClientResponse>(
    clientId ? ['corporate-client', clientId] : null,
    () => getCorporateClientById(Number(clientId!)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
    }
  );

  if (!clientId) {
    message.error('Client ID is required');
    navigate('/marketing/corporate-clients');
    return null;
  }

  if (error) {
    console.error('Error fetching client:', error);
    message.error('Failed to fetch client data');
    navigate('/marketing/corporate-clients');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/marketing/corporate-clients')}
          className="mb-4"
        >
          {t('actions.back')}
        </Button>
        
        <h1 className="text-2xl font-bold text-gray-800">
          {t('corporateClients.name')}: {client.name}
        </h1>
      </div>

      <Card className="shadow-sm">
        <Descriptions
          title={t('corporateClients.name')}
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label={t('corporateClients.name')}>
            {client.name}
          </Descriptions.Item>
          
          <Descriptions.Item label={t('corporateClients.inn')}>
            {client.inn}
          </Descriptions.Item>
          
          <Descriptions.Item label={t('corporateClients.address')}>
            {client.address}
          </Descriptions.Item>
          
          <Descriptions.Item label={t('corporateClients.ownerPhone')}>
            {client.ownerPhone}
          </Descriptions.Item>
          
          <Descriptions.Item label={t('corporateClients.dateRegistered')}>
            {client.dateRegistered ? new Date(client.dateRegistered).toLocaleDateString() : '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label={t('constants.status')}>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              client.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              client.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
              client.status === 'VERIFICATE' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {client.status}
            </span>
          </Descriptions.Item>
          
          {client.comment && (
            <Descriptions.Item label={t('equipment.comment')} span={2}>
              {client.comment}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );
};

export default CorporateClientProfile;
