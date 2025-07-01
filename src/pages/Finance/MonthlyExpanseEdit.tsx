import ExpandableTable from "@/components/ui/Table/ExpandableTable";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useCity } from "@/hooks/useAuthStore";
import { getPoses } from "@/services/api/equipment";
import { getManagerPeriodById, returnManagerPaperPeriod, sendManagerPaperPeriod } from "@/services/api/finance";
import { Space, Button as AntDButton } from "antd";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";
import { CheckOutlined, UndoOutlined } from '@ant-design/icons';


enum ManagerPaperGroup {
    RENT = "RENT",
    REVENUE = "REVENUE",
    WAGES = "WAGES",
    INVESTMENT_DEVIDENTS = "INVESTMENT_DEVIDENTS",
    UTILITY_BILLS = "UTILITY_BILLS",
    TAXES = "TAXES",
    ACCOUNTABLE_FUNDS = "ACCOUNTABLE_FUNDS",
    REPRESENTATIVE_EXPENSES = "REPRESENTATIVE_EXPENSES",
    SALE_EQUIPMENT = "SALE_EQUIPMENT",
    MANUFACTURE = "MANUFACTURE",
    OTHER = "OTHER",
    SUPPLIES = "SUPPLIES",
    P_C = "P_C",
    WAREHOUSE = "WAREHOUSE",
    CONSTRUCTION = "CONSTRUCTION",
    MAINTENANCE_REPAIR = "MAINTENANCE_REPAIR",
    TRANSPORTATION_COSTS = "TRANSPORTATION_COSTS"
}

