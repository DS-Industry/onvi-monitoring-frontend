import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";

import { useButtonCreate } from "@/components/context/useContext";
import EmployeeSalaryFilter from "@/components/ui/Filter/EmployeeSalaryFilter";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import { getPayments, getPositions, getWorkers } from "@/services/api/hr";
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

type PositionOption = {
  props: {
    id: number;
    name: string;
  };
};

type WorkerOption = {
  props: {
    id: number;
    name: string;
  };
};

type TablePayment = {
  id: number;
  hrWorkerId: number;
  name: string;
  hrPositionId: number;
  billingMonth: Date;
  paymentDate: Date;
  monthlySalary: number;
  dailySalary: number;
  percentageSalary: number;
  countShifts: number;
  prepaymentSum: number;
  paymentSum: number;
  prize: number;
  fine: number;
  totalPayment: number;
  createdAt: Date;
  createdById: number;
  hrPosition: string | undefined;
};

const SalaryCalculation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { buttonOn } = useButtonCreate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  const startPaymentDate = searchParams.get("startPaymentDate") || "";
  const endPaymentDate = searchParams.get("endPaymentDate") || "";
  const workerId = Number(searchParams.get("hrWorkerId")) || "*";
  const currentPage = Number(searchParams.get("page") || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get("size") || DEFAULT_PAGE_SIZE);

  const filterParams = useMemo<PaymentParams>(
    () => ({
      startPaymentDate: startPaymentDate,
      endPaymentDate: endPaymentDate,
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

  const { data: paymentsData, isLoading } = useSWR(
    swrKey,
    () =>
      getPayments({
        startPaymentDate: filterParams.startPaymentDate || "*",
        endPaymentDate: filterParams.endPaymentDate || "*",
        hrWorkerId: filterParams.hrWorkerId || "*",
        billingMonth: filterParams.billingMonth,
        page: filterParams.page,
        size: filterParams.size,
      }).finally(() => setIsInitialLoading(false)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: workersData } = useSWR(
    ["get-workers"],
    () =>
      getWorkers({
        placementId: "*",
        hrPositionId: "*",
        organizationId: "*",
      }),
    { revalidateOnFocus: false }
  );

  const { data: positionData } = useSWR(
    ["get-positions"],
    () => getPositions(),
    { revalidateOnFocus: false }
  );

  const workers: { name: string; value: string }[] = useMemo(() => {
    const defaultOption = [{ name: t("hr.all"), value: "*" }];
    if (!workersData) return defaultOption;
    return [
      ...defaultOption,
      ...workersData.map((worker: WorkerOption) => ({
        name: worker.props.name,
        value: String(worker.props.id),
      })),
    ];
  }, [workersData, t]);

  const positionsMap = useMemo(() => {
    const map = new Map<number, string>();
    positionData?.forEach((pos: PositionOption) => {
      map.set(pos.props.id, pos.props.name);
    });
    return map;
  }, [positionData]);

  const payments = useMemo<TablePayment[]>(() => {
    return (
      paymentsData?.map((pay) => ({
        ...pay,
        id: pay.hrWorkerId,
        hrPosition: positionsMap.get(pay.hrPositionId) ?? undefined,
      })) || []
    );
  }, [paymentsData, positionsMap]);

  const totalCount = paymentsData?.length || 0;

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();
  const percentRender = getPercentRender();

  const columnsSalaryCalculation: ColumnsType<TablePayment> = [
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
      title: "Месяц расчёта",
      dataIndex: "billingMonth",
      key: "billingMonth",
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
      title: "Выплачено аванс",
      dataIndex: "prepaymentSum",
      key: "prepaymentSum",
      render: currencyRender,
      sorter: (a, b) => a.prepaymentSum - b.prepaymentSum,
    },
    {
      title: "Выплачено ЗП",
      dataIndex: "paymentSum",
      key: "paymentSum",
      sorter: (a, b) => a.paymentSum - b.paymentSum,
      render: currencyRender,
    },
    {
      title: "Премия",
      dataIndex: "prize",
      key: "prize",
      sorter: (a, b) => a.prize - b.prize,
      render: currencyRender,
    },
    {
      title: "Штраф",
      dataIndex: "fine",
      key: "fine",
      sorter: (a, b) => a.fine - b.fine,
      render: currencyRender,
    },
    {
      title: "Выплачено итог",
      dataIndex: "totalPayment",
      key: "totalPayment",
      sorter: (a, b) => a.totalPayment - b.totalPayment,
      render: currencyRender,
    }
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector<TablePayment>(
      columnsSalaryCalculation,
      "salary-calc-columns"
    );

  React.useEffect(() => {
    if (buttonOn) navigate("/hr/salary/creation");
  }, [buttonOn, navigate]);

  return (
    <div>

      <EmployeeSalaryFilter
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
          loading={isLoading || isInitialLoading}
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
  );
};

export default SalaryCalculation;