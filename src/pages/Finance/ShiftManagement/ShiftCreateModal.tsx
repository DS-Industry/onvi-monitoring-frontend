import React, { useState } from "react";
import {
  Modal,
  Steps,
  Form,
  DatePicker,
  Select,
  Button,
} from "antd";
import { useTranslation } from "react-i18next";
import type { Dayjs } from "dayjs";
import useSWR from "swr";
import { getWorkers, WorkerParams } from "@/services/api/hr";
import { TypeWorkDay } from "@/services/api/finance";

const { Option } = Select;

interface ShiftCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ShiftFormData) => void;
  users?: Array<{ id: number; name: string; surname: string }>;
  loading?: boolean;
  employeeData: WorkerParams;
}

export interface ShiftFormData {
  startDate: Dayjs;
  endDate: Dayjs;
  userId: number;
  workType: TypeWorkDay;
}

const ShiftCreateModal: React.FC<ShiftCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  users = [],
  loading = false,
  employeeData,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ShiftFormData>>({});

  const steps = [
    {
      title: t("shift-management.shift-create-modal.step-one-title"),
      content: "datetime",
    },
    {
      title: t("shift-management.shift-create-modal.step-two-title"),
      content: "user",
    },
    {
      title: t("shift-management.shift-create-modal.step-three-title"),
      content: "worktype",
    },
  ];

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormData((prev) => ({ ...prev, ...values }));

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        const finalData = { ...formData, ...values } as ShiftFormData;
        onSubmit(finalData);
      }
    } catch (error) {
      console.error("Validation failed:", error);
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

  const validateEndDateTime = (_: any) => {
    const startDate = form.getFieldValue("startDate");
    const endDate = form.getFieldValue("endDate");

    if (startDate && endDate) {
      if (
        endDate.isBefore(startDate) ||
        endDate.isSame(startDate)
      ) {
        return Promise.reject(new Error(t("shift.endTimeAfterStart")));
      }
    }
    return Promise.resolve();
  };

  const { data: employees, isLoading: isEmployeeLoading } = useSWR(
    [`get-worker`],
    () => getWorkers(employeeData),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-blue-800 mb-2">
                {t("shift.shiftStart")}
              </h4>
              <Form.Item
                name="startDate"
                label={t("shift.startDateTime")}
                rules={[
                  { required: true, message: t("shift.startDateRequired") },
                ]}
              >
                <DatePicker
                  className="w-full"
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  placeholder={t("shift.selectStartDateTime")}
                />
              </Form.Item>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">
                {t("shift.shiftEnd")}
              </h4>
              <Form.Item
                name="endDate"
                label={t("shift.endDateTime")}
                rules={[
                  { required: true, message: t("shift.endDateRequired") },
                  { validator: validateEndDateTime },
                ]}
              >
                <DatePicker
                  className="w-full"
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  placeholder={t("shift.selectEndDateTime")}
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
              label={t("shift.selectUser")}
              rules={[{ required: true, message: t("shift.userRequired") }]}
            >
              <Select
                placeholder={t("shift.selectUserPlaceholder")}
                loading={isEmployeeLoading}
                className="w-full"
                showSearch
              >
                {(employees || []).map((user) => (
                  <Option key={user.props.id} value={user.props.id}>
                    {`${user.props.name}`}
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
              label={t("shift.workType")}
              rules={[{ required: true, message: t("shift.workTypeRequired") }]}
            >
              <Select
                placeholder={t("shift.selectWorkType")}
                className="w-full"
                options={Object.values(TypeWorkDay).map((type) => ({
                  label: <span>{t(`finance.${type}`)}</span>,
                  value: type,
                }))}
              />
            </Form.Item>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">{t("shift.summary")}</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  {t("shift.startDateTime")}:{" "}
                  {formData.startDate?.format("YYYY-MM-DD HH:mm")}
                </p>
                <p>
                  {t("shift.endDateTime")}:{" "}
                  {formData.endDate?.format("YYYY-MM-DD HH:mm")}
                </p>
                <p>
                  {t("shift.user")}:{" "}
                  {
                    (employees || []).find(
                      (u) => u.props.id === formData.userId
                    )?.props.name
                  }{" "}
                  {(users || []).find((u) => u.id === formData.userId)?.surname}
                </p>
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
      title={t("shift-management.shift-create-modal.title")}
      open={isOpen}
      onCancel={handleCancel}
      width={600}
      footer={null}
      destroyOnClose
    >
      <div className="py-4">
        <Steps current={currentStep} className="mb-6">
          {steps.map((item) => (
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
          <Button onClick={handlePrev} disabled={currentStep === 0}>
            {t("common.previous")}
          </Button>

          <div className="space-x-2">
            <Button onClick={handleCancel}>{t("common.cancel")}</Button>
            <Button
              type="primary"
              onClick={handleNext}
              loading={loading && currentStep === steps.length - 1}
            >
              {currentStep === steps.length - 1
                ? t("common.create")
                : t("common.next")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShiftCreateModal;
