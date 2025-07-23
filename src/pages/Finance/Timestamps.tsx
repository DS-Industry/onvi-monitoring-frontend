import Button from "@/components/ui/Button/Button";
import SearchDropdownInput from "@/components/ui/Input/SearchDropdownInput";
import { getPoses } from "@/services/api/equipment";
import { getTimestamp, postTimestamp } from "@/services/api/finance";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { Table } from "antd";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import { updateSearchParams } from "@/utils/updateSearchParams";


type TimestampResponse = {
    deviceId: number;
    deviceName: string;
    oldTookMoneyTime?: Date;
    tookMoneyTime?: Date;
}

type TimestampBody = {
    dateTimeStamp: Date;
}


const Timestamps: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const posId = searchParams.get("posId");
    const [disabledButtons, setDisabledButtons] = useState<{ [key: number]: boolean }>({});
    const city = searchParams.get("city") || "*";

    const { data: posData } = useSWR(
        [`get-pos`, city],
        () => getPoses({ placementId: city }),
        { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
    );

    const poses: { name: string; value: number }[] = posData?.map((item) => ({
        name: item.name,
        value: item.id,
    })) || [];

    const { data: timestampData, isLoading, mutate } = useSWR<TimestampResponse[]>(
        posId !== "*" && posId ? [`get-timestamp`, posId] : null,
        () => getTimestamp(Number(posId)),
        { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
    );

    const { trigger: postTime } = useSWRMutation(
        ['post-timestamp'],
        async (_, { arg }: { arg: { body: TimestampBody; id: number } }) => {
            return postTimestamp(arg.body, arg.id);
        }
    );

    const handleBegin = async (deviceId: number) => {
        try {
            const body = { dateTimeStamp: new Date() }; // Send current timestamp
            const response = await postTime({ body, id: deviceId });

            if (response) {
                setDisabledButtons((prev) => ({ ...prev, [deviceId]: true }));
            }

            mutate((prevData) => {
                if (!prevData) return prevData;
                return prevData.map((item) =>
                    item.deviceId === deviceId ? { ...item, tookMoneyTime: response.tookMoneyTime } : item
                );
            }, false);

        } catch (error) {
            console.error("Error in postTimestamp:", error);
        }
    };

    const columnsTimestamp = [
        {
            title: "Устройство",
            dataIndex: "deviceName",
            key: "deviceName"
        },
        {
            title: "Инкассация",
            key: "begin",
            render: (_: any, record: TimestampResponse) => (
                <div className="flex justify-start">
                    <Button
                        title="Проинкассировал"
                        classname="border border-successFill rounded px-2 py-2 text-successFill hover:border-successFill/80 hover:text-successFill/80"
                        type="outline"
                        handleClick={() => handleBegin(record.deviceId)}
                        disabled={disabledButtons[record.deviceId]}
                    />
                </div>
            )
        },
        {
            title: "Дата предыдущей инкасации",
            dataIndex: "oldTookMoneyTime",
            key: "oldTookMoneyTime",
            render: (val: Date) => val ? dayjs(val).format("DD.MM.YYYY HH:mm:ss") : "-"
        },
        {
            title: "Дата текущей инкассации",
            dataIndex: "tookMoneyTime",
            key: "tookMoneyTime",
            render: (val: Date) => val ? dayjs(val).format("DD.MM.YYYY HH:mm:ss") : "-"
        }
    ];

    // 🧩 Prepare table data
    const timestamps = timestampData?.map((item) => ({
        ...item,
        id: item.deviceId, // ensure rowKey
    })) || [];

    return (
        <div>
            <SearchDropdownInput
                title={t("finance.carWash")}
                options={poses}
                classname="w-64"
                value={Number(posId)}
                onChange={(value) =>
                    updateSearchParams(searchParams, setSearchParams, {
                        posId: value
                    })
                }
                allowClear={true}
            />

            <div className="mt-8">
                <Table
                    dataSource={timestamps.sort((a, b) => a.deviceId - b.deviceId)}
                    columns={columnsTimestamp}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    loading={isLoading}
                />
            </div>
        </div>
    );
};

export default Timestamps;
