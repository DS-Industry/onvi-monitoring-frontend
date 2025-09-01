import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spin, Button, message, Form, Input } from 'antd';
import {
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

const BasicInformation: React.FC = () => {
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
    <div className='space-y-6'>
      <div className="font-semibold text-text01 text-2xl">
        {t('warehouse.basic')}
      </div>
      <div>
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
            label={
              <span className="text-text02">{t('corporateClients.name')}</span>
            }
            name="name"
            rules={[{ required: true, message: t('validation.nameRequired') }]}
          >
            <Input
              disabled={!isEditing}
              placeholder={t('corporateClients.enterCompanyName')}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-text02">{t('corporateClients.inn')}</span>
            }
            name="inn"
            rules={[{ required: true, message: t('validation.innRequired') }]}
          >
            <Input
              disabled={!isEditing}
              placeholder={t('enterInnPlaceholder')}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-text02">
                {t('corporateClients.address')}
              </span>
            }
            name="address"
            rules={[
              { required: true, message: t('validation.addressRequired') },
            ]}
          >
            <Input.TextArea
              disabled={!isEditing}
              placeholder={t('corporateClients.enterCompanyAddress')}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-text02">
                {t('corporateClients.ownerPhone')}
              </span>
            }
          >
            <Input value={client.ownerPhone} disabled />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-text02">
                {t('corporateClients.dateRegistered')}
              </span>
            }
          >
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
              <Button
                icon={<EditOutlined style={{ fontSize: 16 }} />}
                onClick={handleEdit}
                type="primary"
                className='py-6 px-8 mb-10 font-semibold'
              >
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
    </div>
  );
};

export default BasicInformation;
