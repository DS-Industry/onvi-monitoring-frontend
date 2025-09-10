import { useState, useEffect } from 'react';
import { Drawer, Form, message, Input, Button } from 'antd';
import {
  CorporateClientResponse,
  CreateCorporateClientRequest,
  UpdateCorporateClientRequest,
  createCorporateClient,
  updateCorporateClient,
} from '@/services/api/marketing';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/hooks/useUserStore';

interface CorporateClientDrawerProps {
  open: boolean;
  onClose: () => void;
  client?: CorporateClientResponse | null;
  onSuccess?: () => void;
}

export default function CorporateClientDrawer({
  open,
  onClose,
  client,
  onSuccess,
}: CorporateClientDrawerProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();

  const [initialValues, setInitialValues] = useState({
    name: '',
    inn: '',
    address: '',
  });

  const user = useUser();

  const isEditMode = !!client;

  useEffect(() => {
    if (open && !client) {
      setInitialValues({
        name: '',
        inn: '',
        address: '',
      });
      form.resetFields();
    }
  }, [open, client]);

  useEffect(() => {
    if (client) {
      setInitialValues({
        name: client.name || '',
        inn: client.inn || '',
        address: client.address || '',
      });
      form.setFieldsValue({
        name: client.name || '',
        inn: client.inn || '',
        address: client.address || '',
      });
    } else {
      setInitialValues({
        name: '',
        inn: '',
        address: '',
      });
      form.resetFields();
    }
  }, [client, form]);

  const handleSubmit = async (values: {
    name: string;
    inn: string;
    address: string;
  }) => {
    try {
      setLoading(true);

      if (isEditMode && client) {
        const updateRequest: UpdateCorporateClientRequest = {
          name: values.name,
          inn: values.inn,
          address: values.address,
          organizationId: Number(user.organizationId),
        };

        await updateCorporateClient(client.id, updateRequest);
        message.success(t('marketing.corporationUpdated'));
      } else {
        const createRequest: CreateCorporateClientRequest = {
          name: values.name,
          inn: values.inn,
          address: values.address,
          organizationId: Number(user.organizationId),
        };

        await createCorporateClient(createRequest);
        message.success(t('marketing.corporationCreated'));
      }

      onSuccess?.();
      onClose();
      form.resetFields();
    } catch (error) {
      console.error('Error saving corporate client:', error);
      message.error(t('marketing.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={
        isEditMode
          ? t('marketing.editCorporation')
          : t('marketing.createCorporation')
      }
      open={open}
      onClose={handleClose}
      width={600}
      zIndex={9999}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
        className="space-y-6"
      >
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">
              {t('marketing.corporationName')}
            </div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: t('marketing.enterCorporationName'),
              },
              { min: 2, message: t('marketing.corporationNameMin') },
            ]}
          >
            <Input
              placeholder={t('marketing.enterCorporationName')}
              className="w-80"
            />
          </Form.Item>
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">{t('marketing.inn')}</div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            name="inn"
            rules={[
              { required: true, message: t('marketing.enterInn') },
              {
                pattern: /^\d{15}$/,
                message: t('marketing.innPattern'),
              },
            ]}
          >
            <Input
              placeholder={t('marketing.enterInnPlaceholder')}
              className="w-80"
            />
          </Form.Item>
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">{t('marketing.address')}</div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            name="address"
            rules={[{ required: true, message: t('marketing.enterAddress') }]}
          >
            <Input
              placeholder={t('marketing.enterAddressPlaceholder')}
              className="w-80"
            />
          </Form.Item>
        </div>
        <div className="flex space-x-4 pt-6">
          <Button className="btn-outline-primary" onClick={handleClose}>
            {t('marketing.cancel')}
          </Button>
          <Button loading={loading} className="btn-primary" htmlType="submit">
            {isEditMode ? t('marketing.save') : t('marketing.create')}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}
