import React, { useEffect, useRef, useState } from "react";
import { useButtonCreate, useFilterOn, useFilterOpen } from "@/components/context/useContext.tsx";
import InputDateGap from "@ui/InputLine/InputDateGap.tsx";
import Button from "@ui/Button/Button.tsx";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate, useWareHouseId, useSetWareHouseId, usePageNumber, useSetPageNumber, useCurrentPage, useCity, useSetCity, useDeviceId, useSetDeviceId } from "@/hooks/useAuthStore.ts";
import useSWR from "swr";
import { getPlacement } from "@/services/api/device/index.ts";
import { Select, Input } from "antd";
import { useTranslation } from "react-i18next";
import SearchDropdownInput from "@ui/Input/SearchDropdownInput.tsx";

type Optional = {
    name: string;
    value: string | number;
};

type FilterPayload = {
    dateStart: Date;
    dateEnd: Date;
    posId?: string | number;
    deviceId?: number;
    warehouseId?: string | number;
    placementId?: string | number;
    page?: number;
    size?: number;
};

type FilterStringPayload = {
    dateStart: string;
    dateEnd: string;
    posId?: string | number;
    deviceId?: number;
    warehouseId?: string | number;
    placementId?: string | number;
    page?: number;
    size?: number;
};

type Props = {
    count: number;
    organizationsSelect?: Optional[];
    posesSelect?: Optional[];
    devicesSelect?: Optional[];
    wareHousesSelect?: Optional[];
    usersSelect?: Optional[];
    handleDataFilter?: (filter: FilterPayload) => void;
    handleDateFilter?: (filter: FilterStringPayload) => void;
    hideCity?: boolean;
    hideSearch?: boolean;
    hideReset?: boolean;
    loadingPos?: boolean;
};

const { Search } = Input;

