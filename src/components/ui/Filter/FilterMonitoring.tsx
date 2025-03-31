import React, { useEffect, useRef, useState } from "react";
import { useButtonCreate, useFilterOn, useFilterOpen } from "@/components/context/useContext.tsx";
import InputDateGap from "../InputLine/InputDateGap.tsx";
import Button from "../Button/Button.tsx";
// import DropdownInput from "../Input/DropdownInput.tsx";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate, useWareHouseId, useSetWareHouseId, usePageNumber, useSetPageNumber, useCurrentPage, useCity, useSetCity, useDeviceId, useSetDeviceId } from "@/hooks/useAuthStore.ts";
// import SearchInput from "../Input/SearchInput.tsx";
import useSWR from "swr";
import { getPlacement } from "@/services/api/device/index.ts";
import { Select, Input } from "antd";
import { useTranslation } from "react-i18next";

type Optional = {
    name: string;
    value: any;
}

type Props = {
    count: number;
    organizationsSelect?: Optional[];
    posesSelect?: Optional[];
    devicesSelect?: Optional[];
    wareHousesSelect?: Optional[];
    usersSelect?: Optional[];
    handleDataFilter?: any;
    hideCity?: boolean;
    hideSearch?: boolean;
    hideReset?: boolean;
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
    hideCity = false,
    hideSearch = false,
    hideReset = false
}: Props) => {

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const { t } = useTranslation();

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

    const cities: { label: string; value: number; }[] = cityData?.map((item) => ({ label: item.city, value: item.id })) || [];

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
                    <div>
                        <div className="text-sm text-text02">{t("pos.city")}</div>
                        <Select
                            className="w-full sm:w-80"
                            placeholder="Город"
                            options={cities}
                            value={city}
                            onChange={setCity}
                        />
                    </div>
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
                    <div>
                        <div className="text-sm text-text02">{t("analysis.posId")}</div>
                        <Select
                            className="w-full sm:w-80"
                            placeholder="Выберите объект"
                            options={posesSelect.map((item) => ({ label: item.name, value: item.value }))}
                            value={posType}
                            onChange={setPosType}
                            dropdownRender={(menu) => (
                                <div style={{ maxHeight: 100, overflowY: "auto" }}>
                                    {menu}
                                </div>
                            )}
                        />
                    </div>
                )}
                {usersSelect && usersSelect.length > 0 && (
                    <div>
                        <div className="text-sm text-text02">{t("equipment.user")}</div>
                        <Select
                            className="w-full sm:w-80"
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
                            className="w-full sm:w-80"
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
                            className="w-full sm:w-80"
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
                        className="w-24"
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
                />)}
                <Button
                    title='Применить'
                    form={true}
                    handleClick={() => setFilterOn(!filterOn)}
                />
                <p className="font-semibold">Найдено: {count}</p>
            </div>
        </div>
    );
};

export default FilterMonitoring;