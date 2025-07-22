import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getPoses } from "@/services/api/equipment";
import { useButtonCreate } from "@/components/context/useContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getCollections } from "@/services/api/finance";
import dayjs from "dayjs";
import {
    ALL_PAGE_SIZES,
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
} from "@/utils/constants";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";
import { Table } from "antd";
import { updateSearchParams } from "@/utils/updateSearchParams";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";
import { ColumnsType } from "antd/es/table";
import { getCurrencyRender, getFormatPeriodType, getStatusTagRender } from "@/utils/tableUnits";

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

    const today = dayjs().toDate();
    const formattedDate = today.toISOString().slice(0, 10);

    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = Number(searchParams.get("page") || DEFAULT_PAGE);
    const pageSize = Number(searchParams.get("size") || DEFAULT_PAGE_SIZE);
    const posId = searchParams.get("posId") || "*";
    const dateStart =
        searchParams.get("dateStart") ?? new Date(`${formattedDate} 00:00`);

    const dateEnd =
        searchParams.get("dateEnd") ?? new Date(`${formattedDate} 23:59`);

    const cityParam = Number(searchParams.get("city")) || "*";

    const formatPeriodType = getFormatPeriodType();
    const renderCurrency = getCurrencyRender();
    const renderStatus = getStatusTagRender(t);

    const filterParams = useMemo(
        () => ({
            dateStart: new Date(dateStart || `${formattedDate} 00:00`),
            dateEnd: new Date(dateEnd?.toString() || `${formattedDate} 23:59`),
            posId: posId || "*",
            page: currentPage,
            size: pageSize,
            placementId: cityParam
        }),
        [
            dateStart,
            dateEnd,
            posId,
            currentPage,
            pageSize,
            formattedDate,
            cityParam
        ]
    );


    // Create a stable key for SWR that includes all filter parameters
    const swrKey = useMemo(() =>
        `get-collections-${filterParams.posId}-${filterParams.dateStart}-${filterParams.dateEnd}-${filterParams.page}-${filterParams.size}-${filterParams.placementId}`,
        [filterParams]
    );

    const [totalCollectionsCount, setTotalCollectionsCount] = useState(0);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const { data: filter, isLoading: filterIsLoading } = useSWR(
        swrKey,
        () => getCollections(filterParams)
            .then((data) => {
                setTotalCollectionsCount(data.totalCount || 0);
                const sorted = [...(data.cashCollectionsData ?? [])].sort((a, b) => a.id - b.id);

                return sorted;
            }).finally(() => {
                setIsInitialLoading(false);
            }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true
        }
    );

    const { data: posData, isLoading: loadingPos, isValidating: validatingPos } = useSWR(
        [`get-pos`, cityParam],
        () => getPoses({ placementId: cityParam }),
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
            title: "№ Документа",
            dataIndex: "id",
            key: "id"
        },
        {
            title: "Мойка/Филиал",
            dataIndex: "posName",
            key: "posName",
            render: (text: string, record: { id: number; status: string; }) => {
                return (
                    <Link
                        to={{
                            pathname: "/finance/collection/creation",
                            search: `?id=${record.id}&status=${record.status}`
                        }}
                        className="text-blue-500 hover:text-blue-700 font-semibold"
                    >
                        {text}
                    </Link>
                );
            },
        },
        {
            title: "Период",
            dataIndex: "period",
            key: "period",
            render: formatPeriodType
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
            render: renderStatus
        },
        {
            title: "Инкассация",
            dataIndex: "sumFact",
            key: "sumFact",
            render: renderCurrency
        },
        {
            title: "Сумма по картам",
            dataIndex: "sumCard",
            key: "sumCard",
            render: renderCurrency
        },
        {
            title: "Безналичная оплата",
            dataIndex: "sumVirtual",
            key: "sumVirtual",
            render: renderCurrency
        },
        {
            title: "Прибыль",
            dataIndex: "profit",
            key: "profit",
            render: renderCurrency
        },
        {
            title: "Недостача",
            dataIndex: "shortage",
            key: "shortage",
            render: renderCurrency
        }
    ], []);

    const collectionsData = filter || [];

    const { columns, transformedData } = useMemo(() => {
        if (!collectionsData.length) return { columns: baseColumns, transformedData: collectionsData };

        const collectionColumns: { title: string; dataIndex: string; key: string; }[] = [];
        const transformedStockLevels = collectionsData.map((level) => {
            const transformedLevel: CashCollectionLevel = { ...level };
            level.cashCollectionDeviceType.forEach((item, index) => {
                const columnKey = `collection_${index}`;
                const columnLabel = item.typeName || `Склад ${index + 1}`;

                if (!collectionColumns.some((col) => col.key === columnKey)) {
                    collectionColumns.push({ title: columnLabel, key: columnKey, dataIndex: columnKey });
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
            columns: [...baseColumns, ...collectionColumns] as ColumnsType<CashCollectionLevel>,
            transformedData: sortedData
        };
    }, [collectionsData, baseColumns, poses, t]);


    const { checkedList, setCheckedList, options, visibleColumns } =
        useColumnSelector(columns, "collections-table-columns");

    return (
        <div>
            <GeneralFilters
                count={collectionsData.length}
                hideSearch={true}
                poses={poses}
                loadingPos={loadingPos || validatingPos}
            />

            <div className="mt-8">
                <ColumnSelector
                    checkedList={checkedList}
                    options={options}
                    onChange={setCheckedList}
                />
                <Table
                    dataSource={transformedData}
                    columns={visibleColumns}
                    loading={filterIsLoading || isInitialLoading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalCollectionsCount,
                        pageSizeOptions: ALL_PAGE_SIZES,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} items`,
                        onChange: (page, size) => {
                            updateSearchParams(searchParams, setSearchParams, {
                                page: String(page),
                                size: String(size),
                            });
                        },
                    }}
                />
            </div>
        </div>
    )
}

export default Collection;