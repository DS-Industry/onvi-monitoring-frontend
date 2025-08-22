
import React, {useEffect, useMemo, useState,} from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { Select, } from 'antd';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE} from '@/utils/constants';
import useSWR from "swr";
import {getWarehouses} from "@/services/api/warehouse";

const SalePrice: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t('warehouse.all');
    const [searchParams, setSearchParams] = useSearchParams();
    const [totalCount, setTotalCount] = useState(0);

    const currentPage = Number(searchParams.get('page')) || DEFAULT_PAGE;
    const pageSize = Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE;
    const warehouseId = Number(searchParams.get('warehouseId')) || undefined;
    const city = Number(searchParams.get('city')) || undefined;

    const { data: warehouseData } = useSWR(
        [`get-warehouse`, city],
        () =>
            getWarehouses({
                placementId: city,
            }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        }
    );

    const warehouses: { name: string; value: number | string }[] =
        warehouseData?.map(item => ({
            name: item.props.name,
            value: item.props.id,
        })) || [];

    const warehousesAllObj = {
        name: allCategoriesText,
        value: '*',
    };

    warehouses.unshift(warehousesAllObj);

    useEffect(() => {
        if (city && warehouseId) {
            updateSearchParams(searchParams, setSearchParams, {
                warehouseId: '*',
            });
        }
    }, [city]);

    return (
        <>
            <div className="ml-12 md:ml-0 mb-5">
                <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.salePrice')}
          </span>
                </div>
            </div>
            <GeneralFilters count={totalCount} display={['city']}>
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        {t('warehouse.ware')}
                    </label>
                    <Select
                        showSearch
                        allowClear={false}
                        className="w-full sm:w-80"
                        options={warehouses.map(item => ({
                            label: item.name,
                            value: item.value ? String(item.value) : undefined,
                        }))}
                        value={searchParams.get('warehouseId') || '*'}
                        onChange={value => {
                            updateSearchParams(searchParams, setSearchParams, {
                                warehouseId: value,
                            });
                        }}
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                            (option?.label ?? "")
                                .toString()
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                    />
                </div>
            </GeneralFilters>
        </>
    );
};

export default SalePrice;
