import Button from "@/components/ui/Button/Button";
import Filter from "@/components/ui/Filter/Filter";
import NoDataUI from "@/components/ui/NoDataUI";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { getConsumptionRate, getPoses, patchProgramCoefficient } from "@/services/api/equipment";
import { columnsConsumptionRate } from "@/utils/OverFlowTableData";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import SalyImage from "@/assets/NoEquipment.png"
import { useCity, usePosType } from "@/hooks/useAuthStore";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import { Select } from "antd";

const ConsumptionRate: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    const posType = usePosType();
    const [searchPosId, setSearchPosId] = useState(posType);
    const city = useCity();

    const { data: posData } = useSWR([`get-pos`], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: consumptionRateData, isLoading: programCoeffsLoading } = useSWR(
        searchPosId !== "*" ? [`get-consumption-rate`, searchPosId] : null, 
        () => getConsumptionRate(searchPosId), 
        { 
            revalidateOnFocus: false, 
            revalidateOnReconnect: false, 
            keepPreviousData: true 
        });

    const { trigger: patchProgramCoeff, isMutating } = useSWRMutation(['patch-program-coeff', searchPosId],
        async (_, { arg }: { arg: { valueData: { programTechRateId: number; literRate: number; concentration: number; }[] } }) => {
            return patchProgramCoefficient(searchPosId, arg);
        });

    const poses: { name: string; value: number | string; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const posesAllObj = {
        name: allCategoriesText,
        value: "*"
      };
    
      poses.unshift(posesAllObj);

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
            const sortedData = [...consumptionRateData].sort((a, b) =>
                a.programTypeName.localeCompare(b.programTypeName)
            );
            setTableData(sortedData);
        }
    }, [consumptionRateData]);

    useEffect(() => {
        if (consumptionRateData) {
            const sortedData = [...consumptionRateData].sort((a, b) =>
                a.programTypeName.localeCompare(b.programTypeName)
            );
            setTableData(sortedData); // Update state with sorted data
        }
    }, [consumptionRateData]);

    const handleTableChange = (id: number, key: string, value: string | number) => {
        setTableData((prevData) => {
            const updatedData = prevData?.map((item) =>
                item.id === id ? { ...item, [key]: value } : item
            );

            return updatedData?.sort((a, b) => a.programTypeName.localeCompare(b.programTypeName));
        });
    };


    const handleSubmit = async () => {

        const hasNegativeValues = tableData && tableData.some((data) => data.literRate < 0 || data.concentration < 0);

        if (hasNegativeValues) {
            return; // Stop execution if there are negative values
        }

        const programCoeff: { programTechRateId: number; literRate: number; concentration: number; }[] = tableData?.map((data) => ({
            programTechRateId: data.id,
            literRate: Number(data.literRate),
            concentration: Number(data.concentration)
        })) || [];

        const result = await patchProgramCoeff({
            valueData: programCoeff,
        });

        if (result) {
            mutate([`get-consumption-rate`, searchPosId]);
        }
    };

    return (
        <div>
            <Filter count={tableData?.length !== undefined ? tableData?.length : 0} hideCity={true} hideDateTime={true} hidePage={true} hideSearch={true} hideCancel={true}>
                <div>
                    <div className="text-sm text-text02">{t("equipment.carWash")}</div>
                    <Select
                        className="w-full sm:w-80 h-10"
                        options={poses.map((item) => ({ label: item.name, value: item.value }))}
                        value={searchPosId}
                        onChange={(value) => setSearchPosId(value)}
                    />
                </div>
            </Filter>
            {programCoeffsLoading ? (
                <TableSkeleton columnCount={columnsConsumptionRate.length} />
            ) :
                tableData && tableData.length > 0 ?
                    <div className="mt-8">
                        <DynamicTable
                            data={tableData}
                            columns={columnsConsumptionRate}
                            handleChange={handleTableChange}
                        />
                    </div> :
                    <NoDataUI
                        title={t("chemical.noText")}
                        description={t("chemical.dont")}
                    >
                        <img src={SalyImage} className="mx-auto" loading="lazy" />
                    </NoDataUI>
            }
            {tableData && tableData.length > 0 && <div className="flex mt-4 space-x-4">
                <Button
                    title={t("organizations.cancel")}
                    type='outline'
                    handleClick={() => { }}
                    classname="w-[168px]"
                />
                <Button
                    title={t("organizations.save")}
                    form={true}
                    isLoading={isMutating}
                    handleClick={handleSubmit}
                    classname="w-[168px]"
                />
            </div>}
        </div>
    )
}

export default ConsumptionRate;