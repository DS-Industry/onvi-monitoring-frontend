import React from "react";
import { Modal, Form, Input, Select, DatePicker, Button, message } from "antd";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { getDevices } from "@/services/api/equipment";
import { createCashOper } from "@/services/api/finance";
import { mutate } from "swr";

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
    }
  );

  const devices =
    deviceData?.map((item) => ({
      label: item.props.name,
      value: item.props.id,
    })) || [];

  const { trigger: createCash, isMutating } = useSWRMutation(
    ["create-cash-oper"],
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
      onClose();
    } catch (error) {
      message.error(t("errors.submitFailed"));
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal open={open} onCancel={handleCancel} footer={false}>
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
          label={t("finance.operType")}
          name="type"
          rules={[{ required: true, message: t("Type is Required.") }]}
        >
          <Select placeholder={t("warehouse.notSel")}>
            <Option value="REFUND">{t("finance.REFUND")}</Option>
            <Option value="REPLENISHMENT">{t("finance.REPLENISHMENT")}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t("finance.sum")}
          name="sum"
          rules={[{ required: true, message: t("Sum is required.") }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label={t("equipment.device")}
          name="carWashDeviceId"
          rules={[{ required: true, message: t("Device is required.") }]}
        >
          <Select
            placeholder={
              devices.length ? t("warehouse.notSel") : t("warehouse.noVal")
            }
            options={devices}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label={t("finance.date")}
          name="eventData"
          rules={[{ required: true, message: t("Date is required.") }]}
        >
          <DatePicker showTime format="YYYY-MM-DDTHH:mm" className="w-full" />
        </Form.Item>

        <Form.Item
          label={t("equipment.comment")}
          name="comment"
          rules={[{ required: true, message: t("Comment is required.") }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
          <Button onClick={handleCancel}>{t("actions.reset")}</Button>
          <Button type="primary" htmlType="submit" loading={isMutating}>
            {t("actions.save")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateCashOperationModal;
