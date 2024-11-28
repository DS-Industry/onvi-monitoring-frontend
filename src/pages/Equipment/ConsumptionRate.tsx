import Button from "@/components/ui/Button/Button";
import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { getPoses } from "@/services/api/equipment";
import { columnsConsumptionRate } from "@/utils/OverFlowTableData";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

const ConsumptionRate: React.FC = () => {
    const { t } = useTranslation();
    const [searchPosId, setSearchPosId] = useState("");

    const { data: posData } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const mockData = [
        { id: 1, programTypeName: "Ополаскивание", literRate: "", concentration: "" },
        { id: 2, programTypeName: "Активная химия", literRate: "", concentration: "" },
        { id: 3, programTypeName: "Вода + шампунь", literRate: "", concentration: "" },
        { id: 4, programTypeName: "Мойка дисков", literRate: "", concentration: "" },
        { id: 5, programTypeName: "Воск + защита", literRate: "", concentration: "" },
        // Add more rows as needed
    ];

    const [tableData, setTableData] = useState(mockData);

    const handleTableChange = (id: number, key: any, value: any) => {
        setTableData((prevData) =>
            prevData.map((item) =>
                item.id === id ? { ...item, [key]: value } : item
            )
        );
    };

    return (
        <div>
            <Filter count={10}>
                <DropdownInput
                    title={t("equipment.carWash")}
                    value={searchPosId}
                    classname="ml-2"
                    options={poses}
                    onChange={(value) => setSearchPosId(value)}
                />
            </Filter>
            <div className="mt-8">
                <OverflowTable
                    tableData={tableData}
                    columns={columnsConsumptionRate}
                    isDisplayEdit={true}
                    handleChange={handleTableChange}
                />
            </div>
            <div className="flex space-x-4">
                <Button
                    title={t("organizations.cancel")}
                    type='outline'
                    handleClick={() => { }}
                />
                <Button
                    title={t("organizations.save")}
                    form={true}
                    handleClick={() => console.log("Saving Data:", tableData)}
                />
            </div>
        </div>
    )
}

export default ConsumptionRate;