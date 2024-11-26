import React, { useEffect, useRef, useState } from "react";
import { useFilterOn, useFilterOpen } from "@/components/context/useContext.tsx";
import InputDateGap from "../InputLine/InputDateGap.tsx";
import Button from "../Button/Button.tsx";
import DropdownInput from "../Input/DropdownInput.tsx";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate } from "@/hooks/useAuthStore.ts";

type Optional = {
    name: string;
    value: any;
}

type Props = {
    count: number;
    organizationsSelect?: Optional[];
    posesSelect?: Optional[];
    devicesSelect?: Optional[];
    handleDataFilter: any;
};
const FilterMonitoring: React.FC<Props> = ({
    count,
    organizationsSelect,
    posesSelect,
    devicesSelect,
    handleDataFilter
}: Props) => {

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const posType = usePosType();
    const storeStartDate = useStartDate();
    const storeEndDate = useEndDate();
    // const { buttonOn, setButtonOn } = useButtonCreate();
    const { filterOn, setFilterOn } = useFilterOn();
    const { filterOpen } = useFilterOpen();
    const contentRef = useRef<HTMLDivElement>(null);
    const [startDate, setStartDate] = useState(storeStartDate);
    const [endDate, setEndDate] = useState(storeEndDate);
    const [organizationId, setOrganizationId] = useState('');
    const [posId, setPosId] = useState(posType);
    const [deviceId, setDeviceId] = useState('');

    const setPosType = useSetPosType();
    const setStartDateInStore = useSetStartDate();
    const setEndDateInStore = useSetEndDate();

    const handleStartDateChange = (combinedDateTime: Date) => {
        setStartDate(combinedDateTime);
    };

    const handleEndDateChange = (combinedDateTime: Date) => {
        setEndDate(combinedDateTime);
    };


    useEffect(() => {
        if (filterOpen) {
            if (contentRef.current) {
                contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
            }
        } else {
            if (contentRef.current) {
                contentRef.current.style.maxHeight = "0";
            }
        }
    }, [filterOpen]);

    useEffect(() => {
        posesSelect && handleDataFilter({
            dateStart: startDate,
            dateEnd: endDate,
            posId: posId,
        });
        devicesSelect && handleDataFilter({
            dateStart: startDate,
            dateEnd: endDate,
            deviceId: deviceId,
        });
    }, [filterOn]);

    return (
        <div
            ref={contentRef}
            className={`overflow-hidden transition-all duration-500 ease-in-out max-h-0`}
        >
            <div className="grid grid-cols-2 gap-6">
                {organizationsSelect && (<DropdownInput
                    title={"Организация"}
                    type={"string"}
                    label={'Выберите организацию'}
                    classname="w-80"
                    options={organizationsSelect}
                    value={organizationId}
                    onChange={setOrganizationId}
                />)}
                {posesSelect && (<DropdownInput
                    title={"Объект"}
                    type={"string"}
                    label={'Выберите объект'}
                    classname="w-80"
                    options={posesSelect}
                    value={posId}
                    onChange={setPosId}
                />)}
                {devicesSelect && (<DropdownInput
                    title={"Устройство"}
                    type={"string"}
                    label={'Выберите устройство'}
                    classname="w-80"
                    options={devicesSelect}
                    value={deviceId}
                    onChange={setDeviceId}
                />)}

            </div>
            <InputDateGap
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                defaultDateStart={startDate}
                defaultDateEnd={endDate}
            />

            <div className="flex items-center gap-6">
                <Button
                    title='Сбросить'
                    type='outline'
                    handleClick={() => {
                        setStartDate(new Date(`${formattedDate} 00:00`));
                        setEndDate(new Date(`${formattedDate} 23:59`));
                        setPosId(0);
                        setOrganizationId('');
                        setDeviceId('');
                        setPosType(0); 
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