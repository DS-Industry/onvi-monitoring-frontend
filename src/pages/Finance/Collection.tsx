import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import NoCollection from "@/assets/NoCollection.png";
import FilterMonitoring from "@/components/ui/Filter/FilterMonitoring";
import useSWR from "swr";
import { getPoses } from "@/services/api/equipment";
import { useButtonCreate } from "@/components/context/useContext";
import { useLocation, useNavigate } from "react-router-dom";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate, useCurrentPage, usePageNumber, useSetCurrentPage, useSetPageSize, useCity } from "@/hooks/useAuthStore";
import { getCollections } from "@/services/api/finance";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import DynamicTable from "@/components/ui/Table/DynamicTable";

interface FilterCollection {
    dateStart: Date;
    dateEnd: Date;
    posId: number | string;
    page?: number;
    size?: number;
}

type CashCollectionLevel = {
    id: number;
    posId: number;
    period: string;
    sumFact: number;
    sumCard: number;
    sumVirtual: number;
    profit: number;
    status: string;
    shortage: number;
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
    cashCollectionDeviceType: {
        typeName: string;
        typeShortage: number;
    }[];
    [key: string]: unknown; // Allow dynamic keys for collection columns
}

const Collection: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
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
    const city = useCity();

    const initialFilter = useMemo(() => ({
        dateStart: startDate,
        dateEnd: endDate,
        page: currentPage,
        size: pageSize,
        posId: posType || 1,
    }), [startDate, endDate, currentPage, pageSize, posType]);

    const [dataFilter, setIsDataFilter] = useState<FilterCollection>(initialFilter);

    // Create a stable key for SWR that includes all filter parameters
    const swrKey = useMemo(() =>
        `get-collections-${dataFilter.posId}-${dataFilter.dateStart}-${dataFilter.dateEnd}-${dataFilter.page}-${dataFilter.size}`,
        [dataFilter.posId, dataFilter.dateStart, dataFilter.dateEnd, dataFilter.page, dataFilter.size]
    );

    const { data: filter, isLoading: filterIsLoading } = useSWR(
        swrKey,
        () => getCollections({
            dateStart: new Date(dataFilter.dateStart),
            dateEnd: new Date(dataFilter.dateEnd),
            posId: dataFilter.posId,
            placementId: city,
            page: dataFilter.page,
            size: dataFilter.size
        }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true
        }
    );

    // Reset page when location changes
    useEffect(() => {
        setCurrentPage(1);
        setIsDataFilter((prevFilter) => ({
            ...prevFilter,
            page: 1
        }));
    }, [location, setCurrentPage]);

    // Debounced filter handler to prevent multiple rapid API calls
    const handleDataFilter = useCallback((newFilterData: Partial<FilterCollection>) => {

        // Update global state
        if (newFilterData.posId !== undefined) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(new Date(newFilterData.dateStart));
        if (newFilterData.dateEnd) setEndDate(new Date(newFilterData.dateEnd));

        // Update local filter state (this will trigger SWR automatically)
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
    }, [setPosType, setStartDate, setEndDate]);

    // Update total count when data changes
    useEffect(() => {
        if (!filterIsLoading && filter?.totalCount) {
            setTotalCount(filter.totalCount);
        }
    }, [filter?.totalCount, filterIsLoading, setTotalCount]);

    const { data: posData, isLoading: loadingPos, isValidating: validatingPos } = useSWR(
        [`get-pos`, city],
        () => getPoses({ placementId: city }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true
        }
    );

    const poses: { name: string; value: number | string; }[] = useMemo(() => {
        const mappedPoses = posData?.map((item) => ({ name: item.name, value: item.id })) || [];
        const posesAllObj = {
            name: allCategoriesText,
            value: "*"
        };
        return [posesAllObj, ...mappedPoses];
    }, [posData, allCategoriesText]);

    useEffect(() => {
        if (buttonOn) {
            navigate("/finance/collection/creation");
        }
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
            label: "Статус",
            key: "status"
        },
        {
            label: "Инкассация",
            key: "sumFact",
            type: "currency"
        },
        {
            label: "Сумма по картам",
            key: "sumCard",
            type: "currency"
        },
        {
            label: "Безналичная оплата",
            key: "sumVirtual",
            type: "currency"
        },
        {
            label: "Прибыль",
            key: "profit",
            type: "currency"
        },
        {
            label: "Недостача",
            key: "shortage",
            type: "currency"
        }
    ], []);

    const collectionsData = useMemo(() => filter?.cashCollectionsData || [], [filter]);

    const { columns, transformedData } = useMemo(() => {
        if (!collectionsData.length) return { columns: baseColumns, transformedData: collectionsData };

        const collectionColumns: { label: string; key: string; type: string }[] = [];
        const transformedStockLevels = collectionsData.map((level) => {
            const transformedLevel: CashCollectionLevel = { ...level };
            level.cashCollectionDeviceType.forEach((item, index) => {
                const columnKey = `collection_${index}`;
                const columnLabel = item.typeName || `Склад ${index + 1}`;

                if (!collectionColumns.some((col) => col.key === columnKey)) {
                    collectionColumns.push({ label: columnLabel, key: columnKey, type: "currency" });
                }

                transformedLevel[columnKey] = item.typeShortage ?? 0;
            });
            return transformedLevel;
        });

        const sortedData = transformedStockLevels
            .map((item) => ({
                ...item,
                posName: poses.find((pos) => pos.value === item.posId)?.name || "",
                status: t(`tables.${item.status}`),
                parsedPeriod: new Date(item.period.split("-")[0]) // Extract start date
            }))
            .sort((a, b) => b.parsedPeriod.getTime() - a.parsedPeriod.getTime()); // Sort by most recent date

        return {
            columns: [...baseColumns, ...collectionColumns],
            transformedData: sortedData
        };
    }, [collectionsData, baseColumns, poses, t]);

    return (
        <div>
            <FilterMonitoring
                count={collectionsData.length}
                posesSelect={poses}
                hideSearch={true}
                handleDataFilter={handleDataFilter}
                loadingPos={loadingPos || validatingPos}
            />
            {filterIsLoading ? (
                <TableSkeleton columnCount={columns.length} />
            ) : (
                transformedData.length > 0 ? (
                    <div className="mt-8">
                        <DynamicTable
                            data={transformedData}
                            columns={columns}
                            isDisplayEdit={true}
                            showPagination={true}
                            navigableFields={[{ key: "posName", getPath: () => "/finance/collection/creation" }]}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center">
                        <NoDataUI
                            title={t("finance.details")}
                            description={t("finance.at")}
                        >
                            <img src={NoCollection} className="mx-auto" loading="lazy" alt="No Collection" />
                        </NoDataUI>
                    </div>
                )
            )}
        </div>
    )
}

export default Collection;