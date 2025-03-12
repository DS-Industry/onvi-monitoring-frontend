import React, { useEffect, useRef, useState } from "react";
import { useButtonCreate, useFilterOn, useFilterOpen } from "@/components/context/useContext.tsx";
import InputDateGap from "../InputLine/InputDateGap.tsx";
import Button from "../Button/Button.tsx";
import DropdownInput from "../Input/DropdownInput.tsx";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate, useWareHouseId, useSetWareHouseId, usePageNumber, useSetPageNumber, useCurrentPage, useCity, useSetCity, useDeviceId, useSetDeviceId } from "@/hooks/useAuthStore.ts";
import SearchInput from "../Input/SearchInput.tsx";
import useSWR from "swr";
import { getPlacement } from "@/services/api/device/index.ts";

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
};
const FilterMonitoring: React.FC<Props> = ({
    count,
    organizationsSelect,
    posesSelect,
    devicesSelect,
    wareHousesSelect,
    usersSelect,
    handleDataFilter,
    hideCity = false,
    hideSearch = false
}: Props) => {

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

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

    const cities: { name: string; value: number; }[] = cityData?.map((item) => ({ name: item.city, value: item.id })) || [];



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
                    <SearchInput
                        value={""}
                        onChange={() => { }}
                        classname="w-full sm:w-80"
                        searchType="outlined"
                        title="Поиск"
                    />
                )}
                {!hideCity && (
                    <DropdownInput
                        title={"Город"}
                        value={city}
                        classname="w-full sm:w-80"
                        options={cities}
                        onChange={(value) => setCity(value)}
                    />
                )}
                {organizationsSelect && (
                    <DropdownInput
                        title={"Организация"}
                        type={"string"}
                        label={'Выберите организацию'}
                        classname="w-full sm:w-80"
                        options={organizationsSelect}
                        value={organizationId}
                        onChange={setOrganizationId}
                    />
                )}
                {posesSelect && (
                    <DropdownInput
                        title={"Объект"}
                        type={"string"}
                        label={'Выберите объект'}
                        classname="w-full sm:w-80"
                        options={posesSelect}
                        value={posId}
                        onChange={setPosId}
                    />
                )}
                {usersSelect && (
                    <DropdownInput
                        title={"Пользователь"}
                        type={"string"}
                        label={'Выберите объект'}
                        classname="w-full sm:w-80"
                        options={usersSelect}
                        value={undefined}
                    />
                )}
                {devicesSelect && (
                    <DropdownInput
                        title={"Устройство"}
                        type={"string"}
                        label={'Выберите устройство'}
                        classname="w-full sm:w-80"
                        options={devicesSelect}
                        value={deviceId}
                        onChange={setDeviceId}
                    />
                )}
                {wareHousesSelect && (
                    <DropdownInput
                        title={"Склад"}
                        type={"string"}
                        label={'Введите название склада'}
                        classname="w-full sm:w-80"
                        options={wareHousesSelect}
                        value={warehouseId}
                        onChange={setWarehouseId}
                    />
                )}
                <DropdownInput
                    title={"Строк на стр."}
                    value={pageNumber}
                    classname="w-24"
                    options={[
                        { name: 15, value: 15 },
                        { name: 50, value: 50 },
                        { name: 100, value: 100 },
                        { name: 120, value: 120 },
                        { name: 150, value: 150 }
                    ]}
                    onChange={(value) => setPageNumber(value)}
                />
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
                <Button
                    title='Сбросить'
                    type='outline'
                    handleClick={() => {
                        setStartDate(new Date(`${formattedDate} 00:00`));
                        setEndDate(new Date(`${formattedDate} 23:59`));
                        setPosId("*");
                        setWarehouseId(0);
                        setOrganizationId('');
                        setDeviceId(undefined);
                        setPosType("*");
                        setWareHouseId(0);
                        setStartDateInStore(new Date(`${formattedDate} 00:00`));
                        setEndDateInStore(new Date(`${formattedDate} 23:59`));
                        setFilterOn(!filterOn);
                    }}
                />
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