import Button from "@/components/ui/Button/Button";
import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import NoDataUI from "@/components/ui/NoDataUI";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { getConsumptionRate, getPoses, patchProgramCoefficient } from "@/services/api/equipment";
import { columnsConsumptionRate } from "@/utils/OverFlowTableData";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import SalyImage from "@/assets/NoEquipment.png"
import { useCity, usePosType } from "@/hooks/useAuthStore";

const ConsumptionRate: React.FC = () => {
    const { t } = useTranslation();
    const posType = usePosType();
    const [searchPosId, setSearchPosId] = useState(posType);
    const city = useCity();

    const { data: posData } = useSWR([`get-pos`], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: consumptionRateData, isLoading: programCoeffsLoading } = useSWR([`get-consumption-rate`, searchPosId], () => getConsumptionRate(searchPosId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { trigger: patchProgramCoeff, isMutating } = useSWRMutation(['patch-program-coeff', searchPosId],
        async (_, { arg }: { arg: { valueData: { programTechRateId: number; literRate: number; concentration: number; }[] } }) => {
            return patchProgramCoefficient(searchPosId, arg);
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

    const handleTableChange = (id: number, key: string, value: string | number) => {
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
            mutate([`get-consumption-rate`, searchPosId]);
        }
    };

    return (
        <div>
            <Filter count={tableData?.length !== undefined ? tableData?.length : 0}>
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
                tableData && tableData.length > 0 ?
                <div className="mt-8">
                    <OverflowTable
                        tableData={tableData}
                        columns={columnsConsumptionRate}
                        handleChange={handleTableChange}
                    />
                </div> :
                <NoDataUI
                title={t("chemical.noText")}
                description={t("chemical.dont")}
            >
                <img src={SalyImage} className="mx-auto" />
            </NoDataUI>
            }
            {tableData && tableData.length > 0 && <div className="flex mt-4 space-x-4">
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
            </div> }
        </div>
    )
}

export default ConsumptionRate;