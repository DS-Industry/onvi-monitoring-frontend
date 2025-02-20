import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useMemo, useState } from "react";
import InventoryEmpty from "@/assets/NoInventory.png"
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getAllStockLevels, getCategory, getWarehouses } from "@/services/api/warehouse";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import { useFilterOn } from "@/components/context/useContext";
import { getOrganization } from "@/services/api/organization";
import { usePosType } from "@/hooks/useAuthStore";

type StockParams = {
    categoryId?: number;
    warehouseId?: number;
}

const OverheadCosts: React.FC = () => {
    const { t } = useTranslation();
    const [orgId, setOrgId] = useState(1);
    const [categoryId, setCategoryId] = useState(0);
    const [warehouseId, setWarehouseId] = useState(0);
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

    const { data: categoryData } = useSWR([`get-category`], () => getCategory(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: warehouseData } = useSWR([`get-warehouse`], () => getWarehouses(posType), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: organizationData } = useSWR([`get-organization`], () => getOrganization(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const categories: { name: string; value: number; }[] = categoryData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const warehouses: { name: string; value: number; }[] = warehouseData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const { data: allStockLevels, isLoading: stocksLoading, mutate: stocksMutating } = useSWR([`get-all-stock-levels`, orgId], () => getAllStockLevels(orgId, {
        warehouseId: dataFilter.warehouseId,
        categoryId: dataFilter.categoryId
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const stockLevels = useMemo(() => allStockLevels || [], [allStockLevels]);

    const { columns, transformedData } = useMemo(() => {
        if (!stockLevels.length) return { columns: baseColumns, transformedData: stockLevels };

        const warehouseColumns: { label: string; key: string }[] = [];
        const transformedStockLevels = stockLevels.map((level) => {
            const transformedLevel = { ...level };
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
        warehouseId: warehouseId
    }

    const [dataFilter, setDataFilter] = useState<StockParams>(initialFilter);

    const handleDataFilter = (newFilterData: Partial<StockParams>) => {
        setDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);
        if (newFilterData.warehouseId) setWarehouseId(newFilterData.warehouseId);
        if (newFilterData.categoryId) setCategoryId(newFilterData.categoryId);
    }

    useEffect(() => {
        handleDataFilter({
            categoryId: categoryId,
            warehouseId: warehouseId
        })
    }, [filterOn])

    useEffect(() => {
        stocksMutating().then(() => setIsTableLoading(false));
    }, [dataFilter, stocksMutating]);

    const handleClear = () => {
        setWarehouseId(0);
        setCategoryId(0);
    }

    return (
        <>
            <Filter count={transformedData.length} hideDateTime={true} handleClear={handleClear} hideCity={true} hideSearch={true}>
                <DropdownInput
                    title={t("warehouse.organization")}
                    value={orgId}
                    options={organizations}
                    onChange={(value) => setOrgId(value)}
                    classname="ml-2"
                />
                <DropdownInput
                    title={t("warehouse.category")}
                    value={categoryId}
                    options={categories}
                    onChange={(value) => setCategoryId(value)}
                    classname="ml-2"
                />
                <DropdownInput
                    title={t("warehouse.ware")}
                    value={warehouseId}
                    options={warehouses}
                    onChange={(value) => setWarehouseId(value)}
                    classname="ml-2"
                />
            </Filter>
            {isTableLoading || stocksLoading ? (
                <TableSkeleton columnCount={columns.length} />
            ) : transformedData.length > 0 ?
                <div className="mt-8">
                    <OverflowTable
                        tableData={transformedData}
                        columns={columns}
                    />
                </div> :
                <NoDataUI
                    title={t("warehouse.noStock")}
                    description={""}
                >
                    <img src={InventoryEmpty} className="mx-auto" />
                </NoDataUI>

            }
        </>
    )
}

export default OverheadCosts;