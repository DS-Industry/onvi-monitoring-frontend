import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useMemo, useState } from "react";
import InventoryEmpty from "@/assets/NoInventory.png"
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getAllStockLevels, getCategory, getWarehouses } from "@/services/api/warehouse";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import Filter from "@/components/ui/Filter/Filter";
import { useFilterOn } from "@/components/context/useContext";
import { getOrganization } from "@/services/api/organization";
import { useCity, usePosType, useSetCity, useSetWareHouseId, useWareHouseId } from "@/hooks/useAuthStore";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import { Select } from "antd";

type StockParams = {
    categoryId: number | string;
    warehouseId: number | string;
    placementId: number | string;
}

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
    const [orgId, setOrgId] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<string | number>("*");
    const warehouseId = useWareHouseId();
    const setWarehouseId = useSetWareHouseId();
    const [isTableLoading, setIsTableLoading] = useState(false);
    const { filterOn } = useFilterOn();

    const baseColumns = useMemo(() => [
        {
            label: "Номенклатура",
            key: "nomenclatureName"
        },
        {
            label: "Категория",
            key: "categoryName"
        },
        {
            label: "Ед. измирения",
            key: "measurement"
        },
        {
            label: "Итого по всем автомойкам",
            key: "sum"
        }
    ], []);

    const posType = usePosType();
    const city = useCity();
    const setCity = useSetCity();

    const { data: categoryData } = useSWR([`get-category`], () => getCategory(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: warehouseData } = useSWR([`get-warehouse`], () => getWarehouses({
        posId: posType,
        placementId: city
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
                    setOrgId(data[0].id);                    
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
    
    const { data: allStockLevels, isLoading: stocksLoading, mutate: stocksMutating } = useSWR(
        orgId ? [`get-all-stock-levels`, orgId]: null,
        () => getAllStockLevels(orgId!, {
            warehouseId: dataFilter.warehouseId,
            categoryId: dataFilter.categoryId,
            placementId: dataFilter.placementId
        }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true
        });

    const stockLevels = useMemo(() => allStockLevels || [], [allStockLevels]);

    const { columns, transformedData } = useMemo(() => {
        if (!stockLevels.length) return { columns: baseColumns, transformedData: stockLevels };

        const warehouseColumns: { label: string; key: string }[] = [];
        const transformedStockLevels = stockLevels.map((level) => {
            const transformedLevel: StockLevel = { ...level };
            level.inventoryItems.forEach((item, index) => {
                const columnKey = `warehouse_${index}`;
                const columnLabel = item.warehouseName || `Склад ${index + 1}`;

                if (!warehouseColumns.some((col) => col.key === columnKey)) {
                    warehouseColumns.push({ label: columnLabel, key: columnKey });
                }

                transformedLevel[columnKey] = item.quantity ?? 0;
            });
            return transformedLevel;
        });

        return {
            columns: [...baseColumns, ...warehouseColumns],
            transformedData: transformedStockLevels.map((item) => ({
                ...item,
                measurement: item.measurement !== null ? t(`tables.${item.measurement}`) : ""
            })),
        };
    }, [stockLevels, baseColumns, t]);

    const initialFilter = {
        categoryId: categoryId,
        warehouseId: warehouseId,
        placementId: city
    }

    const [dataFilter, setDataFilter] = useState<StockParams>(initialFilter);

    const handleDataFilter = (newFilterData: Partial<StockParams>) => {
        setDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);
        if (newFilterData.warehouseId) setWarehouseId(newFilterData.warehouseId);
        if (newFilterData.categoryId) setCategoryId(newFilterData.categoryId);
        if (newFilterData.placementId) setCity(newFilterData.placementId);
    }

    useEffect(() => {
        handleDataFilter({
            categoryId: categoryId,
            warehouseId: warehouseId,
            placementId: city
        })
    }, [filterOn])

    useEffect(() => {
        stocksMutating().then(() => setIsTableLoading(false));
    }, [dataFilter, stocksMutating]);

    const handleClear = () => {
        setWarehouseId("*");
        setCategoryId("*");
        setCity(city);
    }

    return (
        <>
            <Filter count={transformedData.length} hideDateTime={true} handleClear={handleClear} address={city} setAddress={setCity} hideSearch={true}>
                <div>
                    <div className="text-sm text-text02">{t("warehouse.organization")}</div>
                    <Select
                        className="w-full sm:w-80 h-10"
                        options={organizations.map((item) => ({ label: item.name, value: item.value }))}
                        value={orgId}
                        onChange={(value) => setOrgId(value)}
                    />
                </div>
                <div>
                    <div className="text-sm text-text02">{t("warehouse.category")}</div>
                    <Select
                        className="w-full sm:w-80 h-10"
                        options={categories.map((item) => ({ label: item.name, value: item.value }))}
                        value={categoryId}
                        onChange={(value) => setCategoryId(value)}
                    />
                </div>
                <div>
                    <div className="text-sm text-text02">{t("warehouse.ware")}</div>
                    <Select
                        className="w-full sm:w-80 h-10"
                        options={warehouses.map((item) => ({ label: item.name, value: item.value }))}
                        value={warehouseId}
                        onChange={(value) => setWarehouseId(value)}
                    />
                </div>
            </Filter>
            {isTableLoading || stocksLoading ? (
                <TableSkeleton columnCount={columns.length} />
            ) : transformedData.length > 0 ?
                <div className="mt-8">
                    <DynamicTable
                        data={transformedData.map((tra, index) => ({ ...tra, id: index }))}
                        columns={columns}
                    />
                </div> :
                <NoDataUI
                    title={t("warehouse.noStock")}
                    description={""}
                >
                    <img src={InventoryEmpty} className="mx-auto" loading="lazy" alt="Overhead" />
                </NoDataUI>

            }
        </>
    )
}

export default OverheadCosts;