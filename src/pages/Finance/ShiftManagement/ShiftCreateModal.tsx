import React, { useState } from 'react';
import { Modal, Steps, Form, DatePicker, TimePicker, Select, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Option } = Select;

interface ShiftCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ShiftFormData) => void;
  users?: Array<{ id: number; name: string; surname: string }>;
  loading?: boolean;
}

interface ShiftFormData {
  date: Dayjs;
  startTime: Dayjs;
  endTime: Dayjs;
  userId: number;
  workType: 'regular' | 'overtime' | 'night' | 'weekend';
}

const ShiftCreateModal: React.FC<ShiftCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  users = [],
  loading = false
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ShiftFormData>>({});

  const steps = [
    {
      title: t('shift.dateTime'),
      content: 'datetime'
    },
    {
      title: t('shift.userSelection'),
      content: 'user'
    },
    {
      title: t('shift.workType'),
      content: 'worktype'
    }
  ];

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormData(prev => ({ ...prev, ...values }));

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        const finalData = { ...formData, ...values } as ShiftFormData;
        onSubmit(finalData);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(0);
    setFormData({});
    onClose();
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  const validateTimeRange = (_: any, value: Dayjs) => {
    const startTime = form.getFieldValue('startTime');
    if (startTime && value && value.isBefore(startTime)) {
      return Promise.reject(new Error(t('shift.endTimeAfterStart')));
    }
    return Promise.resolve();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Form.Item
              name="date"
              label={t('shift.date')}
              rules={[{ required: true, message: t('shift.dateRequired') }]}
            >
              <DatePicker
                className="w-full"
                disabledDate={disabledDate}
                format="YYYY-MM-DD"
                placeholder={t('shift.selectDate')}
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="startTime"
                label={t('shift.startTime')}
                rules={[{ required: true, message: t('shift.startTimeRequired') }]}
              >
                <TimePicker
                  className="w-full"
                  format="HH:mm"
                  placeholder={t('shift.selectStartTime')}
                />
              </Form.Item>

              <Form.Item
                name="endTime"
                label={t('shift.endTime')}
                rules={[
                  { required: true, message: t('shift.endTimeRequired') },
                  { validator: validateTimeRange }
                ]}
              >
                <TimePicker
                  className="w-full"
                  format="HH:mm"
                  placeholder={t('shift.selectEndTime')}
                />
              </Form.Item>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <Form.Item
              name="userId"
              label={t('shift.selectUser')}
              rules={[{ required: true, message: t('shift.userRequired') }]}
            >
              <Select
                placeholder={t('shift.selectUserPlaceholder')}
                className="w-full"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {users.map(user => (
                  <Option key={user.id} value={user.id}>
                    {`${user.name} ${user.surname}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Form.Item
              name="workType"
              label={t('shift.workType')}
              rules={[{ required: true, message: t('shift.workTypeRequired') }]}
            >
              <Select placeholder={t('shift.selectWorkType')} className="w-full">
                <Option value="regular">{t('shift.regular')}</Option>
                <Option value="overtime">{t('shift.overtime')}</Option>
                <Option value="night">{t('shift.night')}</Option>
                <Option value="weekend">{t('shift.weekend')}</Option>
              </Select>
            </Form.Item>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">{t('shift.summary')}</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{t('shift.date')}: {formData.date?.format('YYYY-MM-DD')}</p>
                <p>{t('shift.time')}: {formData.startTime?.format('HH:mm')} - {formData.endTime?.format('HH:mm')}</p>
                <p>{t('shift.user')}: {users.find(u => u.id === formData.userId)?.name} {users.find(u => u.id === formData.userId)?.surname}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={t('shift.createShift')}
      open={isOpen}
      onCancel={handleCancel}
      width={600}
      footer={null}
      destroyOnClose
    >
      <div className="py-4">
        <Steps current={currentStep} className="mb-6">
          {steps.map(item => (
            <Steps.Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          initialValues={formData}
          className="min-h-[300px]"
        >
          {renderStepContent()}
        </Form>

        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            {t('common.previous')}
          </Button>

          <div className="space-x-2">
            <Button onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button
              type="primary"
              onClick={handleNext}
              loading={loading && currentStep === steps.length - 1}
            >
              {currentStep === steps.length - 1 ? t('common.create') : t('common.next')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShiftCreateModal;
