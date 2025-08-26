import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { getClientById, updateClient } from '@/services/api/marketing';
import { Form, Typography, Row, Col, Button, Input, Select, message, Spin } from 'antd';
import dayjs from 'dayjs';

import { UserType } from '@/services/api/marketing';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const BasicInformation: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

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

  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue({
      name: clientData?.name || '',
      gender: clientData?.gender || '',
      birthday: clientData?.birthday ? dayjs(clientData.birthday) : null,
      phone: clientData?.phone || '',
      email: clientData?.email || '',
      comment: clientData?.comment || '',
      type: clientData?.type || UserType.PHYSICAL,
      inn: clientData?.inn || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (!userId) {
        message.error('Client ID not found');
        return;
      }

      const updateData = {
        clientId: userId,
        name: values.name,
        type: values.type,
        inn: values.inn,
        comment: values.comment,
      };

      await updateClient(updateData);
      
      message.success('Client information updated successfully');
      setIsEditing(false);
      
      mutate([`get-client-by-id`]);
    } catch (error) {
      console.error('Update failed:', error);
      message.error('Failed to update client information');
    }
  };

  const renderField = (label: string, value: React.ReactNode, fieldName: string) => {
    const editableFields = ['name', 'type', 'inn', 'comment'];
    
    if (isEditing && editableFields.includes(fieldName)) {
      return (
        <Form.Item 
          label={label} 
          name={fieldName}
          rules={fieldName === 'name' ? [{ required: true, message: 'Name is required' }] : []}
        >
          {fieldName === 'comment' ? (
            <TextArea rows={4} />
          ) : fieldName === 'type' ? (
            <Select>
              <Option value={UserType.PHYSICAL}>{t('marketing.physical')}</Option>
              <Option value={UserType.LEGAL}>{t('marketing.legal')}</Option>
            </Select>
          ) : (
            <Input />
          )}
        </Form.Item>
      );
    }

    return (
      <Form.Item label={label}>
        <div className="border border-borderFill rounded-md px-3 py-1 w-full max-w-md">
          {value || '-'}
        </div>
      </Form.Item>
    );
  };

  return (
    <div className="max-w-6xl">
      {loadingClients ? (
         <div className="flex items-center justify-center w-full h-full min-h-[400px]">
          <Spin size="large" />
       </div>
      ) : (
        <Form form={form} layout="vertical" className="mb-5">
          <Row gutter={[32, 24]}>
            {/* Left Column */}
            <Col xs={24} lg={12}>
              <div className="flex justify-between items-center mb-4">
                <Title level={4}>{t('warehouse.basic')}</Title>
              </div>

              {renderField(
                t('marketing.type'),
                clientData?.type === UserType.PHYSICAL ? t('marketing.physical') : t('marketing.legal'),
                'type'
              )}

              {renderField(
                t('marketing.name'),
                clientData?.name,
                'name'
              )}

              {renderField(
                t('marketing.floor'),
                clientData?.gender,
                'gender'
              )}

              {renderField(
                t('register.date'),
                clientData?.birthday ? dayjs(clientData.birthday).format('DD.MM.YYYY') : '-',
                'birthday'
              )}

              {renderField(
                t('profile.telephone'),
                clientData?.phone,
                'phone'
              )}

              {renderField(
                "E-mail",
                clientData?.email,
                'email'
              )}

              {renderField(
                t('marketing.inn'),
                clientData?.inn,
                'inn'
              )}

              {renderField(
                t('equipment.comment'),
                clientData?.comment,
                'comment'
              )}
            </Col>
          </Row>
          {!isEditing ? (
                  <Button type="primary" onClick={handleEdit}>
                    {t('actions.edit')}
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleCancel}>
                      {t('actions.cancel')}
                    </Button>
                    <Button type="primary" onClick={handleSave}>
                      {t('actions.save')}
                    </Button>
                  </div>
                )}
        </Form>
      )}
    </div>
  );
};

export default BasicInformation;
