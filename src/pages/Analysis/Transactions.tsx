import { useFilterOn } from "@/components/context/useContext";
import Filter from "@/components/ui/Filter/Filter";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useCurrentPage, usePageNumber, usePageSize, useSetCurrentPage, useSetPageSize } from "@/hooks/useAuthStore";
import { getAllReports, getTransactions } from "@/services/api/reports";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import Icon from 'feather-icons-react';

const Transactions: React.FC = () => {
    const { t } = useTranslation();
    const pageNumber = usePageNumber();
    const currentPage = useCurrentPage();
    const curr = useCurrentPage();
    const setCurr = useSetCurrentPage();
    const rowsPerPage = usePageNumber();
    const totalCount = usePageSize();
    const setTotalCount = useSetPageSize();
    const totalPages = Math.ceil(totalCount / rowsPerPage);
    const { filterOn, setFilterOn } = useFilterOn();
    const [tableLoading, setTableLoading] = useState(false);

    const { data: filter } = useSWR(["get-all-report"], () => getAllReports({}));

    const allReports = useMemo(() => {
        return filter?.reports?.map((item) => ({
            name: item.name,
            value: item.id
        })) || [];
    }, [filter?.reports]); 
    
    const { data: transactionData, mutate: mutateTransactions, isLoading: loadingTransactions } = useSWR([`get-transaction`], () => getTransactions({
        page: currentPage,
        size: pageNumber
    }), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true
    });

    useEffect(() => {
        setTableLoading(true);
        mutateTransactions().then(() => setTableLoading(false));
    }, [filterOn, mutateTransactions]);

    useEffect(() => {
        if (!loadingTransactions && transactionData?.count)
            setTotalCount(transactionData?.count)
    }, [transactionData?.count, loadingTransactions, setTotalCount]);

    const transactions = useMemo(() => {
        return (transactionData?.transactions.map((item) => ({
            ...item,
            status: t(`analysis.${item.status}`),
            reportTemplateId: allReports.find((rep) => rep.value === item.reportTemplateId)?.name || ""
        })) || [])
            .sort((a, b) => new Date(b.startTemplateAt).getTime() - new Date(a.startTemplateAt).getTime());
    }, [allReports, t, transactionData?.transactions]);

    const generatePaginationRange = () => {
        const range: (number | string)[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) range.push(i);
        } else {
            range.push(1);

            if (curr > 3) range.push("...");

            const start = Math.max(2, curr - 1);
            const end = Math.min(totalPages - 1, curr + 1);
            for (let i = start; i <= end; i++) range.push(i);

            if (curr < totalPages - 2) range.push("...");

            range.push(totalPages);
        }

        return range;
    };

    const handlePageClick = (page: number | string) => {
        if (typeof page === "number") {
            setFilterOn(!filterOn);
            setCurr(page);
        }
    };

    const handleDownload = (reportKey: string, id: number) => {
        const downloadUrl = `https://storage.yandexcloud.net/onvi-business/report/${id}/${reportKey}`; // Adjust API path
        window.open(downloadUrl, "_blank");
    }

    const columnsTransactions = [
        {
            label: "Отчет",
            key: "reportTemplateId"
        },
        {
            label: "Статус",
            key: "status"
        },
        {
            label: "Дата начала создания",
            key: "startTemplateAt",
            type: "date"
        },
        {
            label: "Дата окончания создания",
            key: "endTemplateAt",
            type: "date"
        },
        {
            label: "",
            key: "Download",
            render: (row: { status: string; reportKey: string; userId: number; }) => (
                row.status === t("analysis.DONE") && (<div>
                    <button onClick={() => handleDownload(row.reportKey, row.userId)} className="flex space-x-2 items-center text-primary02">
                        <div>{t("tables.Download")}</div>
                        <Icon icon="download" className="w-5 h-5" />
                    </button>
                </div>)
            ),
        }
    ]

    return (
        <div>
            <Filter count={transactions.length} hideSearch={true} hideCity={true} hideDateTime={true} children={undefined}>
            </Filter>
            <div className="mt-5">
                {loadingTransactions || tableLoading ?
                    <TableSkeleton columnCount={columnsTransactions.length} />
                    : transactions.length > 0 ?
                        <OverflowTable
                            tableData={transactions}
                            columns={columnsTransactions}
                        /> : (
                            <div className="flex flex-col items-center justify-center mt-40 text-text02">
                                <div>{t("analysis.there")}</div>
                                <div>{t("analysis.you")}</div>
                            </div>
                        )}
            </div>
            <div className="mt-4 flex gap-2">
                <button
                    onClick={() => {
                        const newPage = Math.max(1, curr - 1);
                        setFilterOn(!filterOn);
                        setCurr(newPage);
                    }}
                    disabled={curr === 1}
                    className={`px-2 py-1 ${curr === 1 ? "text-gray-400 cursor-not-allowed" : "text-text01"}`}
                >
                    <Icon icon="chevron-left" />
                </button>
                {generatePaginationRange().map((page, index) =>
                    page === "..." ? (
                        <span key={index} className="px-2 py-1 text-gray-400">...</span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => handlePageClick(page)}
                            className={`px-4 py-2 font-semibold ${curr === page ? "bg-white text-primary02 rounded-lg border border-primary02" : "text-text01"}`}
                        >
                            {page}
                        </button>
                    )
                )}
                <button
                    onClick={() => {
                        setFilterOn(!filterOn);
                        setCurr(Math.min(totalPages, curr + 1));
                    }}
                    disabled={curr === totalPages}
                    className={`px-2 py-1 ${curr === totalPages ? "text-gray-400 cursor-not-allowed" : "text-text01"}`}
                >
                    <Icon icon="chevron-right" />
                </button>
            </div>
        </div>
    )
}

export default Transactions;