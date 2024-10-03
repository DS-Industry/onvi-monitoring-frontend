import React, {useEffect, useState} from "react";
import useSWR from "swr";
import {getDeposit, getDepositDevice, getDepositPos, getProgramDevice} from "@/services/api/monitoring";
import {
    columnsMonitoringDevice, columnsProgramDevice,
} from "@/utils/OverFlowTableData.tsx";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import {useLocation} from "react-router-dom";
import SalyIamge from "@/assets/Saly-45.svg?react";
import {getDeviceByPosId} from "@/services/api/device";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";

const ProgramDevice: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const location = useLocation();
    const [dataFilter, setIsDataFilter] = useState<FilterDepositDevice>({dateStart: `${formattedDate} 00:00`, dateEnd: `${formattedDate} 23:59`, posId: location.state?.ownerId});


    const { data: filter, error: filterError, isLoading: filterIsLoading, mutate: filterMutate } = useSWR([`get-pos-program-pos-devices-${dataFilter.deviceId ? dataFilter.deviceId : location.state?.ownerId}`], () => getProgramDevice(
        dataFilter.deviceId ? dataFilter.deviceId : location.state?.ownerId, {
            dateStart: dataFilter.dateStart,
            dateEnd: dataFilter.dateEnd,
    }));
    const { data, error, isLoading } = useSWR([`get-device-pos-66`], () => getDeviceByPosId(66))

    const handleDataFilter = (newFilterData: Partial<FilterDepositDevice>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
    };
    useEffect(() => {
        console.log(JSON.stringify(filterError, null, 2));
    }, [filterError]);
    useEffect(() => {
        filterMutate();
    }, [dataFilter]);

    const deviceProgram: DeviceProgram[] = filter?.map((item: DeviceProgram) => {
        return item;
    }).sort((a, b) => new Date(a.dateBegin).getTime() - new Date(b.dateBegin).getTime()) || [];

    const deviceData: DeviceMonitoring[] = data?.map((item: PosMonitoring) => {
        return item;
    }).sort((a, b) => a.props.id - b.props.id) || [];

    const deviceOptional: { name: string; value: string }[] = deviceData.map(
        (item) => ({ name: item.props.name, value: item.props.id.toString() })
    );

    return (
        <>
            <FilterMonitoring
                count={deviceProgram.length}
                devicesSelect={deviceOptional}
                handleDataFilter={handleDataFilter}
            />
            {deviceProgram.length > 0 ? (
                <div className="mt-8">
                    <OverflowTable
                        tableData={deviceProgram}
                        columns={columnsProgramDevice}
                    />
                </div>
            ):(
                <>
                    <NoDataUI
                        title="В этом разделе представленны операции"
                        description="У вас пока нету операций"
                    >
                        <SalyIamge className="mx-auto" />
                    </NoDataUI>
                </>
            )}
        </>
    )
}

export default ProgramDevice;