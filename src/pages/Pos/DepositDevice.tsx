import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";
import dayjs from "dayjs";

// services
import { getDepositDevice } from "@/services/api/pos";
import { getDeviceByPosId } from "@/services/api/device";

// tables
import { Table } from "antd";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";

// utils
import { updateSearchParams } from "@/utils/updateSearchParams";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import { getCurrencyRender, getDateRender } from "@/utils/tableUnits";

import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "@/utils/constants";

// types
import { ColumnsType } from "antd/es/table";

type FilterDepositDevice = {
  dateStart: string;
  dateEnd: string;
  deviceId?: number;
  page?: number;
  size?: number;
};

interface DepositMonitoring {
  id: number;
  sumOper: number;
  dateOper: Date;
  dateLoad: Date;
  counter: number;
  localId: number;
  currencyType: string;
}

type DeviceOption = {
  props: {
    id: number;
    name: string;
  };
};

const DepositDevice: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const formattedDate = dayjs().format("YYYY-MM-DD");

  const posId = Number(searchParams.get("posId") || 0);
  const deviceId = Number(searchParams.get("deviceId") || 0);
  const dateStart = searchParams.get("dateStart") || `${formattedDate} 00:00`;
  const dateEnd = searchParams.get("dateEnd") || `${formattedDate} 23:59`;
  const currentPage = Number(searchParams.get("page") || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get("size") || DEFAULT_PAGE_SIZE);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const filterParams: FilterDepositDevice = useMemo(
    () => ({
      dateStart,
      dateEnd,
      page: currentPage,
      size: pageSize,
      deviceId,
    }),
    [dateStart, dateEnd, currentPage, pageSize, deviceId]
  );

  const swrKey = useMemo(() => {
    if (!deviceId) return null;
    return [
      "get-pos-deposits-pos-devices",
      deviceId,
      filterParams.dateStart,
      filterParams.dateEnd,
      filterParams.page,
      filterParams.size,
    ];
  }, [deviceId, filterParams]);

  const { data: filterData, isLoading } = useSWR(
    swrKey,
    () =>
      getDepositDevice(deviceId, {
        dateStart: new Date(filterParams.dateStart),
        dateEnd: new Date(filterParams.dateEnd),
        page: filterParams.page,
        size: filterParams.size,
      }).finally(() => {
        setIsInitialLoading(false);
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const { data: deviceList } = useSWR(
    "get-device-pos",
    () => getDeviceByPosId(posId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const deviceOptions = useMemo(() => {
    return (
      deviceList?.map((d: DeviceOption) => ({
        name: d.props.name,
        value: d.props.id,
      })) || []
    );
  }, [deviceList]);

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

  const columnsMonitoringDevice: ColumnsType<DepositMonitoring> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Сумма операции",
      dataIndex: "sumOper",
      key: "sumOper",
      render: currencyRender,
    },
    {
      title: "Дата операции",
      dataIndex: "dateOper",
      key: "dateOper",
      render: dateRender,
    },
    {
      title: "Дата загрузки",
      dataIndex: "dateLoad",
      key: "dateLoad",
      render: dateRender,
    },
    {
      title: "Счетчик",
      dataIndex: "counter",
      key: "counter",
      sorter: (a, b) => a.counter - b.counter,
    },
    {
      title: "Локальный ID",
      dataIndex: "localId",
      key: "localId",
    },
    {
      title: "Валюта",
      dataIndex: "currencyType",
      key: "currencyType",
    },
  ];

  const deviceMonitoring = useMemo(() => {
    return (
      filterData?.oper?.sort(
        (a, b) =>
          new Date(a.dateOper).getTime() - new Date(b.dateOper).getTime()
      ) || []
    );
  }, [filterData]);

  const totalCount = filterData?.totalCount || 0;

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columnsMonitoringDevice, "device-deposits-table-columns");

  return (
    <>
      <GeneralFilters
        devicesSelect={deviceOptions}
        count={totalCount}
        hideCity={true}
        hideSearch={true}
        hideReset={true}
      />

      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />

        <Table
          rowKey="id"
          dataSource={deviceMonitoring}
          columns={visibleColumns}
          loading={isLoading || isInitialLoading}
          scroll={{ x: "max-content" }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} из ${total} операций`,
            onChange: (page, size) =>
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              }),
          }}
        />
      </div>
    </>
  );
};

export default DepositDevice;
