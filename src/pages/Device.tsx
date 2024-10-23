import React, {useState} from "react";
import SalyIamge from "../assets/Saly-1.svg?react";
import {useTranslation} from "react-i18next";
import OverflowTable from "../components/ui/Table/OverflowTable.tsx";
import {columnsDevice, tableUserData} from "../utils/OverFlowTableData.tsx";
import NoDataUI from "../components/ui/NoDataUI.tsx";
import {useButtonCreate} from "../components/context/useContext.tsx";
import {useFetchData} from "../api";
import {useLocation, useParams} from "react-router-dom";
import useSWR from "swr";
import {getOrganization} from "../services/api/organization";
import {getDevice, getDeviceByPosId} from "../services/api/device";
import CustomSkeleton from "@/utils/CustomSkeleton.tsx";

const Device: React.FC = () => {
    const { t } = useTranslation();
    const { data, error, isLoading } = useSWR([`get-device-7`], () => getDeviceByPosId(1));
    const location = useLocation();

    const { buttonOn, setButtonOn } = useButtonCreate();

    const devices: Device[] = data?.filter((device: Device) =>
        location.state && location.state.ownerId ? device.carWashPosId === location.state.ownerId : true
    )
        .sort((a, b) => a.id - b.id)
        .map((device) => device) || [];

    return (
        <>
            {
                isLoading ? (<CustomSkeleton type="table" columnCount={columnsDevice.length} />)
                : devices.length > 0 ? (
                <div className="mt-8">
                    <OverflowTable
                        tableData={devices}
                        columns={columnsDevice}
                        isDisplayEdit={true}
                    />
                </div>
            ):(
                <>
                    <NoDataUI
                        title="Пока не создан ни одинго устройства"
                        description="Добавьте устройство"
                    >
                        <SalyIamge className="mx-auto" />
                    </NoDataUI>
                </>
            )}
        </>
    )
}

export default Device;