const FilterMonitoring: React.FC<Props> = ({
    count,
    organizationsSelect,
    posesSelect,
    devicesSelect,
    wareHousesSelect,
    usersSelect,
    handleDataFilter,
    handleDateFilter,
    hideCity = false,
    hideSearch = false,
    hideReset = false,
    loadingPos
}: Props) => {

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    const posType = usePosType();
    const wareHouseId = useWareHouseId();
    const storeStartDate = useStartDate();
    const storeEndDate = useEndDate();
    // const { buttonOn, setButtonOn } = useButtonCreate();
    // const [linesPerPage, setLinesPerPage] = useState(10);
    const { filterOn, setFilterOn } = useFilterOn();
    const { filterOpen } = useFilterOpen();
    const { buttonOn } = useButtonCreate();
    const contentRef = useRef<HTMLDivElement>(null);
    const [startDate, setStartDate] = useState(storeStartDate);
    const [endDate, setEndDate] = useState(storeEndDate);
    const [organizationId, setOrganizationId] = useState('');
    const posId = posType;
    const setPosId = useSetPosType();
    const [warehouseId, setWarehouseId] = useState(wareHouseId);
    const deviceId = useDeviceId();
    const setDeviceId = useSetDeviceId();
    const city = useCity();
    const setCity = useSetCity();

    const setPosType = useSetPosType();
    const setWareHouseId = useSetWareHouseId();
    const setStartDateInStore = useSetStartDate();
    const setEndDateInStore = useSetEndDate();
    const pageNumber = usePageNumber();
    const setPageNumber = useSetPageNumber();

    const currentPage = useCurrentPage();

    const handleStartDateChange = (combinedDateTime: Date) => {
        setStartDate(combinedDateTime);
    };

    const handleEndDateChange = (combinedDateTime: Date) => {
        setEndDate(combinedDateTime);
    };

    const { data: cityData } = useSWR([`get-city`], () => getPlacement(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const cities: { name: string; value: number | string; }[] = cityData?.map((item) => ({ name: item.region, value: item.id })) || [];

    const citiesAllObj = {
        name: allCategoriesText,
        value: "*"
    };

    cities.unshift(citiesAllObj);

    useEffect(() => {
        if (filterOpen && !buttonOn) {
            if (contentRef.current) {
                contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
            }
        } else {
            if (contentRef.current) {
                contentRef.current.style.maxHeight = "0";
            }
        }
    }, [filterOpen, buttonOn]);

    useEffect(() => {
        if (!handleDataFilter) return;

        posesSelect && handleDataFilter({
            dateStart: startDate,
            dateEnd: endDate,
            posId: posId,
            page: currentPage,
            size: pageNumber,
            placementId: city
        });
        devicesSelect && handleDataFilter({
            dateStart: startDate,
            dateEnd: endDate,
            deviceId: deviceId,
            page: currentPage,
            size: pageNumber
        });
        wareHousesSelect && handleDataFilter({
            dateStart: startDate,
            dateEnd: endDate,
            warehouseId: warehouseId
        })
    }, [filterOn]);

    useEffect(() => {
        if (!handleDateFilter) return;

        const safeStartDate = new Date(startDate);
        const safeEndDate = new Date(endDate);

        if (posesSelect) {
            handleDateFilter({
                dateStart: safeStartDate.toISOString(),
                dateEnd: safeEndDate.toISOString(),
                posId,
                page: currentPage,
                size: pageNumber,
                placementId: city
            });
        }

        if (devicesSelect) {
            handleDateFilter({
                dateStart: safeStartDate.toISOString(),
                dateEnd: safeEndDate.toISOString(),
                deviceId,
                page: currentPage,
                size: pageNumber
            });
        }

        if (wareHousesSelect) {
            handleDateFilter({
                dateStart: safeStartDate.toISOString(),
                dateEnd: safeEndDate.toISOString(),
                warehouseId
            });
        }
    }, [filterOn]);

    return (
        <div
            ref={contentRef}
            className={`overflow-hidden transition-all duration-500 ease-in-out max-h-0`}
        >
            <div className="flex flex-wrap gap-4">
                {!hideSearch && (
                    <Search placeholder="Поиск" className="w-full sm:w-80" />
                )}
                {!hideCity && (
                    <SearchDropdownInput
                        title={t("pos.city")}
                        classname="w-full sm:w-80"
                        options={cities}
                        value={city}
                        onChange={setCity}
                    />
                )}
                {organizationsSelect && organizationsSelect.length > 0 && (
                    <div>
                        <div className="text-sm text-text02">{t("analysis.organizationId")}</div>
                        <Select
                            className="w-full sm:w-80"
                            placeholder="Выберите организацию"
                            options={organizationsSelect.map((item) => ({ label: item.name, value: item.value }))}
                            value={organizationId}
                            onChange={setOrganizationId}
                            dropdownRender={(menu) => (
                                <div style={{ maxHeight: 100, overflowY: "auto" }}>
                                    {menu}
                                </div>
                            )}
                        />
                    </div>
                )}
                {posesSelect && posesSelect.length > 0 && (
                    <SearchDropdownInput
                        title={t("analysis.posId")}
                        classname="w-full sm:w-80"
                        placeholder="Выберите объект"
                        options={posesSelect}
                        value={posType}
                        onChange={setPosType}
                        loading={loadingPos}
                    />
                )}
                {usersSelect && usersSelect.length > 0 && (
                    <div>
                        <div className="text-sm text-text02">{t("equipment.user")}</div>
                        <Select
                            className="w-full sm:w-80 h-10"
                            placeholder="Выберите пользователя"
                            options={usersSelect.map((item) => ({ label: item.name, value: item.value }))}
                            dropdownRender={(menu) => (
                                <div style={{ maxHeight: 100, overflowY: "auto" }}>
                                    {menu}
                                </div>
                            )}
                        />
                    </div>
                )}
                {devicesSelect && devicesSelect.length > 0 && (
                    <div>
                        <div className="text-sm text-text02">{t("analysis.deviceId")}</div>
                        <Select
                            className="w-full sm:w-80 h-10"
                            placeholder="Выберите устройство"
                            options={devicesSelect.map((item) => ({ label: item.name, value: item.value }))}
                            value={deviceId}
                            onChange={setDeviceId}
                            dropdownRender={(menu) => (
                                <div style={{ maxHeight: 100, overflowY: "auto" }}>
                                    {menu}
                                </div>
                            )}
                        />
                    </div>
                )}
                {wareHousesSelect && wareHousesSelect.length > 0 && (
                    <div>
                        <div className="text-sm text-text02">{t("analysis.warehouseId")}</div>
                        <Select
                            className="w-full sm:w-80 h-10"
                            placeholder="Введите название склада"
                            options={wareHousesSelect.map((item) => ({ label: item.name, value: item.value }))}
                            value={warehouseId}
                            onChange={setWarehouseId}
                            dropdownRender={(menu) => (
                                <div style={{ maxHeight: 100, overflowY: "auto" }}>
                                    {menu}
                                </div>
                            )}
                        />
                    </div>
                )}
                <div>
                    <div className="text-sm text-text02">{t("tables.lines")}</div>
                    <Select
                        className="w-24 h-10"
                        options={[{ label: 15, value: 15 }, { label: 50, value: 50 }, { label: 100, value: 100 }, { label: 120, value: 120 }]}
                        value={pageNumber}
                        onChange={setPageNumber}
                        dropdownRender={(menu) => (
                            <div style={{ maxHeight: 100, overflowY: "auto" }}>
                                {menu}
                            </div>
                        )}
                    />
                </div>
            </div>

            <div className="mt-4">
                <InputDateGap
                    onStartDateChange={handleStartDateChange}
                    onEndDateChange={handleEndDateChange}
                    defaultDateStart={startDate}
                    defaultDateEnd={endDate}
                />
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4">
                {!hideReset && (<Button
                    title='Сбросить'
                    type='outline'
                    handleClick={() => {
                        setStartDate(new Date(`${formattedDate} 00:00`));
                        setEndDate(new Date(`${formattedDate} 23:59`));
                        setPosId("*");
                        setWarehouseId("*");
                        setOrganizationId('');
                        setDeviceId(undefined);
                        setPosType("*");
                        setWareHouseId("*");
                        setCity("*");
                        setStartDateInStore(new Date(`${formattedDate} 00:00`));
                        setEndDateInStore(new Date(`${formattedDate} 23:59`));
                        setFilterOn(!filterOn);
                    }}
                    classname="w-[168px]"
                />)}
                <Button
                    title='Применить'
                    form={true}
                    handleClick={() => setFilterOn(!filterOn)}
                    classname="w-[168px]"
                />
                <p className="font-semibold">Найдено: {count}</p>
            </div>
        </div>
    );
};

export default FilterMonitoring;