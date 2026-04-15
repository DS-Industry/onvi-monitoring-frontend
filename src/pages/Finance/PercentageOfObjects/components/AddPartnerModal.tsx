import React from 'react';
import { DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import type { FormInstance } from 'antd/es/form';
import { SelectOptionNumber } from '../types';

type Props = {
  open: boolean;
  confirmLoading: boolean;
  addPartnerForm: FormInstance;
  addPartnerSelectOptions: SelectOptionNumber[];
  onOk: () => void;
  onCancel: () => void;
};

const AddPartnerModal: React.FC<Props> = ({
  open,
  confirmLoading,
  addPartnerForm,
  addPartnerSelectOptions,
  onOk,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('finance.addPartner')}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText={t('organizations.save')}
      cancelText={t('organizations.cancel')}
      confirmLoading={confirmLoading}
      destroyOnClose
    >
      <Form form={addPartnerForm} layout="vertical">
        <Form.Item
          label={t('finance.selectPartner')}
          name="partnerId"
          rules={[{ required: true }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            options={addPartnerSelectOptions}
            placeholder={t('finance.selectPartner')}
          />
        </Form.Item>
        <Form.Item
          label={t('shift.startDate')}
          name="startDate"
          rules={[{ required: true }]}
        >
          <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label={t('marketing.comp')} name="endDate">
          <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label={t('finance.percent')}
          name="percent"
          rules={[{ required: true }]}
        >
          <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label={t('equipment.comment')} name="comment">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddPartnerModal;
