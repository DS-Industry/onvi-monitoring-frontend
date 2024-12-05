import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { getDepositDevice } from "@/services/api/pos";
import {
    columnsMonitoringDevice,
} from "@/utils/OverFlowTableData.tsx";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import { useLocation } from "react-router-dom";
import { getDeviceByPosId } from "@/services/api/device";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import SalyIamge from "@/assets/Saly-45.svg?react";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useDeviceId, useStartDate, useEndDate, useSetDeviceId, useSetStartDate, useSetEndDate } from '@/hooks/useAuthStore';

type DeviceMonitoring = {
    props: {
        id: number;
        name: string;
        carWashDeviceMetadata: string;
        status: string;
        ipAddress: string;
        carWashDeviceTypeId: string;
        carWashPosId: number;
        deviceRoleId: number;
    }
}

type FilterDepositDevice = {
    dateStart: Date;
    dateEnd: Date;
    deviceId?: number;
}

type DepositDeviceResponse = {
    id: number;
    sumOper: number;
    dateOper: Date;
    dateLoad: Date;
    counter: number;
    localId: number;
    currencyType: string;
}

const DepositDevice: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const deviceId = useDeviceId();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const setDeviceId = useSetDeviceId();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();

    const location = useLocation();
    const [isTableLoading, setIsTableLoading] = useState(false);
    const initialFilter = {
        dateStart: startDate || `2024-10-01 00:00`,
        dateEnd: endDate || `${formattedDate} 23:59`,
        deviceId: deviceId || location.state?.ownerId,
    };
    const [dataFilter, setIsDataFilter] = useState<FilterDepositDevice>(initialFilter);


    const { data: filter, error: filterError, isLoading: filterIsLoading, mutate: filterMutate } = useSWR([`get-pos-deposits-pos-devices-${dataFilter.deviceId ? dataFilter.deviceId : location.state?.ownerId}`], () => getDepositDevice(
        dataFilter.deviceId ? dataFilter.deviceId : location.state.ownerId, {
        dateStart: dataFilter.dateStart,
        dateEnd: dataFilter.dateEnd,
    }));
    const { data } = useSWR([`get-device-pos`], () => getDeviceByPosId(location.state?.ownerId))


    const handleDataFilter = (newFilterData: Partial<FilterDepositDevice>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);

        if (newFilterData.dateStart) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd) setEndDate(newFilterData.dateEnd);
        if (newFilterData.deviceId) setDeviceId(newFilterData.deviceId);
    };
    useEffect(() => {
        console.log(JSON.stringify(filterError, null, 2));
    }, [filterError]);

    useEffect(() => {
        filterMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, filterMutate]);

    const deviceMonitoring: DepositDeviceResponse[] = filter?.map((item: DepositDeviceResponse) => {
        return item;
    }).sort((a: { dateOper: Date; }, b: { dateOper: Date; }) => new Date(a.dateOper).getTime() - new Date(b.dateOper).getTime()) || [];

    const deviceData: DeviceMonitoring[] = data?.map((item: DeviceMonitoring) => {
        return item;
    }).sort((a, b) => a.props.id - b.props.id) || [];

    const deviceOptional: { name: string; value: string }[] = deviceData.map(
        (item) => ({ name: item.props.name, value: item.props.id.toString() })
    );

    return (
        <>
            <FilterMonitoring
                count={deviceMonitoring.length}
                devicesSelect={deviceOptional}
                handleDataFilter={handleDataFilter}
            />
            {isTableLoading || filterIsLoading ? (<TableSkeleton columnCount={columnsMonitoringDevice.length} />)
                :
                deviceMonitoring.length > 0 ? (
                    <div className="mt-8">
                        <OverflowTable
                            tableData={deviceMonitoring}
                            columns={columnsMonitoringDevice}
                            isDisplayEdit={true}
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

export default DepositDevice;