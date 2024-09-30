import React, {useCallback, useEffect, useRef, useState} from "react";
import InputLineOption from "../InputLine/InputLineOption.tsx";
import {useButtonCreate, useFilterOpen} from "@/components/context/useContext.tsx";
import InputDateGap from "../InputLine/InputDateGap.tsx";
import Button from "../Button/Button.tsx";

type Optional = {
    name: string;
    value: string;
}

type Props = {
    count: number;
    organizationsSelect?: Optional[];
    posesSelect?: Optional[];
    devicesSelect?: Optional[];
    handleDataFilter;
};
const FilterMonitoring: React.FC<Props> = ({
                                     count,
                                     organizationsSelect,
                                     posesSelect,
                                     devicesSelect,
                                     handleDataFilter
                                 }:Props) => {

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const { buttonOn, setButtonOn } = useButtonCreate();
    const { filterOpen, setFilterOpen} = useFilterOpen();
    const contentRef = useRef<HTMLDivElement>(null);
    const [startDate, setStartDate] = useState(`${formattedDate} 00:00`);
    const [endDate, setEndDate] = useState(`${formattedDate} 23:59`);
    const [posId, setPosId] = useState();
    const [deviceId, setDeviceId] = useState();


    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(event);
    };

    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(event);
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
                {organizationsSelect &&(<InputLineOption
                    title={"Организация"}
                    type={"string"}
                    name={'org'}
                    placeholder={'Выберите организацию'}
                    optionals={organizationsSelect}
                />)}
                {posesSelect &&(<InputLineOption
                    title={"Объект"}
                    type={"string"}
                    name={'pos'}
                    placeholder={'Выберите объект'}
                    optionals={posesSelect}
                    onSelect={(selectedOption) => {
                        setPosId(selectedOption.value);
                    }}
                />)}
                {devicesSelect &&(<InputLineOption
                    title={"Устройство"}
                    type={"string"}
                    name={'device'}
                    placeholder={'Выберите устройство'}
                    optionals={devicesSelect}
                    onSelect={(selectedOption) => {
                        setDeviceId(selectedOption.value);
                    }}
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
                    title ='Сбросить'
                    type ='outline'
                    handleClick ={() => {
                        setStartDate(`${formattedDate} 00:00`);
                        setEndDate(`${formattedDate} 23:59`);
                        setPosId(null);
                    }}
                />
                <Button
                    title ='Применить'
                    form={true}
                    handleClick ={() => setButtonOn(!buttonOn)}
                />
                <p className="font-semibold">Найдено: {count}</p>
            </div>
        </div>
    );
};

export default FilterMonitoring;