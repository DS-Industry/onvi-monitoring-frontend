import React, { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";

import { useButtonCreate } from "@/components/context/useContext";
import SalaryCalculationFilter from "@/components/ui/Filter/EmployeeSalaryFilter";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import { getPositions, getPrepayments, getWorkers } from "@/services/api/hr";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  ALL_PAGE_SIZES,
} from "@/utils/constants";
import {
  getCurrencyRender,
  getDateRender,
  getPercentRender,
} from "@/utils/tableUnits";
import { updateSearchParams } from "@/utils/updateSearchParams";


type PaymentParams = {
  startPaymentDate: Date | string;
  endPaymentDate: Date | string;
  hrWorkerId: number | string;
  billingMonth: Date | string;
  page?: number;
  size?: number;
};

type TableEmployee = {
  id: number;
  name: string;
  hrPositionId: number;
  billingMonth: Date;
  paymentDate: Date;
  monthlySalary: number;
  dailySalary: number;
  percentageSalary: number;
  countShifts: number;
  sum: number;
  hrPosition: string | undefined;
};

const EmployeeAdvance: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { buttonOn } = useButtonCreate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: positionData } = useSWR([`get-positions`], () => getPositions(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

  const positions: { name: string; value: number; label: string; }[] = positionData?.map((item) => ({ name: item.props.name, value: item.props.id, label: item.props.name })) || [];

  const startPaymentDate = searchParams.get("startPaymentDate") || "";
  const endPaymentDate = searchParams.get("endPaymentDate") || "";
  const workerId = Number(searchParams.get("hrWorkerId")) || "*";
  const currentPage = Number(searchParams.get("page") || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get("size") || DEFAULT_PAGE_SIZE);

  const filterParams = useMemo<PaymentParams>(
    () => ({
      startPaymentDate: startPaymentDate || "*",
      endPaymentDate: endPaymentDate || "*",
      hrWorkerId: workerId,
      billingMonth: "*",
      page: currentPage,
      size: pageSize,
    }),
    [startPaymentDate, endPaymentDate, workerId, currentPage, pageSize]
  );

  const swrKey = useMemo(
    () => [
      "get-payments",
      filterParams.startPaymentDate,
      filterParams.endPaymentDate,
      filterParams.hrWorkerId,
      filterParams.page,
      filterParams.size,
    ],
    [filterParams]
  );

  const { data: paymentsData, isLoading: paymentsLoading } = useSWR(
    swrKey,
    () =>
      getPrepayments({
        startPaymentDate: filterParams.startPaymentDate,
        endPaymentDate: filterParams.endPaymentDate,
        hrWorkerId: filterParams.hrWorkerId,
        billingMonth: filterParams.billingMonth,
        page: filterParams.page,
        size: filterParams.size,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true
    });

  const payments = paymentsData?.map((pay) => ({
    ...pay,
    hrPosition: positions.find((pos) => pos.value === pay.hrPositionId)?.name
  })) || [];

  const { data: workersData } = useSWR([`get-workers`], () => getWorkers({
    placementId: "*",
    hrPositionId: "*",
    organizationId: "*"
  }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

  const workers: { name: string; value: number | "*"; }[] = [
    { name: t("hr.all"), value: "*" },
    ...(workersData?.map((work) => ({
      name: work.props.name,
      value: work.props.id
    })) || [])
  ];

  const totalCount = payments?.length || 0;

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();
  const percentRender = getPercentRender();

  const columnsEmployee: ColumnsType<TableEmployee> = [
    {
      title: "ФИО",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Должность",
      dataIndex: "hrPosition",
      key: "hrPosition",
      render: (value: string | undefined) => value || "-",
    },
    {
      title: "Расчетный месяц",
      dataIndex: "billingMonth",
      key: "billingMonth",
      render: dateRender,
    },
    {
      title: "Дата выдачи",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: dateRender,
    },
    {
      title: "Оклад",
      dataIndex: "monthlySalary",
      key: "monthlySalary",
      sorter: (a, b) => a.monthlySalary - b.monthlySalary,
      render: currencyRender,
    },
    {
      title: "Посменное начисление",
      dataIndex: "dailySalary",
      key: "dailySalary",
      sorter: (a, b) => a.dailySalary - b.dailySalary,
      render: currencyRender,
    },
    {
      title: "Процент",
      dataIndex: "percentageSalary",
      key: "percentageSalary",
      render: percentRender,
    },
    {
      title: "Количество отработанных смен",
      dataIndex: "countShifts",
      key: "countShifts",
      sorter: (a, b) => a.countShifts - b.countShifts,
    },
    {
      title: "Выплачено",
      dataIndex: "sum",
      key: "sum",
      sorter: (a, b) => a.sum - b.sum,
      render: currencyRender,
    }
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector<TableEmployee>(
      columnsEmployee,
      "employee-columns"
    );

  useEffect(() => {
    if (buttonOn)
      navigate("/hr/employee/advance/creation");
  }, [buttonOn, navigate])

  return (
    <div>

      <SalaryCalculationFilter
        count={totalCount}
        workers={workers}
      />

      <div className="mt-8">

        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />

        <Table
          rowKey={(record) => `${record.name}-${record.billingMonth}-${record.paymentDate}`}
          dataSource={payments}
          columns={visibleColumns}
          loading={paymentsLoading}
          scroll={{ x: "max-content" }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} из ${total} сотрудников`,
            onChange: (page, size) =>
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              }),
          }}
        />

      </div>

    </div>
  )
}

export default EmployeeAdvance;