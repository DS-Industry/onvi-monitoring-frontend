import React, { useState } from "react";

import { useSearchParams } from "react-router-dom";

// serives
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import {
  StatusWorkDayShiftReport,
  getCashOperById,
} from "@/services/api/finance";

// components
import { Table } from "antd";
import CreateCashOperationModal from "./CreateCashOperationModal";

// utils
import { getCurrencyRender } from "@/utils/tableUnits";

// types
import type { ColumnsType } from "antd/es/table";
import { GetDataOperResponse } from "@/services/api/finance";

interface ExchangeTabProps {
  status?: StatusWorkDayShiftReport;
}

const ExchangeTab: React.FC<ExchangeTabProps> = ({ status }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchParams] = useSearchParams();

  const shiftId = searchParams.get("id")
    ? Number(searchParams.get("id"))
    : undefined;
  const posId = searchParams.get("posId")
    ? Number(searchParams.get("posId"))
    : undefined;

  const {
    data: cashOperData,
    isLoading: loadingCashOper,
    isValidating: validatingCashOper,
  } = useSWR(
    shiftId ? [`get-cash-oper-data-${shiftId}`] : null,
    () => getCashOperById(shiftId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const cashOperArray = cashOperData ? [cashOperData] : [];

  const currencyRender = getCurrencyRender();

  const tableColumns: ColumnsType<GetDataOperResponse> = [
    {
      title: t("finance.startShift"),
      dataIndex: "cashAtStart",
      key: "cashAtStart",
      render: currencyRender,
    },
    {
      title: t("finance.replenishment"),
      dataIndex: "replenishmentSum",
      key: "replenishmentSum",
      render: currencyRender,
    },
    {
      title: t("finance.expense"),
      dataIndex: "expenditureSum",
      key: "expenditureSum",
      render: currencyRender,
    },
    {
      title: t("finance.endShift"),
      dataIndex: "cashAtEnd",
      key: "cashAtEnd",
      render: currencyRender,
    },
  ];

  return (
    <>
      {status !== StatusWorkDayShiftReport.SENT && (
        <button
          className="px-2 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal mb-3"
          onClick={() => setIsModalOpen(true)}
        >
          {t("routes.add")}
        </button>
      )}

      <Table
        dataSource={cashOperArray.map((item, index) => ({
          ...item,
          key: `exchange-record-${index}`,
        }))}
        columns={tableColumns}
        pagination={false}
        size="small"
        loading={loadingCashOper || validatingCashOper}
        scroll={{ x: "500px" }}
        locale={{ emptyText: t("table.noData") }}
      />

      {shiftId && posId ? (
        <CreateCashOperationModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          shiftId={shiftId}
          posId={posId}
        />
      ) : null}
    </>
  );
};

export default ExchangeTab;
