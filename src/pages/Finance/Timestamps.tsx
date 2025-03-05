import Button from "@/components/ui/Button/Button";
import SearchDropdownInput from "@/components/ui/Input/SearchDropdownInput";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useCity, usePosType } from "@/hooks/useAuthStore";
import { getPoses } from "@/services/api/equipment";
import { getTimestamp, postTimestamp } from "@/services/api/finance";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

type TimestampResponse = {
    deviceId: number;
    deviceName: string;
    oldTookMoneyTime?: Date;
}

type TimestampBody = {
    dateTimeStamp: Date;
}


const Timestamps: React.FC = () => {
    const { t } = useTranslation();
    const posType = usePosType();

    const [posId, setPosId] = useState(posType);
    const [disabledButtons, setDisabledButtons] = useState<{ [key: number]: boolean }>({});
    const city = useCity();

    const { data: posData } = useSWR([`get-pos`], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const columnsTimestamp = [
        {
            label: "Устройство",
            key: "deviceName"
        },
        {
            label: "Инкассация",
            key: "Begin",
            render: (row: { deviceId: number }) => (
                <div className="flex justify-end">
                    <Button
                        title="Проинкассировал"
                        classname="border border-successFill rounded px-2 py-2 text-successFill hover:border-successFill/80 hover:text-successFill/80"
                        type="outline"
                        handleClick={() => {
                            handleBegin(row.deviceId);
                        }}
                        disabled={disabledButtons[row.deviceId]}
                    />
                </div>
            ),
        },
        {
            label: "Дата предыдущей инкасации",
            key: "oldTookMoneyTime",
            type: "date"
        },
        {
            label: "Дата текущей Инкасции",
            key: "tookMoneyTime",
            type: "date"
        }
    ];

    const { data: timestampData, isLoading, mutate } = useSWR([`get-timestamp`, posId], () => getTimestamp(posId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { trigger: postTime } = useSWRMutation(
        ['post-timestamp'],
        async (_, { arg }: { arg: { body: TimestampBody; id: number } }) => {
            return postTimestamp(arg.body, arg.id);
        }
    );

    const handleBegin = async (deviceId: number) => {
        try {
            const body = { dateTimeStamp: new Date() }; // Send current timestamp
            const response = await postTime({ body, id: deviceId }); // Call API

            if(response) {
                setDisabledButtons((prev) => ({ ...prev, [deviceId]: true }));
            }

            // Update SWR cache manually without refetching
            mutate((prevData: TimestampResponse[] | undefined) => {
                if (!prevData) return prevData; // If no previous data, return as is

                return prevData.map((item) =>
                    item.deviceId === deviceId ? { ...item, tookMoneyTime: response.tookMoneyTime } : item
                );
            }, false); // false prevents SWR from refetching

        } catch (error) {
            console.error("Error in postTimestamp:", error);
        }
    };

    return (
        <div>
            <SearchDropdownInput
                title={t("finance.carWash")}
                options={poses}
                classname="w-64"
                value={posId}
                onChange={(value) => setPosId(value)}
            />
            <div className="mt-8">
                {isLoading ?
                    <TableSkeleton columnCount={columnsTimestamp.length} />
                    :
                    <OverflowTable
                        tableData={timestampData?.sort((a, b) => a.deviceId - b.deviceId)}
                        columns={columnsTimestamp}
                    />
                }
            </div>
        </div>
    )
}

export default Timestamps;