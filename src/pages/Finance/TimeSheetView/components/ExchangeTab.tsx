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

// types
import type { ColumnsType } from "antd/es/table";

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
    mutate,
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

  const tableColumns: ColumnsType<any> = [
    {
      title: "На начало смены",
      dataIndex: "cashAtStart",
      key: "cashAtStart",
      render: (value: number) => value?.toFixed(2) || "0.00",
    },
    {
      title: "Пополнение",
      dataIndex: "replenishmentSum",
      key: "replenishmentSum",
      render: (value: number) => value?.toFixed(2) || "0.00",
    },
    {
      title: "Расход",
      dataIndex: "expenditureSum",
      key: "expenditureSum",
      render: (value: number) => value?.toFixed(2) || "0.00",
    },
    {
      title: "На конец смены",
      dataIndex: "cashAtEnd",
      key: "cashAtEnd",
      render: (value: number) => value?.toFixed(2) || "0.00",
    },
  ];

  return (
    <div className="w-full flex flex-col">
      <div className="w-[70%] h-fit rounded-2xl shadow-card px-3 sm:px-4 py-4 space-y-2 mt-5">
        {status !== "SENT" && (
          <button
            className="px-2 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal"
            onClick={() => setIsModalOpen(true)}
          >
            {t("routes.add")}
          </button>
        )}

        <Table
          dataSource={cashOperArray.map((item, index) => ({
            ...item,
            key: index,
          }))}
          columns={tableColumns}
          pagination={false}
          size="small"
          loading={loadingCashOper || validatingCashOper}
        />
      </div>

      {/* Modal */}
      {shiftId && posId ? (
        <CreateCashOperationModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            mutate();
          }}
          shiftId={shiftId}
          posId={posId}
        />
      ) : null}
    </div>
  );
};

export default ExchangeTab;
