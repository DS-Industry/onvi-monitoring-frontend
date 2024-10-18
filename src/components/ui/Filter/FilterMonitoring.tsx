import React, { useEffect, useRef, useState } from "react";
import { useButtonCreate, useFilterOpen } from "@/components/context/useContext.tsx";
import InputDateGap from "../InputLine/InputDateGap.tsx";
import Button from "../Button/Button.tsx";
import DropdownInput from "../Input/DropdownInput.tsx";

type Optional = {
    name: string;
    value: string;
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

    const { buttonOn, setButtonOn } = useButtonCreate();
    const { filterOpen, setFilterOpen } = useFilterOpen();
    const contentRef = useRef<HTMLDivElement>(null);
    const [startDate, setStartDate] = useState(`${formattedDate} 00:00`);
    const [endDate, setEndDate] = useState(`${formattedDate} 23:59`);
    const [organizationId, setOrganizationId] = useState('');
    const [posId, setPosId] = useState('');
    const [deviceId, setDeviceId] = useState('');


    const handleStartDateChange = (combinedDateTime: string) => {
        setStartDate(combinedDateTime);
    };

    const handleEndDateChange = (combinedDateTime: string) => {
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
    }, [buttonOn]);

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
                        setStartDate(`${formattedDate} 00:00`);
                        setEndDate(`${formattedDate} 23:59`);
                        setPosId('');
                        setOrganizationId('');
                        setDeviceId('');
                        setButtonOn(!buttonOn);
                    }}
                />
                <Button
                    title='Применить'
                    form={true}
                    handleClick={() => setButtonOn(!buttonOn)}
                />
                <p className="font-semibold">Найдено: {count}</p>
            </div>
        </div>
    );
};

export default FilterMonitoring;