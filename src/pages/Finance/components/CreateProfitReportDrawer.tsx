import React from 'react';
import { Button, DatePicker, Drawer, Form, InputNumber, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import type { FormInstance } from 'antd/es/form';

type PosOption = {
  label: string;
  value: number;
};

type CreateProfitReportDrawerProps = {
  open: boolean;
  isCreating: boolean;
  form: FormInstance;
  posOptions: PosOption[];
  onClose: () => void;
  onFinish: (values: any) => void;
};

const CreateProfitReportDrawer: React.FC<CreateProfitReportDrawerProps> = ({
  open,
  isCreating,
  form,
  posOptions,
  onClose,
  onFinish,
}) => {
  const { t } = useTranslation();

  return (
    <Drawer
      title={t('pos.creating')}
      placement="right"
      onClose={onClose}
      open={open}
      width={500}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="posCalculationId"
          label={t('finance.carWash')}
          rules={[{ required: true, message: t('validation.posRequired') }]}
        >
          <Select
            showSearch
            options={posOptions}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
        <Form.Item
          name="revenue"
          label={t('finance.revenue')}
          rules={[{ required: true, message: t('validation.fillRevenue') }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={0.01}
            precision={2}
            addonAfter="₽"
          />
        </Form.Item>
        <Form.Item
          name="expense"
          label={t('finance.expense')}
          rules={[{ required: true, message: t('validation.fillExpense') }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={0.01}
            precision={2}
            addonAfter="₽"
          />
        </Form.Item>
        <Form.Item
          name="billingMonth"
          label={t('hr.billingMonth')}
          rules={[{ required: true, message: t('validation.billingMonthRequired') }]}
        >
          <DatePicker picker="month" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isCreating}>
            {t('organizations.save')}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CreateProfitReportDrawer;
