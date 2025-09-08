import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Form,
  Button,
  Input,
  message,
  Spin,
  Typography,
  Row,
  Col,
  Avatar,
  Upload,
} from 'antd';
import useSWR from 'swr';
import { useForm, Controller } from 'react-hook-form';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { UserOutlined } from '@ant-design/icons';
import {
  CorporateClientResponse,
  getCorporateClientById,
  updateCorporateClient,
  UpdateCorporateClientRequest,
} from '@/services/api/marketing';
import { getStatusTagRender } from '@/utils/tableUnits';

const { Title } = Typography;
const { TextArea } = Input;

const BasicInformation: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const clientId = searchParams.get('clientId')
    ? Number(searchParams.get('clientId'))
    : undefined;

  const {
    data: clientData,
    isLoading,
    mutate,
  } = useSWR<CorporateClientResponse>(
    clientId ? ['corporate-client', clientId] : null,
    () => getCorporateClientById(clientId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
    }
  );

  const defaultValues = useMemo(
    () => ({
      name: clientData?.name || '',
      inn: clientData?.inn || '',
      address: clientData?.address || '',
    }),
    [clientData]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UpdateCorporateClientRequest>({ defaultValues });

  useEffect(() => {
    if (clientData && !isEditing) {
      reset(defaultValues);
    }
  }, [clientData, isEditing, reset, defaultValues]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }
  if (!clientData) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setValue('name', clientData?.name || '');
    setValue('inn', clientData?.inn || '');
    setValue('address', clientData?.address || '');
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset(defaultValues);
  };

  const onSubmit = async (values: UpdateCorporateClientRequest) => {
    setIsSaving(true);
    try {
      await updateCorporateClient(clientId!, {
        name: values.name,
        inn: values.inn,
        address: values.address,
      });
      message.success(t('corporateClients.updateSuccess'));
      setIsEditing(false);
      mutate();
    } catch (err) {
      message.error(t('corporateClients.updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (
    label: string,
    value: React.ReactNode,
    fieldName: keyof UpdateCorporateClientRequest
  ) => {
    if (isEditing) {
      return (
        <Form.Item
          label={<span className="text-text02">{label}</span>}
          name={fieldName}
          help={errors[fieldName]?.message}
          validateStatus={errors[fieldName] ? 'error' : undefined}
          layout="vertical"
          className="w-86"
        >
          <Controller
            name={fieldName}
            control={control}
            rules={{ required: t(`validation.${fieldName}Required`) as string }}
            render={({ field }) =>
              fieldName === 'address' ? (
                <TextArea
                  {...field}
                  rows={2}
                  className="w-86"
                  placeholder={t('corporateClients.enterCompanyAddress')}
                />
              ) : (
                <Input
                  {...field}
                  className="w-86"
                  placeholder={
                    fieldName === 'name'
                      ? t('corporateClients.enterCompanyName')
                      : fieldName === 'inn'
                        ? t('enterInnPlaceholder')
                        : ''
                  }
                  size="large"
                />
              )
            }
          />
        </Form.Item>
      );
    }

    return (
      <Form.Item
        label={<span className="text-text02">{label}</span>}
        layout="vertical"
      >
        <div className="border border-borderFill rounded-md px-3 py-1 w-86 h-10 flex items-center">
          {value || '-'}
        </div>
      </Form.Item>
    );
  };

  const statusRender = getStatusTagRender(t);

  return (
    <div className="max-w-6xl mb-5">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={[32, 24]}>
          <Col xs={24} lg={12}>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>{t('warehouse.basic')}</Title>
            </div>
            {renderField(t('corporateClients.name'), clientData?.name, 'name')}
            {renderField(t('corporateClients.inn'), clientData?.inn, 'inn')}
            <Form.Item
              label={
                <span className="text-text02">
                  {t('corporateClients.dateRegistered')}
                </span>
              }
              layout="vertical"
            >
              <div
                className={`border border-borderFill ${isEditing ? 'bg-disabledFill text-text03' : ''} rounded-md px-3 py-1 w-86 h-10 flex items-center`}
              >
                {clientData.dateRegistered
                  ? new Date(clientData.dateRegistered).toLocaleDateString()
                  : '-'}
              </div>
            </Form.Item>
            <div className="my-5">
              <Upload disabled showUploadList={false}>
                <div className="flex items-center">
                  <Avatar
                    size={40}
                    src={clientData.ownerAvatar || ''}
                    icon={<UserOutlined />}
                    style={{ cursor: 'default', marginRight: 12 }}
                  />
                  <Typography.Text
                    style={{ fontWeight: 600, color: '#0b68e1', fontSize: 16 }}
                  >
                    {clientData.ownerName}
                  </Typography.Text>
                </div>
              </Upload>
            </div>
            <Form.Item
              label={
                <span className="text-text02">
                  {t('corporateClients.ownerPhone')}
                </span>
              }
              layout="vertical"
            >
              <div
                className={`border border-borderFill ${isEditing ? 'bg-disabledFill text-text03' : ''} rounded-md px-3 py-1 w-86 h-10 flex items-center`}
              >
                {clientData.ownerPhone || '-'}
              </div>
            </Form.Item>
            <Form.Item
              label={
                <span className="text-text02">{t('constants.status')}</span>
              }
              layout="vertical"
            >
              <div>{statusRender(t(`tables.${clientData.status}`)) || '-'}</div>
            </Form.Item>
            <Form.Item
              label={<span className="text-text02">E-mail</span>}
              layout="vertical"
            >
              <div
                className={`border border-borderFill ${isEditing ? 'bg-disabledFill text-text03' : ''} rounded-md px-3 py-1 w-86 h-10 flex items-center`}
              >
                {clientData.ownerEmail || '-'}
              </div>
            </Form.Item>
            {renderField(
              t('corporateClients.address'),
              clientData?.address,
              'address'
            )}
            <div className="mt-6 space-x-3">
              {!isEditing ? (
                <Button
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  type="primary"
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
                    type="primary"
                    htmlType="submit"
                    loading={isSaving}
                  >
                    {t('actions.save')}
                  </Button>
                </>
              )}
            </div>
          </Col>
        </Row>
      </form>
    </div>
  );
};

export default BasicInformation;
