import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ClockImage from "@icons/ClockImage.svg?react";
import Icon from 'feather-icons-react';
import { useLocation } from "react-router-dom";
import useSWR from "swr";
import { getCashOperById, getCashOperCleanById, getCashOperRefundById, getCashOperSuspiciousById, getDayShiftById } from "@/services/api/finance";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { columnsDataCashOper, columnsDataCashOperCleaning, columnsDataCashOperRefund, columnsDataCashOperSuspiciously } from "@/utils/OverFlowTableData";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";

const TimesheetView: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('change');
    const location = useLocation();

    const tabs = [
        { id: 'change', name: t("finance.change") },
        { id: 'exchange', name: t("finance.exchange") },
        { id: 'returns', name: t("finance.returns") },
        { id: 'cleaning', name: t("routes.cleaning") },
        { id: 'susp', name: t("finance.susp") }
    ];

    const { data: dayShiftData } = useSWR(location.state?.ownerId ? [`get-shift-data`] : null, () => getDayShiftById(location.state?.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: cashOperData, isLoading: loadingCashOper } = useSWR(location.state?.ownerId ? [`get-cash-oper-data`] : null, () => getCashOperById(location.state?.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: cashOperReturnData, isLoading: loadingCashOperReturn } = useSWR(location.state?.ownerId ? [`get-cash-oper-return-data`] : null, () => getCashOperRefundById(location.state?.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: cashOperCleanData, isLoading: loadingCashOperClean } = useSWR(location.state?.ownerId ? [`get-cash-oper-clean-data`] : null, () => getCashOperCleanById(location.state?.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: cashOperSuspData, isLoading: loadingCashOperSusp } = useSWR(location.state?.ownerId ? [`get-cash-oper-susp-data`] : null, () => getCashOperSuspiciousById(location.state?.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const cashOperArray = [cashOperData];

    const cashOperReturnArray = cashOperReturnData?.map((item) => item.props) || [];

    const cashOperCleanArray = [];

    const cashOperSubsArray = cashOperSuspData || [];

    return (
        <div className="space-y-4">
            <div className="flex space-x-4">
                <div className="w-[400px] h-[148px] rounded-2xl shadow-card p-4 space-y-2">
                    <div className="flex justify-between">
                        <div className="space-y-2">
                            <div className="text-text01 font-semibold">{t("finance.shiftOver")}</div>
                            <div>
                                <div className="text-sm text-text02 font-semibold">{t("finance.curr")}</div>
                                <div className="text-text01">{"9:00 AM - 5:00 PM"}</div>
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-[#dbeafe] flex items-center justify-center">
                            <ClockImage />
                        </div>
                    </div>
                    <div className="w-[373px] h-9 bg-[#f0fdf4] rounded flex space-x-2 items-center text-sm px-2 text-[#16a34a]">
                        <Icon icon="truck" className="w-[22px] h-[18px]" />
                        <div>{dayShiftData?.status || ""}</div>
                        <div className="font-bold">{t("tables.SENT")}</div>
                    </div>
                </div>
                <div className="w-72 h-[148px] rounded-2xl shadow-card p-4">
                    <div className="flex justify-between">
                        <div className="text-text01 font-semibold">{t("finance.grade")}</div>
                        <div className="w-16 h-16 rounded-full bg-[#fef9c3] flex items-center justify-center">
                            <Icon icon="star" className="text-[#ff9066] w-8 h-8" />
                        </div>
                    </div>
                    <div className="w-[182px] h-14 bg-[#f0fdf4] rounded-lg flex items-center justify-center text-sm px-2 text-[#16a34a]">
                        <div className="font-extrabold">{t(`finance.${dayShiftData?.estimation}`)}</div>
                    </div>
                </div>
            </div>
            <div className="flex space-x-4 border-b mb-6 w-full">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`pb-2 w-60 ${activeTab === tab.id ? 'text-text01 border-b-4 border-primary02' : 'text-text02'}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>
            <div className="flex space-x-10">
                {tabs.find((tab) => tab.id === activeTab)?.name === t("finance.change") && (
                    <div className="space-y-3">
                        <div className="flex space-x-3">
                            {/* <div className="h-28 w-64 px-5 py-4 rounded-lg bg-background05 space-y-3">
                                <div className="text-text01 font-bold text-3xl">{dayShiftData?.prize} ₽</div>
                                <div className="text-text02/70">{t("finance.salary")}</div>
                            </div> */}
                            <div className="h-28 w-64 px-5 py-4 rounded-lg bg-background05 space-y-3">
                                <div className="text-errorFill font-bold text-3xl">-{dayShiftData?.fine} ₽</div>
                                <div className="text-text02/70">{t("finance.fine")}</div>
                            </div>
                            <div className="h-24 w-[440px] px-5 py-4 rounded-lg bg-background05 space-y-3">
                                <div className="text-text01">{dayShiftData?.comment || "-"}</div>
                                <div className="text-text02/70">{t("equipment.comment")}</div>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <div className="h-28 w-64 px-5 py-4 rounded-lg bg-background05 space-y-3">
                                <div className="text-text01 font-bold text-3xl">{dayShiftData?.timeWorkedOut || "-"}</div>
                                <div className="text-text02/70">{t("finance.time")}</div>
                            </div>
                            <div className="h-28 w-64 px-5 py-4 rounded-lg bg-background05 space-y-3">
                                <div className="text-successFill font-bold text-3xl">+{dayShiftData?.prize} ₽</div>
                                <div className="text-text02/70">{t("finance.prize")}</div>
                            </div>
                        </div>
                    </div>
                )}
                {tabs.find((tab) => tab.id === activeTab)?.name === t("finance.exchange") && (
                    <div>

                        <div className="w-[1003px] h-44 rounded-2xl shadow-card p-4 space-y-2 mt-5">
                            <button className="px-1.5 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal">
                                {t("routes.add")}
                            </button>
                            {loadingCashOper ?
                                <TableSkeleton columnCount={columnsDataCashOper.length} />
                                : cashOperArray.length > 0 ?
                                    <OverflowTable
                                        tableData={cashOperArray}
                                        columns={columnsDataCashOper}
                                    /> : <></>
                            }
                        </div>
                    </div>
                )}
                {tabs.find((tab) => tab.id === activeTab)?.name === t("finance.returns") && (
                    <div className="w-[1003px] h-44 rounded-2xl shadow-card p-4 mt-5">
                        {loadingCashOperReturn ?
                            <TableSkeleton columnCount={columnsDataCashOperRefund.length} />
                            : cashOperReturnArray.length > 0 ?
                                <OverflowTable
                                    tableData={cashOperReturnArray}
                                    columns={columnsDataCashOperRefund}
                                /> : <></>
                        }
                    </div>
                )}
                {tabs.find((tab) => tab.id === activeTab)?.name === t("routes.cleaning") && (
                    <div className="w-[1003px] h-44 rounded-2xl shadow-card p-4 mt-5">
                        {loadingCashOperClean ?
                            <TableSkeleton columnCount={columnsDataCashOperCleaning.length} />
                            : cashOperCleanArray.length > 0 ?
                                <OverflowTable
                                    tableData={[]}
                                    columns={columnsDataCashOperCleaning}
                                /> : <></>
                        }
                    </div>
                )}
                {tabs.find((tab) => tab.id === activeTab)?.name === t("finance.susp") && (
                    <div className="w-[1003px] h-44 rounded-2xl shadow-card p-4 mt-5">
                        {loadingCashOperSusp ?
                            <TableSkeleton columnCount={columnsDataCashOperSuspiciously.length} />
                            : cashOperSubsArray.length > 0 ?
                                <OverflowTable
                                    tableData={cashOperSubsArray}
                                    columns={columnsDataCashOperSuspiciously}
                                /> : <></>
                        }
                    </div>
                )}
            </div>
        </div>
    )
}

export default TimesheetView;