import React from 'react';
import { Modal, Form, Input, DatePicker, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import useSWRMutation from 'swr/mutation';

import { createCashOper, TypeWorkDayShiftReportCashOper } from '@/services/api/finance';
import { mutate } from 'swr';

const { TextArea } = Input;

interface CreateCashOperationModalProps {
  open: boolean;
  shiftId: number;
  onClose: () => void;
}

const CreateCashOperationModal: React.FC<CreateCashOperationModalProps> = ({
  open,
  shiftId,
  onClose,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { trigger: createCash, isMutating } = useSWRMutation(
    ['create-cash-oper'],
    async (_, { arg }) => {
      return await createCashOper(arg, shiftId);
    }
  );

  const onFinish = async (values: any) => {
    const payload = {
      ...values,
      type: TypeWorkDayShiftReportCashOper.REPLENISHMENT,
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
          label={t('finance.sum')}
          name="sum"
          rules={[{ required: true, message: t('validation.sumRequired') }]}
        >
          <Input type="number" placeholder={t('finance.sum')} />
        </Form.Item>


        <Form.Item
          label={t('finance.date')}
          name="eventData"
          rules={[{ required: true, message: t('validation.dateRequired') }]}
        >
          <DatePicker 
            showTime 
            format="YYYY-MM-DDTHH:mm" 
            className="w-full" 
            placeholder={t('finance.date')}
          />
        </Form.Item>

        <Form.Item
          label={t('equipment.comment')}
          name="comment"
          rules={[{ required: true, message: t('validation.commentRequired') }]}
        >
          <TextArea rows={4} placeholder={t('equipment.comment')} />
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
