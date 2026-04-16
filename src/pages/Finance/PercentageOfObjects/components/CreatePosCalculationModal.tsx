import React from 'react';
import { Button, Checkbox, DatePicker, Form, Input, InputNumber, Modal, Select, Typography } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Dayjs } from 'dayjs';
import type { FormInstance } from 'antd/es/form';
import { SelectOptionNumber } from '../types';

type NewPartnerFormValue = {
  partnerId?: number;
  startDate?: Dayjs;
  endDate?: Dayjs;
  percent?: number;
  comment?: string;
};

type Props = {
  open: boolean;
  confirmLoading: boolean;
  createForm: FormInstance;
  watchedCreatePartners: NewPartnerFormValue[] | undefined;
  createPartnersSumInfo: { sum: number; valid: boolean };
  createPosOptions: SelectOptionNumber[];
  isCreatePosOptionsLoading: boolean;
  partnerSelectOptions: Array<{ value: number; label: string }>;
  onOk: () => void;
  onCancel: () => void;
};

const CreatePosCalculationModal: React.FC<Props> = ({
  open,
  confirmLoading,
  createForm,
  watchedCreatePartners,
  createPartnersSumInfo,
  createPosOptions,
  isCreatePosOptionsLoading,
  partnerSelectOptions,
  onOk,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('routes.add')}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText={t('routes.add')}
      cancelText={t('organizations.cancel')}
      confirmLoading={confirmLoading}
      width={720}
      okButtonProps={{
        disabled:
          ((watchedCreatePartners?.length ?? 0) > 0 && !createPartnersSumInfo.valid) ||
          createPosOptions.length === 0,
      }}
    >
      <Form form={createForm} layout="vertical">
        <Form.Item
          label={t('analysis.posId')}
          name="posId"
          rules={[{ required: true }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            options={createPosOptions}
            placeholder={t('filters.pos.placeholder')}
            loading={isCreatePosOptionsLoading}
            filterOption={(input, option) =>
              (option?.label ?? '')
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label={t('finance.cost')}
          name="cost"
          rules={[{ required: true }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="calculationReport"
          valuePropName="checked"
        >
          <Checkbox>{t('finance.includeInReport')}</Checkbox>
        </Form.Item>

        <Typography.Text strong className="block mb-2">
          {t('finance.partnersOnCreate')}
        </Typography.Text>
        <Form.List name="newPartners">
          {(fields, { add, remove }) => (
            <div className="space-y-3">
              {fields.map(field => (
                <div
                  key={field.key}
                  className="flex flex-wrap items-end gap-2 rounded border border-gray-200 p-3"
                >
                  <Form.Item
                    label={t('finance.selectPartner')}
                    name={[field.name, 'partnerId']}
                    rules={[{ required: true }]}
                    className="mb-0 min-w-[220px] flex-1"
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      options={partnerSelectOptions}
                      placeholder={t('finance.selectPartner')}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t('shift.startDate')}
                    name={[field.name, 'startDate']}
                    rules={[{ required: true }]}
                    className="mb-0"
                  >
                    <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item
                    label={t('marketing.comp')}
                    name={[field.name, 'endDate']}
                    className="mb-0"
                  >
                    <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item
                    label={t('finance.percent')}
                    name={[field.name, 'percent']}
                    rules={[{ required: true }]}
                    className="mb-0 w-28"
                  >
                    <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item
                    label={t('equipment.comment')}
                    name={[field.name, 'comment']}
                    className="mb-0 min-w-[160px] flex-1"
                  >
                    <Input />
                  </Form.Item>
                  <Button type="text" danger onClick={() => remove(field.name)}>
                    {t('actions.delete')}
                  </Button>
                </div>
              ))}
              <Button
                type="dashed"
                block
                icon={<UserAddOutlined />}
                onClick={() => add()}
                disabled={!partnerSelectOptions.length}
              >
                {t('finance.addPartner')}
              </Button>
              {(watchedCreatePartners?.length ?? 0) > 0 && (
                <div
                  className={`text-sm ${!createPartnersSumInfo.valid ? 'text-red-500' : 'text-text02'}`}
                >
                  {t('finance.percent')}: {createPartnersSumInfo.sum.toFixed(2)}%
                  {!createPartnersSumInfo.valid && (
                    <span className="ms-2">{t('finance.partnersPercentSumMustBe100')}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default CreatePosCalculationModal;
