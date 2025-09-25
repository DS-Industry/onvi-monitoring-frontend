import React from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { getDevices } from '@/services/api/equipment';
import { createCashOper } from '@/services/api/finance';
import { mutate } from 'swr';

const { TextArea } = Input;
const { Option } = Select;

interface CreateCashOperationModalProps {
  open: boolean;
  shiftId: number;
  posId: number;
  onClose: () => void;
}

const CreateCashOperationModal: React.FC<CreateCashOperationModalProps> = ({
  open,
  shiftId,
  posId,
  onClose,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { data: deviceData } = useSWR(
    posId ? [`get-device-${posId}`] : null,
    () => getDevices(posId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const devices =
    deviceData?.map(item => ({
      label: item.props.name,
      value: item.props.id,
    })) || [];

  const { trigger: createCash, isMutating } = useSWRMutation(
    ['create-cash-oper'],
    async (_, { arg }) => {
      return await createCashOper(arg, shiftId);
    }
  );

  const onFinish = async (values: any) => {
    const payload = {
      ...values,
      sum: Number(values.sum),
      eventData: values.eventData?.toDate(),
    };

    try {
      await createCash(payload);
      await mutate([`get-cash-oper-data-${shiftId}`]);

      form.resetFields();
      message.success(t('finance.operationCreated'));
      onClose();
    } catch (error) {
      message.error(t('errors.submitFailed'));
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal open={open} onCancel={handleCancel} footer={false}>
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">
          {t('finance.adding')}
        </h2>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          type: undefined,
          sum: undefined,
          carWashDeviceId: undefined,
          eventData: null,
          comment: undefined,
        }}
      >
        <Form.Item
          label={t('finance.operType')}
          name="type"
          rules={[{ required: true, message: t('validation.typeRequired') }]}
        >
          <Select placeholder={t('warehouse.notSel')}>
            <Option value="REFUND">{t('finance.REFUND')}</Option>
            <Option value="REPLENISHMENT">{t('finance.REPLENISHMENT')}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t('finance.sum')}
          name="sum"
          rules={[{ required: true, message: t('validation.sumRequired') }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label={t('equipment.device')}
          name="carWashDeviceId"
          rules={[{ required: true, message: t('validation.deviceRequired') }]}
        >
          <Select
            placeholder={
              devices.length ? t('warehouse.notSel') : t('warehouse.noVal')
            }
            options={devices}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label={t('finance.date')}
          name="eventData"
          rules={[{ required: true, message: t('validation.dateRequired') }]}
        >
          <DatePicker showTime format="YYYY-MM-DDTHH:mm" className="w-full" />
        </Form.Item>

        <Form.Item
          label={t('equipment.comment')}
          name="comment"
          rules={[{ required: true, message: t('validation.commentRequired') }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
          <Button onClick={handleCancel}>{t('actions.reset')}</Button>
          <Button type="primary" htmlType="submit" loading={isMutating}>
            {t('actions.save')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateCashOperationModal;
