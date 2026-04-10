import React, { useEffect } from 'react';
import { Modal, Form, Select, InputNumber, Button, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/components/context/useContext';
import {
  createEquiring,
  CreateEquiringRequest,
  EquiringType,
} from '@/services/api/marketing';

const { Option } = Select;

interface CreateBonusOperationModalProps {
  open: boolean;
  onClose: () => void;
  corporateClientId: number;
  onSuccess: () => void;
}

const CreateBonusOperationModal: React.FC<CreateBonusOperationModalProps> = ({
  open,
  onClose,
  corporateClientId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [form] = Form.useForm<{
    type: EquiringType;
    money: number;
    reason?: string;
  }>();

  const { trigger: createOperation, isMutating } = useSWRMutation(
    ['create-equiring'],
    async (_, { arg }: { arg: CreateEquiringRequest }) => {
      return createEquiring(arg);
    }
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        type: 'TOP_UP',
      });
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const operationData: CreateEquiringRequest = {
        corporateClientId,
        type: values.type,
        money: values.money,
        reason: values.reason?.trim() ? values.reason.trim() : undefined,
      };

      await createOperation(operationData);
      showToast(
        t('success.recordCreated') || 'Operation created successfully',
        'success'
      );
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      const errorMessage =
        error?.response?.data?.message ||
        t('errors.submitFailed') ||
        'Failed to create bonus operation';
      showToast(errorMessage, 'error');
      console.error('Error creating bonus operation:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={false}
      title={t('marketing.addEquiring')}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="type"
          label={t('marketing.operationType')}
          rules={[
            { required: true, message: t('validation.required') },
          ]}
        >
          <Select placeholder={t('marketing.operationType')}>
            <Option value="TOP_UP">{t('marketing.topUp')}</Option>
            <Option value="DECREASE">{t('marketing.decrease')}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="money"
          label={t('marketing.amount')}
          rules={[
            { required: true, message: t('validation.required') },
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.reject(
                    new Error(t('validation.required'))
                  );
                }
                if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
                  return Promise.reject(
                    new Error(
                      t('validation.positiveNumber')
                    )
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            min={0.01}
            precision={2}
            className="w-full"
            placeholder={t('marketing.enter')}
            addonAfter="₽"
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label={t('marketing.reason')}
        >
          <Input.TextArea
            rows={3}
            placeholder={t('marketing.reasonPlaceholder')}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
          <Button onClick={handleCancel}>
            {t('constants.cancel')}
          </Button>
          <Button type="primary" htmlType="submit" loading={isMutating}>
            {t('common.create')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateBonusOperationModal;
