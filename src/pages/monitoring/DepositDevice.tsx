import React, {useEffect, useState} from "react";
import useSWR from "swr";
import {getDeposit, getDepositDevice, getDepositPos} from "../../services/api/monitoring";
import {
    columnsMonitoringDevice,
} from "../../utils/OverFlowTableData.tsx";
import OverflowTable from "../../components/ui/Table/OverflowTable.tsx";
import NoDataUI from "../../components/ui/NoDataUI.tsx";
import {useLocation} from "react-router-dom";
import {getPos} from "../../services/api/pos";
import {getDeviceByPosId} from "../../services/api/device";
import FilterMonitoring from "../../components/ui/Filter/FilterMonitoring.tsx";

const DepositDevice: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const [isData, setIsData] = useState(true);
    const location = useLocation();

    const [dataFilter, setIsDataFilter] = useState<FilterDepositDevice>({dateStart: `${formattedDate} 00:00`, dateEnd: `${formattedDate} 23:59`, posId: location.state.ownerId});


    const { data: filter, error: filterError, isLoading: filterIsLoading, mutate: filterMutate  } = useSWR([`get-pos-deposits-pos-devices-${dataFilter.deviceId ? dataFilter.deviceId : location.state.ownerId}`], () => getDepositDevice(
        dataFilter.deviceId ? dataFilter.deviceId : location.state.ownerId, {
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

    const deviceMonitoring: DeviceMonitoring[] = filter?.map((item: DeviceMonitoring) => {
        return item;
    }).sort((a, b) => new Date(a.dateOper).getTime() - new Date(b.dateOper).getTime()) || [];

    const deviceData: DeviceMonitoring[] = data?.map((item: PosMonitoring) => {
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
            {isData ? (
                <div className="mt-8">
                    <OverflowTable
                        tableData={deviceMonitoring}
                        columns={columnsMonitoringDevice}
                        isDisplayEdit={true}
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

export default DepositDevice;