const MonthlyExpanseEdit: React.FC = () => {

    const location = useLocation();
    const { t } = useTranslation();

    const groups = useMemo(
        () => [
            { value: ManagerPaperGroup.RENT, name: t("finance.RENT") },
            { value: ManagerPaperGroup.REVENUE, name: t("finance.REVENUE") },
            { value: ManagerPaperGroup.WAGES, name: t("finance.WAGES") },
            { value: ManagerPaperGroup.INVESTMENT_DEVIDENTS, name: t("finance.INVESTMENT_DEVIDENTS") },
            { value: ManagerPaperGroup.UTILITY_BILLS, name: t("finance.UTILITY_BILLS") },
            { value: ManagerPaperGroup.TAXES, name: t("finance.TAXES") },
            { value: ManagerPaperGroup.ACCOUNTABLE_FUNDS, name: t("finance.ACCOUNTABLE_FUNDS") },
            { value: ManagerPaperGroup.REPRESENTATIVE_EXPENSES, name: t("finance.REPRESENTATIVE_EXPENSES") },
            { value: ManagerPaperGroup.SALE_EQUIPMENT, name: t("finance.SALE_EQUIPMENT") },
            { value: ManagerPaperGroup.MANUFACTURE, name: t("finance.MANUFACTURE") },
            { value: ManagerPaperGroup.OTHER, name: t("finance.OTHER") },
            { value: ManagerPaperGroup.SUPPLIES, name: t("finance.SUPPLIES") },
            { value: ManagerPaperGroup.P_C, name: t("finance.P_C") },
            { value: ManagerPaperGroup.WAREHOUSE, name: t("finance.WAREHOUSE") },
            { value: ManagerPaperGroup.CONSTRUCTION, name: t("finance.CONSTRUCTION") },
            { value: ManagerPaperGroup.MAINTENANCE_REPAIR, name: t("finance.MAINTENANCE_REPAIR") },
            { value: ManagerPaperGroup.TRANSPORTATION_COSTS, name: t("finance.TRANSPORTATION_COSTS") }
        ],
        [t]
    );

    const city = useCity();

    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = (posData?.map((item) => ({ name: item.name, value: item.id })) || []).sort((a, b) => a.name.localeCompare(b.name));

    const { data: managerPeriodData, isLoading: periodsLoading, isValidating: periodsValidating } = useSWR(location.state.ownerId ? [`get-manager-period`, location.state.ownerId] : null, () => getManagerPeriodById(location.state.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const groupedData = useMemo(() => {
        if (!managerPeriodData) return { items: [], titles: [] };

        const items = managerPeriodData.managerPaper?.map((item) => ({
            id: item.paperTypeId,
            deviceId: managerPeriodData.id, // 🔁 Must match the title's `deviceId`
            group: groups.find(group => group.value === item.group)?.name || item.group,
            posName: poses.find(pos => pos.value === item.posId)?.name || "Не указано",
            paperTypeId: item.paperTypeId,
            paperTypeName: item.paperTypeName,
            paperTypeType: t(`finance.${item.paperTypeType}`),
            eventDate: new Date(item.eventDate),
            sum: item.sum,
            imageProductReceipt: item.imageProductReceipt || undefined
        }));

        const titles = [{
            id: managerPeriodData.id,
            deviceId: managerPeriodData.id,
            title: managerPeriodData.status,
            status: t(`tables.${managerPeriodData.status}`),
            startPeriod: managerPeriodData.startPeriod,
            endPeriod: managerPeriodData.endPeriod,
            sumStartPeriod: managerPeriodData.sumStartPeriod,
            sumEndPeriod: managerPeriodData.sumEndPeriod,
            shortage: managerPeriodData.shortage
        }];

        return {
            items,
            titles
        };
    }, [groups, managerPeriodData, poses, t]);


    const expenseColumns = [
        {
            label: "Группа",
            key: "group",
            type: "string",
        },
        {
            label: "Автомойка/филиал",
            key: "posName",
            type: "string",
        },
        {
            label: "Статья",
            key: "paperTypeName",
            type: "string",
        },
        {
            label: "Тип статьи",
            key: "paperTypeType",
            type: "status",
        },
        {
            label: "Дата",
            key: "eventDate",
            type: "date"
        },
        {
            label: "Сумма",
            key: "sum",
            type: "currency"
        }
    ];

    const categoryColumns = [
        {
            label: "ID",
            key: "id",
            type: "number"
        },
        {
            label: "Статус",
            key: "status",
            type: "string"
        },
        {
            label: "Начало периода",
            key: "startPeriod",
            type: "date"
        },
        {
            label: "Конец периода",
            key: "endPeriod",
            type: "date"
        },
        {
            label: "ПериоСумма на начало периодад",
            key: "sumStartPeriod",
            type: "currency"
        },
        {
            label: "Сумма на конец периода",
            key: "sumEndPeriod",
            type: "currency"
        },
        {
            label: "Недостача",
            key: "shortage",
            type: "currency"
        }
    ];

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [isReturning, setIsReturning] = useState(false);

    const sendManagerPeriod = async () => {
        try {
            setIsLoading(true);
            const result = await mutate(
                [`send-manager-period`],
                () => sendManagerPaperPeriod(location.state.ownerId),
                false
            );

            if (result) {
                navigate(-1);
            }
        } catch (error) {
            console.error("Error deleting nomenclature:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const returnManagerPeriod = async () => {
        try {
            setIsReturning(true);
            const result = await mutate(
                [`return-manager-period`],
                () => returnManagerPaperPeriod(location.state.ownerId),
                false
            );

            if (result) {
                navigate(-1);
            }
        } catch (error) {
            console.error("Error deleting nomenclature:", error);
        } finally {
            setIsReturning(false);
        }
    };

    return (
        <div>
            <div className="mt-8">
                {periodsLoading || periodsValidating ? (
                    <TableSkeleton columnCount={categoryColumns.length} />
                )
                    :
                    <div className="space-y-4">
                        <Space>
                            {location.state.status === "SAVE" && <AntDButton
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={sendManagerPeriod}
                                loading={isLoading}
                            >
                                {t("finance.send")}
                            </AntDButton>}
                            {location.state.status === "SENT" && <AntDButton
                                type="primary"
                                icon={<UndoOutlined />}
                                onClick={returnManagerPeriod}
                                loading={isReturning}
                            >
                                {t("finance.returns")}
                            </AntDButton>}
                        </Space>
                        <ExpandableTable
                            data={groupedData.items}
                            columns={expenseColumns}
                            titleColumns={categoryColumns}
                            titleData={groupedData.titles}
                        />
                    </div>
                }
            </div>
        </div>
    )
}

export default MonthlyExpanseEdit;