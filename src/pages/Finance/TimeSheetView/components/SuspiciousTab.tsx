import React from "react";
import { useSearchParams } from "react-router-dom";

// utils
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getCashOperSuspiciousById } from "@/services/api/finance";
import { getDevices } from "@/services/api/equipment";
import { getDateRender } from "@/utils/tableUnits";

// components
import { Table } from "antd";

// types
import type { ColumnsType } from "antd/es/table";

interface SuspiciousData {
  deviceId: number;
  programName: string;
  programDate: Date;
  programTime: string;
  lastProgramName: string;
  lastProgramDate: Date;
  lastProgramTime: string;
  deviceName?: string;
}

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

  const devices =
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

  const columns: ColumnsType<SuspiciousData> = [
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
    <>
      <Table
        dataSource={cashOperSubsArray}
        columns={columns}
        rowKey={(record) => `${record.deviceId}-${record.programDate}`}
        pagination={false}
        size="small"
        loading={loadingCashOperSusp}
        scroll={{ x: "500px" }}
        locale={{ emptyText: t("table.noData") }}
      />
    </>
  );
};

export default SuspiciousTab;
