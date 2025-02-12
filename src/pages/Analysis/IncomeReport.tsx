import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import { getPoses } from "@/services/api/equipment";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

const IncomeReport: React.FC = () => {
    const { t } = useTranslation();
    const [pos, setPos] = useState(66);

    const { data: posData } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    return (
        <div className="relative h-screen">
            <Filter count={0} hideSearch={true} hidePage={true}>
                <DropdownInput
                    title={t("marketing.carWash")}
                    value={pos}
                    options={poses}
                    onChange={(value) => setPos(value)}
                    classname="ml-2"
                />
            </Filter>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-text02">
                <div>{t("analysis.there")}</div>
                <div>{t("analysis.you")}</div>
            </div>
        </div>

    )
}

export default IncomeReport;