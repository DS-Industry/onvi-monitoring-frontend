import { useState, useEffect } from 'react';
import { Drawer, Form, message, Input as AntInput } from 'antd';
import {
  CorporateClientResponse,
  CreateCorporateClientRequest,
  UpdateCorporateClientRequest,
  createCorporateClient,
  updateCorporateClient,
} from '@/services/api/marketing';
import Button from '@/components/ui/Button/Button';
import { useTranslation } from 'react-i18next';

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
        };

        await updateCorporateClient(client.id, updateRequest);
        message.success('Корпорация успешно обновлена');
      } else {
        const createRequest: CreateCorporateClientRequest = {
          name: values.name,
          inn: values.inn,
          address: values.address,
        };

        await createCorporateClient(createRequest);
        message.success('Корпорация успешно создана');
      }

      onSuccess?.();
      onClose();
      form.resetFields();
    } catch (error) {
      console.error('Error saving corporate client:', error);
      message.error('Произошла ошибка при сохранении');
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
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
        className="space-y-6"
      >
        <Form.Item
          name="name"
          label="Название корпорации"
          rules={[
            {
              required: true,
              message: 'Пожалуйста, введите название корпорации',
            },
            { min: 2, message: 'Название должно содержать минимум 2 символа' },
          ]}
        >
          <AntInput
            placeholder="Введите название корпорации"
            size="large"
            className="w-full"
          />
        </Form.Item>

        <Form.Item
          name="inn"
          label="ИНН"
          rules={[
            { required: true, message: 'Пожалуйста, введите ИНН' },
            {
              pattern: /^\d{15}$/,
              message: 'ИНН должен содержать 15 цифр',
            },
          ]}
        >
          <AntInput
            placeholder="Введите ИНН (15 цифр)"
            size="large"
            className="w-full"
          />
        </Form.Item>

        <Form.Item
          name="address"
          label="Адрес"
          rules={[{ required: true, message: 'Пожалуйста, введите адрес' }]}
        >
          <AntInput
            placeholder="Введите полный адрес"
            size="large"
            className="w-full"
          />
        </Form.Item>

        <div className="flex justify-end space-x-4 pt-6">
          <Button
            title="Отмена"
            type="outline"
            handleClick={handleClose}
            disabled={loading}
          />
          <Button
            title={isEditMode ? 'Сохранить' : 'Создать'}
            type="basic"
            form={true}
            isLoading={loading}
            disabled={loading}
          />
        </div>
      </Form>
    </Drawer>
  );
}
