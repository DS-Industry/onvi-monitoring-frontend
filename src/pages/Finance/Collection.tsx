import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import NoCollection from "@/assets/NoCollection.png";
import FilterMonitoring from "@/components/ui/Filter/FilterMonitoring";
import useSWR from "swr";
import { getPoses } from "@/services/api/equipment";
import { useButtonCreate } from "@/components/context/useContext";
import { useLocation, useNavigate } from "react-router-dom";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate, useCurrentPage, usePageNumber, useSetCurrentPage, useSetPageSize } from "@/hooks/useAuthStore";
import { getCollections } from "@/services/api/finance";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import OverflowTable from "@/components/ui/Table/OverflowTable";

interface FilterCollection {
    dateStart: Date;
    dateEnd: Date;
    posId: number;
    page?: number;
    size?: number;
}

const Collection: React.FC = () => {
    const { t } = useTranslation();
    const { buttonOn } = useButtonCreate();
    const navigate = useNavigate();

    const posType = usePosType();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const currentPage = useCurrentPage();
    const pageSize = usePageNumber();
    const location = useLocation();

    const setPosType = useSetPosType();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const setCurrentPage = useSetCurrentPage();
    const setTotalCount = useSetPageSize();
    const [isTableLoading, setIsTableLoading] = useState(false);

    const initialFilter = {
        dateStart: startDate,
        dateEnd: endDate,
        page: currentPage,
        size: pageSize,
        posId: posType || 1,
    };

    useEffect(() => {
        setCurrentPage(1);
        setIsDataFilter((prevFilter) => ({
            ...prevFilter,
            page: 1
        }));
    }, [location, setCurrentPage]);

    const [dataFilter, setIsDataFilter] = useState<FilterCollection>(initialFilter);

    const { data: filter, error: filterError, isLoading: filterIsLoading, mutate: filterMutate } = useSWR([`get-collections-${dataFilter.posId ? dataFilter.posId : 66}`], () => getCollections(
        dataFilter.posId ? dataFilter.posId : 66, {
        dateStart: new Date(dataFilter.dateStart),
        dateEnd: new Date(dataFilter.dateEnd),
        page: dataFilter.page,
        size: dataFilter.size
    }));

    const handleDataFilter = (newFilterData: Partial<FilterCollection>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);

        if (newFilterData.posId) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(new Date(newFilterData.dateStart));
        if (newFilterData.dateEnd) setEndDate(new Date(newFilterData.dateEnd));
    };

    useEffect(() => {
        console.log(JSON.stringify(filterError, null, 2));
    }, [filterError]);

    useEffect(() => {
        filterMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, filterMutate]);

    useEffect(() => {
        if (!filterIsLoading && filter?.totalCount)
            setTotalCount(filter?.totalCount)
    }, [filter?.totalCount, filterIsLoading, setTotalCount]);

    const { data: posData } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    useEffect(() => {
        if (buttonOn)
            navigate("/finance/collection/creation");
    }, [buttonOn, navigate]);

    const baseColumns = useMemo(() => [
        {
            label: "№ Документа",
            key: "id"
        },
        {
            label: "Мойка/Филиал",
            key: "posName"
        },
        {
            label: "Период",
            key: "period",
            type: "period"
        },
        {
            label: "Инкассация",
            key: "sumFact"
        },
        {
            label: "Сумма по картам",
            key: "sumCard"
        },
        {
            label: "Безналичная оплата",
            key: "sumVirtual"
        },
        {
            label: "Прибыль",
            key: "profit"
        },
        {
            label: "Статус",
            key: "status"
        },
        {
            label: "Недостача",
            key: "shortage"
        }
    ], []);

    const collectionsData = useMemo(() => filter?.cashCollectionsData || [], [filter]);

    const { columns, transformedData } = useMemo(() => {
        if (!collectionsData.length) return { columns: baseColumns, transformedData: collectionsData };

        const warehouseColumns: { label: string; key: string }[] = [];
        const transformedStockLevels = collectionsData.map((level) => {
            const transformedLevel = { ...level };
            level.cashCollectionDeviceType.forEach((item, index) => {
                const columnKey = `warehouse_${index}`;
                const columnLabel = item.typeName || `Склад ${index + 1}`;

                if (!warehouseColumns.some((col) => col.key === columnKey)) {
                    warehouseColumns.push({ label: columnLabel, key: columnKey });
                }

                transformedLevel[columnKey] = item.typeShortage ?? 0;
            });
            return transformedLevel;
        });

        return {
            columns: [...baseColumns, ...warehouseColumns],
            transformedData: transformedStockLevels.map((item) => ({
                ...item,
                posName: poses.find((pos) => pos.value === item.posId)?.name || "",
                status: t(`tables.${item.status}`)
            })),
        };
    }, [collectionsData, baseColumns]);


    return (
        <div>
            <FilterMonitoring
                count={collectionsData.length}
                posesSelect={poses}
                hideSearch={true}
                hideCity={true}
                handleDataFilter={handleDataFilter}
            />
            {isTableLoading || filterIsLoading ? (<TableSkeleton columnCount={columns.length} />)
                :
                transformedData.length > 0 ? (
                    <div className="mt-8">
                        <OverflowTable
                            tableData={transformedData}
                            columns={columns}
                            isDisplayEdit={true}
                            showPagination={true}
                            nameUrl="/finance/collection/creation"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center">
                        <NoDataUI
                            title={t("finance.details")}
                            description={t("finance.at")}
                        >
                            <img src={NoCollection} className="mx-auto" />
                        </NoDataUI>
                    </div>
                )}
        </div>
    )
}

export default Collection;