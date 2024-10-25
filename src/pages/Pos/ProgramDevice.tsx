import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { getProgramDevice } from "@/services/api/pos";
import {
    columnsProgramDevice,
} from "@/utils/OverFlowTableData.tsx";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import { useLocation } from "react-router-dom";
import SalyIamge from "@/assets/Saly-45.svg?react";
import { getDeviceByPosId } from "@/services/api/device";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useDeviceId, useStartDate, useEndDate, useSetStartDate, useSetEndDate, useSetDeviceId } from '@/hooks/useAuthStore'; 

interface FilterDepositDevice {
    dateStart: Date;
    dateEnd: Date;
    deviceId?: number;
}

interface DeviceProgram {
    id: number;
    name: string;
    dateBegin: Date;
    dateEnd: Date;
    time: string;
    localId: number;
    payType: string;
    isCar: number;
}

interface DeviceMonitoring {
    props: {
        id: number;
        name: string;
        status: string;
    };
}

const ProgramDevice: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const deviceId = useDeviceId();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const setDeviceId = useSetDeviceId();

    const location = useLocation();
    const [isTableLoading, setIsTableLoading] = useState(false);
    const initialFilter = {
        dateStart: startDate || `${formattedDate} 00:00`,
        dateEnd: endDate || `${formattedDate} 23:59`,
        deviceId: deviceId || location.state?.ownerId,
    };
    const [dataFilter, setIsDataFilter] = useState<FilterDepositDevice>(initialFilter);


    const { data: filter, error: filterError, isLoading: filterIsLoading, mutate: filterMutate } = useSWR([`get-pos-program-pos-devices-${dataFilter.deviceId ? dataFilter.deviceId : location.state?.ownerId}`], () => getProgramDevice(
        dataFilter.deviceId ? dataFilter.deviceId : location.state?.ownerId, {
        dateStart: dataFilter.dateStart,
        dateEnd: dataFilter.dateEnd,
    }));
    const { data } = useSWR([`get-device-pos`], () => getDeviceByPosId(66))

    const handleDataFilter = (newFilterData: Partial<FilterDepositDevice>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);

        if (newFilterData.dateStart) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd) setEndDate(newFilterData.dateEnd);
        if(newFilterData.deviceId) setDeviceId(newFilterData.deviceId);
    };
    useEffect(() => {
        console.log(JSON.stringify(filterError, null, 2));
    }, [filterError]);
    useEffect(() => {
        filterMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, filterMutate]);

    const deviceProgram: DeviceProgram[] = filter?.map((item: DeviceProgram) => {
        return item;
    }).sort((a: { dateBegin: string | number | Date; }, b: { dateBegin: string | number | Date; }) => new Date(a.dateBegin).getTime() - new Date(b.dateBegin).getTime()) || [];

    const deviceData: DeviceMonitoring[] = data?.map((item: DeviceMonitoring) => {
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
            {
                isTableLoading || filterIsLoading ? (<TableSkeleton columnCount={columnsProgramDevice.length} />)
                    :
                    deviceProgram.length > 0 ? (
                        <div className="mt-8 overflow-hidden">
                            <OverflowTable
                                tableData={deviceProgram}
                                columns={columnsProgramDevice}
                            />
                        </div>
                    ) : (
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