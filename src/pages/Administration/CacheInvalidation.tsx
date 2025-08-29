import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Button, Card, Alert, Space, Typography, Divider } from 'antd';
import { ClearOutlined, InfoCircleOutlined } from '@ant-design/icons';
import useSWRMutation from 'swr/mutation';
import {
  invalidateCache,
  CacheInvalidationRequest,
} from '@/services/api/system';
import { useToast } from '@/hooks/useToast';

const { Text, Title } = Typography;
const { TextArea } = Input;

const CacheInvalidation: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [path, setPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { trigger: invalidateCacheMutation, isMutating } = useSWRMutation(
    'cache-invalidation',
    async (_, { arg }: { arg: CacheInvalidationRequest }) => {
      return invalidateCache(arg);
    }
  );

  const handleInvalidateCache = async () => {
    if (!path.trim()) {
      showToast(t('cache.pathRequired'), 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await invalidateCacheMutation({ path: path.trim() });

      if (result?.success) {
        showToast(t('cache.invalidationSuccess'), 'success');
        setPath('');
      } else {
        showToast(result?.message || t('cache.invalidationError'), 'error');
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
      showToast(t('cache.invalidationError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPath = () => {
    setPath('');
  };

  const examples = [
    '/api/users/*',
    '/api/organizations/*',
    '/api/pos/*',
    '/api/warehouse/*',
    '/api/finance/*',
    '/api/hr/*',
    '/api/equipment/*',
    '/api/marketing/*',
    '/api/notifications/*',
    '/api/reports/*',
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Title level={2} className="flex items-center gap-2">
          <ClearOutlined className="text-blue-600" />
          {t('cache.title')}
        </Title>
        <Text type="secondary" className="text-base">
          {t('cache.description')}
        </Text>
      </div>

      <Alert
        message={t('cache.warning')}
        description={t('cache.warningDescription')}
        type="warning"
        showIcon
        icon={<InfoCircleOutlined />}
        className="mb-6"
      />

      <Card className="mb-6">
        <div className="mb-4">
          <Text strong className="block mb-2">
            {t('cache.pathLabel')}
          </Text>
          <TextArea
            value={path}
            onChange={e => setPath(e.target.value)}
            placeholder={t('cache.pathPlaceholder')}
            rows={3}
            className="mb-3"
          />
          <Space className="mb-4">
            <Button
              type="primary"
              icon={<ClearOutlined />}
              onClick={handleInvalidateCache}
              loading={isLoading || isMutating}
              disabled={!path.trim()}
            >
              {t('cache.invalidateButton')}
            </Button>
            <Button onClick={handleClearPath} disabled={!path.trim()}>
              {t('cache.clearButton')}
            </Button>
          </Space>
        </div>

        <Divider />

        <div>
          <Text strong className="block mb-3">
            {t('cache.examplesTitle')}
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examples.map((example, index) => (
              <div
                key={index}
                className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setPath(example)}
              >
                <Text code className="text-sm">
                  {example}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <Title level={4} className="flex items-center gap-2 mb-3">
          <InfoCircleOutlined className="text-blue-600" />
          {t('cache.usageTitle')}
        </Title>
        <div className="space-y-2">
          <Text className="block">
            • <Text strong>{t('cache.usage1')}</Text>
          </Text>
          <Text className="block">
            • <Text strong>{t('cache.usage2')}</Text>
          </Text>
          <Text className="block">
            • <Text strong>{t('cache.usage3')}</Text>
          </Text>
          <Text className="block">
            • <Text strong>{t('cache.usage4')}</Text>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default CacheInvalidation;
