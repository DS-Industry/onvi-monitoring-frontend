import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { getClientById, updateClient } from '@/services/api/marketing';
import { Form, Typography, Row, Col, Button, Input, Select, message, Spin, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import { ContractType } from '@/utils/constants';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

type ClientFormData = {
  contractType: ContractType;
  name: string;
  birthday?: Date;
  phone: string;
  email?: string;
  gender?: string;
  inn?: string;
  comment?: string;
  placementId?: number;
};

const BasicInformation: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);

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

  const defaultValues: ClientFormData = useMemo(
    () => ({
      contractType: clientData?.contractType || ContractType.INDIVIDUAL,
      name: clientData?.name || '',
      birthday: clientData?.birthday ? new Date(clientData.birthday) : undefined,
      phone: clientData?.phone || '',
      email: clientData?.email || '',
      gender: clientData?.gender || '',
      comment: clientData?.comment || '',
      placementId: clientData?.placementId,
    }),
    [clientData]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ClientFormData>({ defaultValues });

  const genderOptions = useMemo(() => [
    { value: 'MALE', label: t('marketing.man') },
    { value: 'FEMALE', label: t('marketing.woman') },
  ], [t]);

  useEffect(() => {
    if (clientData && !isEditing) {
      reset(defaultValues);
    }
  }, [clientData, isEditing, reset]);

  const handleEdit = () => {
    setIsEditing(true);
    setValue('contractType', clientData?.contractType || ContractType.INDIVIDUAL);
    setValue('name', clientData?.name || '');
    setValue('birthday', clientData?.birthday ? new Date(clientData.birthday) : undefined);
    setValue('phone', clientData?.phone || '');
    setValue('email', clientData?.email || '');
    setValue('gender', clientData?.gender || '');
    setValue('comment', clientData?.comment || '');
    setValue('placementId', clientData?.placementId);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset(defaultValues);
  };

  const onSubmit = async (values: ClientFormData) => {
    try {
      if (!userId) {
        message.error('Client ID not found');
        return;
      }

      const updateData = {
        clientId: userId,
        name: values.name,
        contractType: values.contractType,
        comment: values.comment,
        email: values.email,
        placementId: values.placementId,
        gender: values.gender,
        birthday: values.birthday,
        phone: values.phone,
      };

      await updateClient(updateData);
      
      message.success(t('routes.savedSuccessfully'));
      setIsEditing(false);
      
      mutate([`get-client-by-id`]);
    } catch (error) {
      console.error('Update failed:', error);
      message.error('Failed to update client information');
    }
  };

  const renderField = (label: string, value: React.ReactNode, fieldName: string) => {
    const editableFields = ['contractType', 'name', 'birthday', 'gender', 'email', 'comment'];
    
    if (isEditing && editableFields.includes(fieldName)) {
      return (
        <Form.Item 
          label={label} 
          name={fieldName}
          help={errors[fieldName as keyof ClientFormData]?.message}
          validateStatus={errors[fieldName as keyof ClientFormData] ? 'error' : undefined}
          labelCol={{ span: 24 }}
          className="w-86"
        >
          {fieldName === 'comment' ? (
            <Controller
              name="comment"
              control={control}
              render={({ field }) => (
                <TextArea 
                  rows={3} 
                  className="w-86"
                  placeholder={t('marketing.about')}
                  {...field}
                />
              )}
            />
          ) : fieldName === 'contractType' ? (
            <Controller
              name="contractType"
              control={control}
              rules={{
                required: t('validation.contractTypeRequired') as string,
              }}
              render={({ field }) => (
                <Select {...field} className="w-86" size="large">
                  <Option value={ContractType.INDIVIDUAL}>
                    {t('marketing.physical')}
                  </Option>
                  <Option value={ContractType.CORPORATE}>
                    {t('marketing.legal')}
                  </Option>
                </Select>
              )}
            />
          ) : fieldName === 'gender' ? (
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-86"
                  placeholder={t('warehouse.notSel')}
                  options={genderOptions}
                />
              )}
            />
          ) : fieldName === 'birthday' ? (
            <Controller
              name="birthday"
              control={control}
              render={({ field }) => (
                <DatePicker
                  className="w-86"
                  placeholder={t('finance.sel')}
                  value={field.value ? dayjs(field.value) : undefined}
                  onChange={d => field.onChange(d ? d.toDate() : undefined)}
                />
              )}
            />
          ) : fieldName === 'email' ? (
            <Controller
              name="email"
              control={control}
              rules={{
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('validation.invalidEmailFormat'),
                },
              }}
              render={({ field }) => (
                <Input
                  className="w-86"
                  placeholder={t('marketing.enterEmail')}
                  {...field}
                  size="large"
                />
              )}
            />
          ) : (
            <Controller
              name={fieldName as keyof ClientFormData}
              control={control}
              rules={fieldName === 'name' ? { required: 'Name is required' } : {}}
              render={({ field }) => (
                <Input 
                  className="w-86"
                  placeholder={fieldName === 'name' ? t('marketing.enterName') : ''}
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  size="large"
                />
              )}
            />
          )}
        </Form.Item>
      );
    }

    return (
      <Form.Item label={label} labelCol={{ span: 24 }}>
        <div className="border border-borderFill rounded-md px-3 py-1 w-86 h-10 flex items-center">
          {value || '-'}
        </div>
      </Form.Item>
    );
  };

  return (
    <div className="max-w-6xl mb-5">
      {loadingClients ? (
         <div className="flex items-center justify-center w-full h-full min-h-[400px]">
          <Spin size="large" />
       </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Row gutter={[32, 24]}>
            <Col xs={24} lg={12}>
              <div className="flex justify-between items-center mb-4">
                <Title level={4}>{t('warehouse.basic')}</Title>

              </div>

              {renderField(
                t('marketing.type'),
                clientData?.contractType === ContractType.INDIVIDUAL ? t('marketing.physical') : t('marketing.legal'),
                'contractType'
              )}

              {renderField(
                t('marketing.name'),
                clientData?.name,
                'name'
              )}

              {renderField(
                t('marketing.floor'),
                clientData?.gender === 'MALE' ? t('marketing.man') : clientData?.gender === 'FEMALE' ? t('marketing.woman') : '-',
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
                t('equipment.comment'),
                clientData?.comment,
                'comment'
              )}

              {!isEditing ? (
                  <Button type="primary" onClick={handleEdit}>
                    {t('actions.edit')}
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleCancel}>
                      {t('actions.cancel')}
                    </Button>
                    <Button type="primary" htmlType="submit">
                      {t('actions.save')}
                    </Button>
                  </div>
                )}
            </Col>
            
          </Row>
        </form>
      )}
    </div>
  );
};

export default BasicInformation;
