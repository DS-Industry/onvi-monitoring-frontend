import React from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getCashOperCleanById } from "@/services/api/finance";
import { getDevices } from "@/services/api/equipment";
import { formatNumber } from "@/utils/tableUnits";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "react-router-dom";

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

  const devices: { name: string; value: number }[] =
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

  const transformDataForTable = (
    data: {
      deviceId: number;
      programData: {
        programName: string;
        countProgram: number;
        time: string;
      }[];
    }[]
  ) => {
    return data.flatMap(({ deviceId, programData }) =>
      programData.map(({ programName, countProgram, time }, index) => ({
        deviceName:
          index === 0
            ? devices.find((dev) => dev.value === deviceId)?.name
            : null,
        programName,
        countProgram,
        time,
      }))
    );
  };

  const cashOperCleanArray =
    cashOperCleanData && cashOperCleanData?.length > 0
      ? transformDataForTable(cashOperCleanData)
      : [];

  const columns: ColumnsType<any> = [
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
    <div className="w-full max-w-[1003px] h-fit rounded-2xl shadow-card p-4 mt-5 mx-auto">
      <Table
        dataSource={cashOperCleanArray}
        columns={columns}
        rowKey={(record, index) => index || 0}
        pagination={false}
        size="small"
        loading={loadingCashOperClean}
      />
    </div>
  );
};

export default CleaningTab;
