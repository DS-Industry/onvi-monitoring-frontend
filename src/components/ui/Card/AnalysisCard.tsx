import React from "react";
import Icon from 'feather-icons-react';
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

type Props = {
    iconText: string;
    firstText: string;
    secondText: string;
}

const AnalysisCard: React.FC<Props> = ({
    iconText,
    firstText,
    secondText
}: Props) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="h-[200px] w-[456px] rounded-lg shadow-card flex flex-col justify-between p-4">
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <div className="bg-primary02 h-8 w-8 rounded-3xl flex justify-center items-center">
                        <Icon icon={iconText} className="text-white w-4 h-4" />
                    </div>
                    <div className="font-semibold text-lg text-text01">{firstText}</div>
                </div>
                <hr />
                <div className="text-text02 w-64">{secondText}</div>
            </div>
            <div className="font-semibold text-primary02 mt-auto cursor-pointer" onClick={() => navigate("/analysis/report")}>{t("analysis.to")}</div>
        </div>
    )
}

export default AnalysisCard;