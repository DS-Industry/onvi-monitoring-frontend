import { useFilterOn } from "@/components/context/useContext";
import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import { getPoses } from "@/services/api/equipment";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import Icon from "feather-icons-react";
import { usePosType } from "@/hooks/useAuthStore";

const IncomeReport: React.FC = () => {
    const { t } = useTranslation();
    const posType = usePosType();
    const [pos, setPos] = useState(posType);
    const { filterOn } = useFilterOn();

    const { data: posData } = useSWR([`get-pos`], () => getPoses(), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true
    });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    return (
        <div>
            <Filter count={0} hideSearch={true} hidePage={true}>
                <DropdownInput
                    title={t("marketing.carWash")}
                    value={pos}
                    options={poses}
                    onChange={(value) => setPos(value)}
                    classname="ml-2"
                />
            </Filter>

            {/* Progress bar shown only when filterOn is true */}
            {filterOn ? (
                <div className="w-full flex flex-col space-y-4 items-center justify-center py-4">
                    {/* Tailwind Spinner */}
                    <div className="bg-primary02 h-16 w-16 rounded-full flex justify-center items-center">
                        <Icon icon="file-text" className="text-white w-10 h-10" />
                    </div>
                    <p className="text-text02 mt-2">Your request is being processed and report is being generating.</p>
                    <div className="w-full h-1 bg-gray-200 relative overflow-hidden">
                        <div className="absolute left-0 top-0 h-full w-1/3 bg-primary02 animate-[progressMove_1.5s_linear_infinite]"></div>
                    </div>
                </div>
            )
                :
                <div className="flex flex-col items-center justify-center mt-40 text-text02">
                    <div>{t("analysis.there")}</div>
                    <div>{t("analysis.you")}</div>
                </div>
            }
        </div>
    );
}

export default IncomeReport;
