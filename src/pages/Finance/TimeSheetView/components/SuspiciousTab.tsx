import React from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getCashOperSuspiciousById } from "@/services/api/finance";
import { getDevices } from "@/services/api/equipment";
import { getDateRender } from "@/utils/tableUnits";
import NoDataUI from "@/components/ui/NoDataUI";
import NoTimeSheet from "@/assets/NoTimesheet.png";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "react-router-dom";

const SuspiciousTab: React.FC = () => {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();

  const shiftId = searchParams.get("id")
    ? Number(searchParams.get("id"))
    : undefined;
  const posId = searchParams.get("posId")
    ? Number(searchParams.get("posId"))
    : undefined;

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

  const { data: cashOperSuspData, isLoading: loadingCashOperSusp } = useSWR(
    shiftId ? [`get-cash-oper-susp-data-${shiftId}`] : null,
    () => getCashOperSuspiciousById(shiftId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const cashOperSubsArray =
    cashOperSuspData?.map((item) => ({
      ...item,
      deviceName: devices.find((dev) => dev.value === item.deviceId)?.name,
    })) || [];

  const dateRender = getDateRender();

  const columns: ColumnsType<any> = [
    {
      title: t("equipment.device"),
      dataIndex: "deviceName",
      key: "deviceName",
    },
    {
      title: t("finance.startTime"),
      dataIndex: "programDate",
      key: "programDate",
      render: dateRender,
    },
    {
      title: t("finance.program"),
      dataIndex: "programName",
      key: "programName",
    },
    {
      title: t("finance.workingTime"),
      dataIndex: "programTime",
      key: "programTime",
    },
    {
      title: t("finance.previousStartTime"),
      dataIndex: "lastProgramDate",
      key: "lastProgramDate",
      render: dateRender,
    },
    {
      title: t("finance.previousProgram"),
      dataIndex: "lastProgramName",
      key: "lastProgramName",
    },
    {
      title: t("finance.previousWorkingTime"),
      dataIndex: "lastProgramTime",
      key: "lastProgramTime",
    },
  ];

  return (
    <div className="w-full max-w-[1003px] h-fit rounded-2xl shadow-card p-4 mt-5 mx-auto">
      {cashOperSubsArray.length > 0 || loadingCashOperSusp ? (
        <Table
          dataSource={cashOperSubsArray}
          columns={columns}
          rowKey={(record, index) => index || 0}
          pagination={false}
          size="small"
          loading={loadingCashOperSusp}
        />
      ) : (
        <div className="flex flex-col justify-center items-center text-center p-4">
          <NoDataUI title={t("finance.data")} description={t("finance.atThe")}>
            <img
              src={NoTimeSheet}
              className="mx-auto w-3/4 sm:w-1/2 md:w-1/3"
              loading="lazy"
              alt="Timesheet"
            />
          </NoDataUI>
        </div>
      )}
    </div>
  );
};

export default SuspiciousTab;
