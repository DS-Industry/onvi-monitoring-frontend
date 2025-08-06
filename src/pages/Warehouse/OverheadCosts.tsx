import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getAllStockLevels, getCategory, getWarehouses } from "@/services/api/warehouse";
import { getOrganization } from "@/services/api/organization";
import { Select, Table } from "antd";
import { useSearchParams } from "react-router-dom";
import { updateSearchParams } from "@/utils/searchParamsUtils";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";
import { ColumnsType } from "antd/es/table";

type StockLevel = {
    nomenclatureId: number;
    nomenclatureName: string;
    categoryName: string;
    measurement: string;
    sum?: number;
    inventoryItems: {
        warehouseName: string;
        quantity?: number;
    }[];
    [key: string]: unknown; // Allow dynamic keys for collection columns
}

const OverheadCosts: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    const [searchParams, setSearchParams] = useSearchParams();
    const orgId = searchParams.get("orgId") || null;
    const warehouseId = searchParams.get("warehouseId") || "*";
    const categoryId = searchParams.get("categoryId") || "*";

    const baseColumns = useMemo(() => [
        {
            title: "Номенклатура",
            dataIndex: "nomenclatureName",
            key: "nomenclatureName"
        },
        {
            title: "Категория",
            dataIndex: "categoryName",
            key: "categoryName"
        },
        {
            title: "Ед. измирения",
            dataIndex: "measurement",
            key: "measurement"
        },
        {
            title: "Итого по всем автомойкам",
            dataIndex: "sum",
            key: "sum"
        }
    ], []);

    const posId = searchParams.get("posId") || "*";
    const city = Number(searchParams.get("city")) || undefined;

    const { data: categoryData } = useSWR([`get-category`], () => getCategory(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: warehouseData } = useSWR([`get-warehouse`], () => getWarehouses({
        posId: posId,
        placementId: Number(city)
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: organizationData } = useSWR(
        [`get-organization`],
        () => getOrganization({ placementId: city }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
            onSuccess: (data) => {
                if (data && data.length > 0) {
                    updateSearchParams(searchParams, setSearchParams, {
                        orgId: data[0].id.toString()
                    });
                }
            }
        }
    );

    const categories: { name: string; value: number | string; }[] = categoryData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const categoryAllObj = {
        name: allCategoriesText,
        value: "*",
    };

    categories.unshift(categoryAllObj);

    const warehouses: { name: string; value: number | string; }[] = warehouseData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const warehousesAllObj = {
        name: allCategoriesText,
        value: "*",
    };

    warehouses.unshift(warehousesAllObj);

    const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const filterParams = useMemo(
        () => ({
            warehouseId: warehouseId || "*",
            categoryId: categoryId || "*",
            placementId: city || "*",
        }),
        [
            warehouseId,
            categoryId,
            city
        ]
    );

    const swrKey = useMemo(
        () =>
            `get-all-stock-levels-${filterParams.warehouseId}-${filterParams.placementId}-${filterParams.categoryId}-${orgId}`,
        [filterParams, orgId]
    );


    const { data: allStockLevels, isLoading: stocksLoading } = useSWR(
        orgId ? swrKey : null,
        () => getAllStockLevels(Number(orgId)!, filterParams),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true
        });

    const stockLevels = useMemo(() => allStockLevels || [], [allStockLevels]);

    const { columns, transformedData } = useMemo(() => {
        if (!stockLevels.length) return { columns: baseColumns, transformedData: stockLevels };

        const warehouseColumns: { title: string; dataIndex: string; key: string }[] = [];
        const transformedStockLevels = stockLevels.map((level) => {
            const transformedLevel: StockLevel = { ...level };
            level.inventoryItems.forEach((item, index) => {
                const columnKey = `warehouse_${index}`;
                const columnLabel = item.warehouseName || `Склад ${index + 1}`;

                if (!warehouseColumns.some((col) => col.key === columnKey)) {
                    warehouseColumns.push({ title: columnLabel, dataIndex: columnKey, key: columnKey });
                }

                transformedLevel[columnKey] = item.quantity ?? 0;
            });
            return transformedLevel;
        });

        return {
            columns: [...baseColumns, ...warehouseColumns] as ColumnsType<StockLevel>,
            transformedData: transformedStockLevels.map((item) => ({
                ...item,
                measurement: item.measurement !== null ? t(`tables.${item.measurement}`) : ""
            })),
        };
    }, [stockLevels, baseColumns, t]);

    const { checkedList, setCheckedList, options, visibleColumns } =
        useColumnSelector(columns, "pos-deposits-table-columns");

    return (
        <>
            <GeneralFilters count={transformedData.length} display={["city"]}>
                <div>
                    <div className="text-sm text-text02">{t("warehouse.organization")}</div>
                    <Select
                        className="w-full sm:w-80 h-10"
                        options={organizations.map((item) => ({ label: item.name, value: String(item.value) }))}
                        value={searchParams.get("orgId") || null}
                        onChange={(value) => {
                            updateSearchParams(searchParams, setSearchParams, {
                                orgId: value
                            });
                        }}
                    />
                </div>
                <div>
                    <div className="text-sm text-text02">{t("warehouse.category")}</div>
                    <Select
                        className="w-full sm:w-80 h-10"
                        options={categories.map((item) => ({ label: item.name, value: String(item.value) }))}
                        value={searchParams.get("categoryId") || "*"}
                        onChange={(value) => {
                            updateSearchParams(searchParams, setSearchParams, {
                                categoryId: value
                            });
                        }}
                    />
                </div>
                <div>
                    <div className="text-sm text-text02">{t("warehouse.ware")}</div>
                    <Select
                        className="w-full sm:w-80 h-10"
                        options={warehouses.map((item) => ({ label: item.name, value: String(item.value) }))}
                        value={searchParams.get("warehouseId") || "*"}
                        onChange={(value) => {
                            updateSearchParams(searchParams, setSearchParams, {
                                warehouseId: value
                            });
                        }}
                    />
                </div>
            </GeneralFilters>
            <div className="mt-8">
                <ColumnSelector
                    checkedList={checkedList}
                    options={options}
                    onChange={setCheckedList}
                />
                <Table
                    dataSource={transformedData.map((tra, index) => ({ ...tra, id: index }))}
                    columns={visibleColumns}
                    loading={stocksLoading}
                    pagination={false}
                />
            </div>
        </>
    )
}

export default OverheadCosts;