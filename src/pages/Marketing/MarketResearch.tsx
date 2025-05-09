import NoDataUI from "@/components/ui/NoDataUI";
import React from "react";
import { useTranslation } from "react-i18next";
import SalyIamge from "@/assets/Saly-11.png";
import PieChartCard from "@ui/PieChart/PieChartCard";

const MarketResearch: React.FC = () => {
    const { t } = useTranslation();

    const hasData = true; 

    return (
        <div className="flex flex-col justify-center items-center">
            {hasData ? (
                <PieChartCard />
            ) : (
                <NoDataUI
                    title={t("marketing.nodata")}
                    description={t("marketing.filter")}
                >
                    <img src={SalyIamge} className="mx-auto" loading="lazy" />
                </NoDataUI>
            )}
        </div>
    );
};

export default MarketResearch;