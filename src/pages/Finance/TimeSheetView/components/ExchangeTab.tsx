import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR, { mutate } from "swr";
import { createCashOper, getCashOperById } from "@/services/api/finance";
import { getDevices } from "@/services/api/equipment";
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import useFormHook from "@/hooks/useFormHook";
import Button from "@/components/ui/Button/Button";
import useSWRMutation from "swr/mutation";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "react-router-dom";

enum TypeWorkDayShiftReportCashOper {
  REFUND = "REFUND",
  REPLENISHMENT = "REPLENISHMENT",
}

type CreateCashOperBody = {
  type: TypeWorkDayShiftReportCashOper;
  sum: number;
  carWashDeviceId?: number;
  eventData?: Date;
  comment?: string;
};

const ExchangeTab: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchParams] = useSearchParams();

  const ownerId = searchParams.get("ownerId")
    ? Number(searchParams.get("ownerId"))
    : undefined;
  const posId = searchParams.get("posId")
    ? Number(searchParams.get("posId"))
    : undefined;
  const status = searchParams.get("status") || undefined;

  const { data: deviceData } = useSWR(
    posId ? [`get-device-${posId}`] : null,
    () => getDevices(posId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const devices: { name: string; value: number }[] =
    deviceData?.map((item) => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const {
    data: cashOperData,
    isLoading: loadingCashOper,
    isValidating: validatingCashOper,
  } = useSWR(
    ownerId ? [`get-cash-oper-data-${ownerId}`] : null,
    () => getCashOperById(ownerId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const cashOperArray = cashOperData ? [cashOperData] : [];

  const tableColumns: ColumnsType<any> = [
    {
      title: "На начало смены",
      dataIndex: "cashAtStart",
      key: "cashAtStart",
      render: (value: number) => value?.toFixed(2) || "0.00",
    },
    {
      title: "Пополнение",
      dataIndex: "replenishmentSum",
      key: "replenishmentSum",
      render: (value: number) => value?.toFixed(2) || "0.00",
    },
    {
      title: "Расход",
      dataIndex: "expenditureSum",
      key: "expenditureSum",
      render: (value: number) => value?.toFixed(2) || "0.00",
    },
    {
      title: "На конец смены",
      dataIndex: "cashAtEnd",
      key: "cashAtEnd",
      render: (value: number) => value?.toFixed(2) || "0.00",
    },
  ];

  const defaultValues = {
    type: undefined,
    sum: undefined,
    carWashDeviceId: undefined,
    eventData: undefined,
    comment: undefined,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook<CreateCashOperBody>(formData);

  const { trigger: createCash, isMutating: loadingCash } = useSWRMutation(
    ["create-cash-oper"],
    async () =>
      createCashOper(
        {
          type: formData.type
            ? (formData.type as TypeWorkDayShiftReportCashOper)
            : ("REPLENISHMENT" as TypeWorkDayShiftReportCashOper),
          sum: formData.sum || 0,
          carWashDeviceId: formData.carWashDeviceId,
          eventData: formData.eventData,
          comment: formData.comment,
        },
        ownerId!
      )
  );

  type FieldType = "type" | "sum" | "carWashDeviceId" | "eventData" | "comment";

  const handleInputChange = (field: FieldType, value: string) => {
    const numericFields = ["sum", "carWashDeviceId"];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
  };

  const onSubmit = async () => {
    const result = await createCash();

    if (result) {
      mutate([`get-cash-oper-data-${ownerId}`]);
      resetForm();
      setIsModalOpen(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-[1003px] h-fit rounded-2xl shadow-card px-3 sm:px-4 py-4 space-y-2 mt-5">
        {status !== "SENT" && (
          <button
            className="px-2 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal"
            onClick={() => setIsModalOpen(true)}
          >
            {t("routes.add")}
          </button>
        )}

        <Table
          dataSource={cashOperArray.map((item, index) => ({
            ...item,
            key: index,
          }))}
          columns={tableColumns}
          pagination={false}
          size="small"
          loading={loadingCashOper || validatingCashOper}
        />
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen}>
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">
            {t("finance.adding")}
          </h2>
          <Close
            onClick={() => {
              resetForm();
              setIsModalOpen(false);
            }}
            className="cursor-pointer text-text01"
          />
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 text-text02"
        >
          <div className="grid grid-cols-1 gap-4">
            <DropdownInput
              title={t("finance.operType")}
              label={t("warehouse.notSel")}
              options={[
                { name: t("finance.REFUND"), value: "REFUND" },
                {
                  name: t("finance.REPLENISHMENT"),
                  value: "REPLENISHMENT",
                },
              ]}
              classname="w-full"
              {...register("type", { required: "Type is Required." })}
              value={formData.type}
              onChange={(value) => handleInputChange("type", value)}
              error={!!errors.type}
              helperText={errors.type?.message || ""}
            />
            <Input
              type="number"
              title={t("finance.sum")}
              classname="w-full"
              value={formData.sum}
              changeValue={(e) => handleInputChange("sum", e.target.value)}
              error={!!errors.sum}
              {...register("sum", { required: "Sum is required" })}
              helperText={errors.sum?.message || ""}
            />
            <DropdownInput
              title={t("equipment.device")}
              label={
                devices.length === 0
                  ? t("warehouse.noVal")
                  : t("warehouse.notSel")
              }
              options={devices}
              classname="w-full"
              {...register("carWashDeviceId")}
              value={formData.carWashDeviceId}
              onChange={(value) => handleInputChange("carWashDeviceId", value)}
            />
            <Input
              type="datetime-local"
              title={t("finance.date")}
              classname="w-full"
              {...register("eventData")}
              value={formData.eventData}
              changeValue={(e) =>
                handleInputChange("eventData", e.target.value)
              }
            />
          </div>

          <MultilineInput
            title={t("equipment.comment")}
            classname="w-full"
            {...register("comment")}
            value={formData.comment}
            changeValue={(e) => handleInputChange("comment", e.target.value)}
          />

          <div className="flex flex-wrap justify-end gap-3 mt-5">
            <Button
              title={"Сбросить"}
              handleClick={() => {
                resetForm();
                setIsModalOpen(false);
              }}
              type="outline"
            />
            <Button title={"Сохранить"} form={true} isLoading={loadingCash} />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExchangeTab;
