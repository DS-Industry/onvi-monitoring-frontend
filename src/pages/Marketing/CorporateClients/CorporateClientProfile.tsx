import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spin, Button, message, Form, Input } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import useSWR from 'swr';

import {
  CorporateClientResponse,
  getCorporateClientById,
  updateCorporateClient,
} from '@/services/api/marketing';

const CorporateClientProfile: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const clientId = searchParams.get('clientId');

  const {
    data: client,
    error,
    isLoading,
    mutate,
  } = useSWR<CorporateClientResponse>(
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

  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue({
      name: client.name,
      inn: client.inn,
      address: client.address,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const values = await form.validateFields();

      await updateCorporateClient(Number(clientId), {
        name: values.name,
        inn: values.inn,
        address: values.address,
      });

      message.success(t('corporateClients.updateSuccess'));
      setIsEditing(false);
      mutate();
    } catch (error) {
      console.error('Error updating client:', error);
      message.error(t('corporateClients.updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 ml-10 md:ml-0">
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

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: client.name,
          inn: client.inn,
          address: client.address,
        }}
        className="bg-white rounded-lg w-full md:w-3/4 lg:w-1/2"
      >
        <Form.Item
          label={t('corporateClients.name')}
          name="name"
          rules={[{ required: true, message: t('validation.nameRequired') }]}
        >
          <Input
            disabled={!isEditing}
            placeholder={t('corporateClients.enterCompanyName')}
          />
        </Form.Item>

        <Form.Item
          label={t('corporateClients.inn')}
          name="inn"
          rules={[{ required: true, message: t('validation.innRequired') }]}
        >
          <Input disabled={!isEditing} placeholder={t('enterInnPlaceholder')} />
        </Form.Item>

        <Form.Item
          label={t('corporateClients.address')}
          name="address"
          rules={[{ required: true, message: t('validation.addressRequired') }]}
        >
          <Input
            disabled={!isEditing}
            placeholder={t('corporateClients.enterCompanyAddress')}
          />
        </Form.Item>

        <Form.Item label={t('corporateClients.ownerPhone')}>
          <Input value={client.ownerPhone} disabled />
        </Form.Item>

        <Form.Item label={t('corporateClients.dateRegistered')}>
          <Input
            value={
              client.dateRegistered
                ? new Date(client.dateRegistered).toLocaleDateString()
                : '-'
            }
            disabled
          />
        </Form.Item>

        {client.comment && (
          <Form.Item label={t('equipment.comment')}>
            <Input value={client.comment} disabled />
          </Form.Item>
        )}

        <div className="mt-6 space-x-3">
          {!isEditing ? (
            <Button icon={<EditOutlined />} onClick={handleEdit} type="primary">
              {t('actions.edit')}
            </Button>
          ) : (
            <>
              <Button
                icon={<CloseOutlined />}
                onClick={handleCancel}
                type="default"
              >
                {t('actions.cancel')}
              </Button>
              <Button
                icon={<SaveOutlined />}
                onClick={handleSave}
                type="primary"
                loading={isSaving}
              >
                {t('actions.save')}
              </Button>
            </>
          )}
        </div>
      </Form>
    </div>
  );
};

export default CorporateClientProfile;
