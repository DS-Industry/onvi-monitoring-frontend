import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import type { UploadChangeParam, UploadFile } from 'antd/es/upload/interface';

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
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  const clientId = searchParams.get('clientId')
    ? Number(searchParams.get('clientId'))
    : undefined;

  const {
    data: clientData,
    error,
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

  if (!clientId) {
    message.error('Client ID is required');
    navigate('/marketing/corporate-clients');
    return null;
  }
  if (error) {
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

  function beforeUpload(file: { type: string; size: number }) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
      return Upload.LIST_IGNORE;
    }
    return true;
  }

  const handleAvatarChange = (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }
    if (info.file.status === 'done' || info.file.status === 'removed') {
      const reader = new FileReader();
      if (info.file.originFileObj) {
        reader.onload = () => {
          setAvatarUrl(reader.result as string);
          setUploading(false);
        };
        reader.readAsDataURL(info.file.originFileObj as Blob);
      }
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
          label={label}
          name={fieldName}
          help={errors[fieldName]?.message}
          validateStatus={errors[fieldName] ? 'error' : undefined}
          labelCol={{ span: 24 }}
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
      <Form.Item label={label} labelCol={{ span: 24 }}>
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
              label={t('corporateClients.dateRegistered')}
              labelCol={{ span: 24 }}
            >
              <div className="border border-borderFill rounded-md px-3 py-1 w-86 h-10 flex items-center">
                {clientData.dateRegistered
                  ? new Date(clientData.dateRegistered).toLocaleDateString()
                  : '-'}
              </div>
            </Form.Item>
            <div className="my-5">
              <Upload
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleAvatarChange}
                disabled={uploading}
              >
                <Avatar
                  size={40}
                  src={avatarUrl}
                  icon={<UserOutlined />}
                  style={{ cursor: 'pointer', marginRight: 12 }}
                />
                <Typography.Text
                  style={{ fontWeight: 600, color: '#0b68e1', fontSize: 16 }}
                >
                  Михаил Иванов
                </Typography.Text>
              </Upload>
            </div>
            <Form.Item
              label={t('corporateClients.ownerPhone')}
              labelCol={{ span: 24 }}
            >
              <div className="border border-borderFill rounded-md px-3 py-1 w-86 h-10 flex items-center">
                {clientData.ownerPhone || '-'}
              </div>
            </Form.Item>
            <Form.Item label={t('constants.status')} labelCol={{ span: 24 }}>
              <div>{statusRender(t(`tables.${clientData.status}`)) || '-'}</div>
            </Form.Item>
            <Form.Item label="E-mail" labelCol={{ span: 24 }}>
              <div className="border border-borderFill rounded-md px-3 py-1 w-86 h-10 flex items-center">
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
                  icon={<EditOutlined style={{ fontSize: 16 }} />}
                  onClick={handleEdit}
                  type="primary"
                  className="px-8 py-5 font-semibold"
                >
                  {t('actions.edit')}
                </Button>
              ) : (
                <>
                  <Button
                    icon={<CloseOutlined style={{ fontSize: 16 }} />}
                    onClick={handleCancel}
                    type="default"
                    className="px-8 py-5 font-semibold"
                  >
                    {t('actions.cancel')}
                  </Button>
                  <Button
                    icon={<SaveOutlined style={{ fontSize: 16 }} />}
                    type="primary"
                    htmlType="submit"
                    loading={isSaving}
                    className="px-8 py-5 font-semibold"
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
