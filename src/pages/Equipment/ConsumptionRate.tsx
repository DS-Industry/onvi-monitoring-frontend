import Button from "@/components/ui/Button/Button";
import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { getConsumptionRate, getPoses, patchProgramCoefficient } from "@/services/api/equipment";
import { columnsConsumptionRate } from "@/utils/OverFlowTableData";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";

const ConsumptionRate: React.FC = () => {
    const { t } = useTranslation();
    const [searchPosId, setSearchPosId] = useState("");

    const { data: posData } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: consumptionRateData, isLoading: programCoeffsLoading } = useSWR([`get-consumption-rate`], () => getConsumptionRate(1), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { trigger: patchProgramCoeff, isMutating } = useSWRMutation(['patch-program-coeff'],
        async (_, { arg }: { arg: { valueData: { programTechRateId: number; literRate: number; concentration: number; }[] } }) => {
            return patchProgramCoefficient(1, arg);
        });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    // const mockData = [
    //     { id: 1, programTypeName: "Ополаскивание", literRate: "", concentration: "" },
    //     { id: 2, programTypeName: "Активная химия", literRate: "", concentration: "" },
    //     { id: 3, programTypeName: "Вода + шампунь", literRate: "", concentration: "" },
    //     { id: 4, programTypeName: "Мойка дисков", literRate: "", concentration: "" },
    //     { id: 5, programTypeName: "Воск + защита", literRate: "", concentration: "" },
    //     // Add more rows as needed
    // ];

    const [tableData, setTableData] = useState(consumptionRateData);

    useEffect(() => {
        if (consumptionRateData) {
            setTableData(consumptionRateData); // Update state once data is fetched
        }
    }, [consumptionRateData]);

    const handleTableChange = (id: number, key: any, value: any) => {
        setTableData((prevData) =>
            prevData?.map((item) =>
                item.id === id ? { ...item, [key]: value } : item
            )
        );
    };

    const handleSubmit = async () => {
        console.log("Final Task Values:", tableData);

        const programCoeff: { programTechRateId: number; literRate: number; concentration: number; }[] = tableData?.map((data) => ({
            programTechRateId: data.id,
            literRate: Number(data.literRate),
            concentration: Number(data.concentration)
        })) || [];

        console.log("Payload for API:", programCoeff);

        const result = await patchProgramCoeff({
            valueData: programCoeff,
        });

        if (result) {
            mutate([`get-consumption-rate`]);
        }
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
            {programCoeffsLoading ? (
                <TableSkeleton columnCount={columnsConsumptionRate.length} />
            ) :
                <div className="mt-8">
                    <OverflowTable
                        tableData={tableData}
                        columns={columnsConsumptionRate}
                        isDisplayEdit={true}
                        handleChange={handleTableChange}
                    />
                </div>
            }
            <div className="flex space-x-4">
                <Button
                    title={t("organizations.cancel")}
                    type='outline'
                    handleClick={() => { }}
                />
                <Button
                    title={t("organizations.save")}
                    form={true}
                    isLoading={isMutating}
                    handleClick={handleSubmit}
                />
            </div>
        </div>
    )
}

export default ConsumptionRate;