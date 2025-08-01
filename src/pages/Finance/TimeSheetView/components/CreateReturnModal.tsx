import React from "react";
import { Form, Input, DatePicker, Button, message, Modal } from "antd";
import { useTranslation } from "react-i18next";
import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import dayjs from "dayjs";

// services
import { createCashOper } from "@/services/api/finance";
import {
  CreateCashOperBody,
  TypeWorkDayShiftReportCashOper,
} from "@/services/api/finance";

interface CreateReturnModalProps {
  shiftId: number;
  onSuccess: () => void;
  onCancel: () => void;
  open: boolean;
}

const CreateReturnModal: React.FC<CreateReturnModalProps> = ({
  shiftId,
  onSuccess,
  onCancel,
  open,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { trigger: createCash, isMutating: loadingCash } = useSWRMutation(
    ["create-cash-oper"],
    async () => {
      const values = await form.validateFields();
      const payload: CreateCashOperBody = {
        type: TypeWorkDayShiftReportCashOper.REFUND,
        sum: Number(values.sum),
        carWashDeviceId: undefined,
        eventData: values.eventData
          ? dayjs(values.eventData).toDate()
          : undefined,
        comment: values.comment,
      };

      return createCashOper(payload, shiftId);
    }
  );

  const onFinish = async () => {
    try {
      const result = await createCash();

      if (result) {
        mutate([`get-cash-oper-return-data-${shiftId}`]);
        form.resetFields();
        onSuccess();
        message.success(t("finance.returnCreated"));
      }
    } catch (err: any) {
      message.error(t("errors.submitFailed"));
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal open={open} footer={false} onCancel={onCancel}>
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">
          {t("finance.adding")}
        </h2>
      </div>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        className="text-text02 space-y-4"
      >
        <Form.Item
          label={t("finance.sum")}
          name="sum"
          rules={[{ required: true, message: t("validation.sumRequired") }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item label={t("finance.date")} name="eventData">
          <DatePicker showTime className="w-full" format="YYYY-MM-DDTHH:mm" />
        </Form.Item>

        <Form.Item label={t("equipment.comment")} name="comment">
          <Input.TextArea rows={4} />
        </Form.Item>

        <div className="flex flex-wrap justify-end gap-3 mt-5">
          <Button onClick={handleCancel}>{t("actions.reset")}</Button>
          <Button type="primary" htmlType="submit" loading={loadingCash}>
            {t("actions.save")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateReturnModal;
