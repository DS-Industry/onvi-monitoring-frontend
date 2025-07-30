import React, { useState } from "react";

import { useSearchParams } from "react-router-dom";

// utils
import { useTranslation } from "react-i18next";
import useSWR, { mutate } from "swr";
import { createCashOper, getCashOperRefundById } from "@/services/api/finance";
import { getDevices } from "@/services/api/equipment";
import useFormHook from "@/hooks/useFormHook";
import useSWRMutation from "swr/mutation";
import TableUtils from "@/utils/TableUtils";

// components
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import Button from "@/components/ui/Button/Button";
import NoDataUI from "@/components/ui/NoDataUI";
import NoTimeSheet from "@/assets/NoTimesheet.png";
import { Table } from "antd";

// types
import type { ColumnType } from "antd/es/table";

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

// Helper function for number formatting
const formatNumber = (num: number): string => {
  if (num === null || num === undefined || isNaN(num)) return "-";

  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(num);
};

const ReturnsTab: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpenReturn, setIsModalOpenReturn] = useState(false);

  const [searchParams] = useSearchParams();

  const shiftId = searchParams.get("id")
    ? Number(searchParams.get("id"))
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
    data: cashOperReturnData,
    isLoading: loadingCashOperReturn,
    isValidating: validatingCashOperReturn,
  } = useSWR(
    shiftId ? [`get-cash-oper-return-data-${shiftId}`] : null,
    () => getCashOperRefundById(shiftId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const cashOperReturnArray =
    cashOperReturnData?.map((item) => ({
      ...item.props,
      deviceName: devices.find(
        (dev) => dev.value === item.props.carWashDeviceId
      )?.name,
    })) || [];

  // Get user timezone for date formatting
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Antd Table columns configuration
  const columns: ColumnType<any>[] = [
    {
      title: "Устройство",
      dataIndex: "deviceName",
      key: "deviceName",
    },
    {
      title: "Дата и время",
      dataIndex: "eventDate",
      key: "eventDate",
      render: (value: string | Date) => {
        if (value === null || value === undefined) {
          return "-";
        }
        return TableUtils.createDateTimeWithoutComma(value, userTimezone);
      },
    },
    {
      title: "Сумма",
      dataIndex: "sum",
      key: "sum",
      render: (value: number) => {
        const number = formatNumber(Number(value));
        return TableUtils.createCurrencyFormat(number);
      },
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
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
          type: "REFUND" as TypeWorkDayShiftReportCashOper,
          sum: formData.sum || 0,
          carWashDeviceId: undefined,
          eventData: formData.eventData,
          comment: formData.comment,
        },
        shiftId!
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
      mutate([`get-cash-oper-return-data-${shiftId}`]);
      resetForm();
      setIsModalOpenReturn(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-full sm:max-w-[80%] lg:max-w-[1003px] h-fit rounded-2xl shadow-card p-4 mt-5 space-y-2">
        {status !== "SENT" && (
          <button
            className="px-2 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal"
            onClick={() => setIsModalOpenReturn(true)}
          >
            {t("routes.add")}
          </button>
        )}
        {loadingCashOperReturn || validatingCashOperReturn ? (
          <TableSkeleton columnCount={4} />
        ) : cashOperReturnArray.length > 0 ? (
          <Table
            dataSource={cashOperReturnArray}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        ) : (
          <div className="flex flex-col justify-center items-center">
            <NoDataUI
              title={t("finance.data")}
              description={t("finance.atThe")}
            >
              <img
                src={NoTimeSheet}
                className="mx-auto max-w-[80%] sm:max-w-[50%]"
                loading="lazy"
                alt="Timesheet"
              />
            </NoDataUI>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpenReturn}>
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">
            {t("finance.adding")}
          </h2>
          <Close
            onClick={() => {
              resetForm();
              setIsModalOpenReturn(false);
            }}
            className="cursor-pointer text-text01"
          />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 text-text02"
        >
          <div className="grid grid-cols-1 gap-4">
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
                setIsModalOpenReturn(false);
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

export default ReturnsTab;
