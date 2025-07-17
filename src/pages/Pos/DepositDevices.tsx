import React, { useMemo, useState } from "react";

// utils
import useSWR from "swr";
import { getDepositPos } from "@/services/api/pos";
import { useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPlacement } from "@/services/api/device";
import { getCurrencyRender, getDateRender } from "@/utils/tableUnits";
import { getPoses } from "@/services/api/equipment";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";

// components
import NoDataUI from "@ui/NoDataUI.tsx";
import SalyIamge from "@/assets/NoCollection.png";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";

import { Link } from "react-router-dom";

import { Table } from "antd";

// types
import type { ColumnsType } from "antd/es/table";

interface DevicesMonitoring {
  id: number;
  name: string;
  city: string;
  counter: number;
  cashSum: number;
  virtualSum: number;
  yandexSum: number;
  mobileSum: number;
  cardSum: number;
  lastOper: Date;
  discountSum: number;
  cashbackSumCard: number;
  cashbackSumMub: number;
}

const DepositDevices: React.FC = () => {
  const { t } = useTranslation();
  const allCategoriesText = t("warehouse.all");

  const location = useLocation();

  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10);

  const [searchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("size") || 15);
  const posId = searchParams.get("posId") || "*";
  const dateStart =
    searchParams.get("dateStart") ?? new Date().toISOString().slice(0, 10);

  const dateEnd =
    searchParams.get("dateEnd") ?? new Date().toISOString().slice(0, 10);

  const cityParam = Number(searchParams.get("city")) || "*";

  // Get poses based on the selected city
  const { data: poses } = useSWR(
    `get-pos-${cityParam}`,
    () =>
      getPoses({ placementId: cityParam })
        .then((data) => data?.sort((a, b) => a.id - b.id) || [])
        .then((data) => {
          const options = data.map((item) => ({
            name: item.name,
            value: item.id,
          }));
          const posesAllObj = { name: allCategoriesText, value: "*" };
          return [posesAllObj, ...options];
        }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  // Fetch cities for the dropdown filter
  const { data: cities } = useSWR(
    [`get-city`],
    () =>
      getPlacement().then(
        (data) =>
          data?.map((item) => ({ text: item.region, value: item.region })) || []
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const filterParams = useMemo(
    () => ({
      dateStart: new Date(dateStart || `${formattedDate} 00:00`),
      dateEnd: new Date(dateEnd?.toString() || `${formattedDate} 23:59`),
      posId: posId || location.state?.ownerId || "*",
      placementId: cityParam,
      page: currentPage,
      size: pageSize,
    }),
    [
      dateStart,
      dateEnd,
      posId,
      cityParam,
      currentPage,
      pageSize,
      formattedDate,
      location.state?.ownerId,
    ]
  );

  const swrKey = useMemo(
    () =>
      `get-pos-deposits-${filterParams.posId}-${filterParams.placementId}-${filterParams.dateStart}-${filterParams.dateEnd}-${filterParams.page}-${filterParams.size}`,
    [filterParams]
  );

  const [totalPosesCount, setTotalPosesCount] = useState(0);

  // Fetch devices data based on the filter parameters
  const { data: devices, isLoading: filterLoading } = useSWR(
    swrKey,
    () =>
      getDepositPos(filterParams).then((data) => {
        setTotalPosesCount(data.totalCount || 0);
        const sorted = [...(data.oper ?? [])].sort((a, b) => a.id - b.id);
        return sorted;
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

  const columns: ColumnsType<DevicesMonitoring> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Наименование",
      dataIndex: "name",
      key: "name",
      filters: [],
      onFilter: (value, record) => record.name === value,
      render: (text, record) => {
        return (
          <Link
            to={{
              pathname: "/station/enrollments/devices",
            }}
            state={{
              ownerId: record.id,
              name: record.name,
            }}
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: "Город",
      dataIndex: "city",
      key: "city",
      filters: cities,
      onFilter: (value, record) => record.city === value,
    },
    {
      title: "Последняя операция",
      dataIndex: "lastOper",
      key: "lastOper",
      render: dateRender,
      sorter: (a, b) =>
        new Date(a.lastOper).getTime() - new Date(b.lastOper).getTime(),
    },
    {
      title: "Наличные",
      dataIndex: "cashSum",
      key: "cashSum",
      render: currencyRender,
    },
    {
      title: "Безналичные",
      dataIndex: "virtualSum",
      key: "virtualSum",
      render: currencyRender,
    },
    {
      title: "Cashback по картам",
      dataIndex: "cashbackSumCard",
      key: "cashbackSumCard",
      render: currencyRender,
    },
    {
      title: "Сумма скидки",
      dataIndex: "discountSum",
      key: "discountSum",
      render: currencyRender,
    },
    {
      title: "Кол-во операций",
      dataIndex: "counter",
      key: "counter",
      sorter: (a, b) => a.counter - b.counter,
    },
    {
      title: "Яндекс Сумма",
      dataIndex: "yandexSum",
      key: "yandexSum",
      render: currencyRender,
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columns);

  return (
    <>
      <GeneralFilters count={totalPosesCount} hideSearch={true} poses={poses} />

      {filterLoading ? (
        <TableSkeleton columnCount={columns.length} />
      ) : totalPosesCount ? (
        <div className="mt-8">
          <ColumnSelector
            checkedList={checkedList}
            options={options}
            onChange={setCheckedList}
          />
          <Table
            rowKey="id"
            dataSource={devices}
            columns={visibleColumns}
            scroll={{ x: "max-content" }}
          />
        </div>
      ) : (
        <>
          <NoDataUI
            title="В этом разделе представлены операции, которые фиксируются купюроприемником"
            description="У вас пока нет операций с купюроприемником"
          >
            <img src={SalyIamge} alt="No" className="mx-auto" />
          </NoDataUI>
        </>
      )}
    </>
  );
};

export default DepositDevices;
