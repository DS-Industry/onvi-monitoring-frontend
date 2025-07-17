import React, { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import useSWR from "swr";
import dayjs from "dayjs";

import { updateSearchParams } from "@/utils/updateSearchParams";

// API
import { getDeposit } from "@/services/api/pos";
import { getPoses } from "@/services/api/equipment";
import { getPlacement } from "@/services/api/device";

// Utils
import { getCurrencyRender, getDateRender } from "@/utils/tableUnits";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";

// Components
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import NoDataUI from "@ui/NoDataUI.tsx";
import SalyIamge from "@/assets/NoCollection.png";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";

// UI
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/utils/constants";

// Types
interface DepositMonitoring {
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

const Deposit: React.FC = () => {
  const formattedDate = dayjs().format("YYYY-MM-DD");

  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page") || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get("size") || DEFAULT_PAGE_SIZE);
  const posId = searchParams.get("posId") || "*";
  const cityParam = Number(searchParams.get("city")) || "*";
  const dateStart = searchParams.get("dateStart") || formattedDate;
  const dateEnd = searchParams.get("dateEnd") || formattedDate;

  const filterParams = useMemo(
    () => ({
      dateStart: dayjs(dateStart).startOf("day").toDate(),
      dateEnd: dayjs(dateEnd).endOf("day").toDate(),
      posId,
      placementId: cityParam,
      page: currentPage,
      size: pageSize,
    }),
    [dateStart, dateEnd, posId, cityParam, currentPage, pageSize]
  );

  const swrKey = `get-pos-deposits-${filterParams.posId}-${
    filterParams.placementId
  }-${dayjs(filterParams.dateStart).toISOString()}-${dayjs(
    filterParams.dateEnd
  ).toISOString()}-${filterParams.page}-${filterParams.size}`;

  const [totalCount, setTotalCount] = useState(0);

  const { data: devices, isLoading: filterLoading } = useSWR(
    swrKey,
    () =>
      getDeposit(posId, {
        dateStart: filterParams.dateStart,
        dateEnd: filterParams.dateEnd,
      }).then((data) => {
        const sorted = [...(data ?? [])].sort((a, b) => a.id - b.id);
        setTotalCount(sorted.length);
        return sorted;
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: poses } = useSWR(
    `get-pos-${cityParam}`,
    () =>
      getPoses({ placementId: cityParam }).then((data) => {
        const sorted = data?.sort((a, b) => a.id - b.id) || [];
        const options = sorted.map((item) => ({
          name: item.name,
          value: item.id,
        }));

        return options;
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: cities } = useSWR(
    "get-cities",
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

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

  const columns: ColumnsType<DepositMonitoring> = [
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
      render: (text, record) => {
        return (
          <Link
            to="/station/enrollments/device"
            state={{ ownerId: record.id, name: record.name }}
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
        dayjs(a.lastOper).valueOf() - dayjs(b.lastOper).valueOf(),
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
      <GeneralFilters
        poses={poses}
        count={totalCount}
        hideCity={true}
        hideSearch={true}
        hideReset={true}
      />

      {filterLoading ? (
        <TableSkeleton columnCount={columns.length} />
      ) : totalCount > 0 ? (
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
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} из ${total} операций`,
              onChange: (page) =>
                updateSearchParams(searchParams, setSearchParams, {
                  page: String(page),
                }),
            }}
          />
        </div>
      ) : (
        <NoDataUI
          title="В этом разделе представлены операции"
          description="У вас пока нет операций"
        >
          <img src={SalyIamge} alt="No" className="mx-auto" />
        </NoDataUI>
      )}
    </>
  );
};

export default Deposit;
