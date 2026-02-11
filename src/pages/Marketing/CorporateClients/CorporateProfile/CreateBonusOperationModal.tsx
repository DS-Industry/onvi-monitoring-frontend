import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Select, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/components/context/useContext';
import {
  createCorporateBonusOperation,
  CreateCorporateBonusOperationRequest,
} from '@/services/api/marketing';
import { getDevices } from '@/services/api/equipment';
import { getPoses } from '@/services/api/equipment';
import { useUser } from '@/hooks/useUserStore';

const { Option } = Select;
const { TextArea } = Input;

interface CreateBonusOperationModalProps {
  open: boolean;
  onClose: () => void;
  corporateClientId: number;
  onSuccess: () => void;
}

const OPERATION_TYPES = [
  { id: 4, name: 'Подарок на день рождения', type: 'REPLENISHMENT' },
  { id: 3, name: 'Сгорание бонусных баллов', type: 'DEDUCTION' },
  { id: 2, name: 'Кэшбек', type: 'REPLENISHMENT' },
  { id: 5, name: 'Списание бонусов', type: 'DEDUCTION' },
];

const CreateBonusOperationModal: React.FC<CreateBonusOperationModalProps> = ({
  open,
  onClose,
  corporateClientId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [form] = Form.useForm();
  const user = useUser();

  const { data: posesData } = useSWR(
    open && user.organizationId
      ? ['get-poses-for-devices', user.organizationId]
      : null,
    () =>
      getPoses({
        organizationId: user.organizationId,
      }),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const posIds = useMemo(
    () => posesData?.map(pos => pos.id) || [],
    [posesData]
  );
  const posIdsKey = posIds.join(',');
  const { data: devicesData } = useSWR(
    open && posIds.length > 0
      ? ['get-devices-for-poses', posIdsKey]
      : null,
    async () => {
      const allDevices: any[] = [];
      for (const posId of posIds) {
        try {
          const devices = await getDevices(posId);
          allDevices.push(...devices);
        } catch (error) {
          console.error(`Error fetching devices for POS ${posId}:`, error);
        }
      }
      return allDevices;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const { trigger: createOperation, isMutating } = useSWRMutation(
    ['create-corporate-bonus-operation'],
    async (_, { arg }: { arg: CreateCorporateBonusOperationRequest }) => {
      return createCorporateBonusOperation(corporateClientId, arg);
    }
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const sumValue =
        typeof values.sum === 'string'
          ? parseFloat(values.sum.replace(',', '.'))
          : values.sum;

      const operationData: CreateCorporateBonusOperationRequest = {
        typeOperId: values.typeOperId,
        sum: sumValue,
        comment: values.comment || undefined,
        carWashDeviceId: values.carWashDeviceId,
      };

      await createOperation(operationData);
      showToast(
        t('success.recordCreated') || 'Bonus operation created successfully',
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
      title={t('marketingCampaigns.createBonusOperation')}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="typeOperId"
          label={t('marketingCampaigns.operationType')}
          rules={[
            { required: true, message: t('validation.required') },
          ]}
        >
          <Select
            placeholder={t('marketingCampaigns.selectOperationType')}
          >
            {OPERATION_TYPES.map(type => (
              <Option key={type.id} value={type.id}>
                {type.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="sum"
          label={t('marketingCampaigns.amount')}
          rules={[
            { required: true, message: t('validation.required') },
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.reject(
                    new Error(t('validation.required'))
                  );
                }
                const normalizedValue = String(value).replace(',', '.');
                const numValue = parseFloat(normalizedValue);
                if (isNaN(numValue) || numValue <= 0) {
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
          <Input
            type="text"
            placeholder={t('marketingCampaigns.enterAmount')}
            suffix="₽"
          />
        </Form.Item>

        <Form.Item
          name="carWashDeviceId"
          label={t('marketingCampaigns.carWashDevice')}
          rules={[
            { required: true, message: t('validation.required') || 'Required' },
          ]}
        >
          <Select
            placeholder={t('marketingCampaigns.selectDevice')}
            showSearch
            optionFilterProp="label"
            filterOption={(input, option: any) => {
              const label = String(option?.label ?? '');
              return label.toLowerCase().includes(String(input).toLowerCase());
            }}
          >
            {devicesData?.map(device => (
              <Option
                key={device.props.id}
                value={device.props.id}
                label={device.props.name}
              >
                {device.props.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="comment"
          label={t('marketingCampaigns.comment')}
        >
          <TextArea
            rows={3}
            placeholder={t('marketingCampaigns.enterComment')}
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
