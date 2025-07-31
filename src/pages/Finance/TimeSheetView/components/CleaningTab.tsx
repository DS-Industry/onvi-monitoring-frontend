import React from "react";

import { useSearchParams } from "react-router-dom";

// utils
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getCashOperCleanById } from "@/services/api/finance";
import { getDevices } from "@/services/api/equipment";
import { formatNumber } from "@/utils/tableUnits";

// components
import { Table } from "antd";

// types
import type { ColumnsType } from "antd/es/table";

interface TableRowData {
  key: string;
  deviceName: string | null;
  programName: string;
  countProgram: number;
  time: string;
}

const CleaningTab: React.FC = () => {
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

  const { data: cashOperCleanData, isLoading: loadingCashOperClean } = useSWR(
    shiftId ? [`get-cash-oper-clean-data-${shiftId}`] : null,
    () => getCashOperCleanById(shiftId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const tableData =
    cashOperCleanData?.flatMap(({ deviceId, programData }) => {
      const deviceName =
        devices.find((dev) => dev.value === deviceId)?.name || "";

      return programData.map(({ programName, countProgram, time }, index) => ({
        key: `${deviceId}-${programName}-${index}`,
        deviceName: index === 0 ? deviceName : null,
        programName,
        countProgram,
        time,
      }));
    }) || [];

  const columns: ColumnsType<TableRowData> = [
    {
      title: t("finance.deviceName"),
      dataIndex: "deviceName",
      key: "deviceName",
    },
    {
      title: t("finance.program"),
      dataIndex: "programName",
      key: "programName",
    },
    {
      title: t("finance.programCount"),
      dataIndex: "countProgram",
      key: "countProgram",
      render: (value: number) => formatNumber(value),
    },
    {
      title: t("finance.totalTime"),
      dataIndex: "time",
      key: "time",
    },
  ];

  return (
    <div className="w-full md:w-[70%] h-fit mt-5">
      <Table
        dataSource={tableData}
        columns={columns}
        rowKey="key"
        pagination={false}
        size="small"
        loading={loadingCashOperClean}
        locale={{ emptyText: t("table.noData") }}
      />
    </div>
  );
};

export default CleaningTab;
