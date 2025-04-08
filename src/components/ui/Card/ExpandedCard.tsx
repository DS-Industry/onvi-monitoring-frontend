import React, { FunctionComponent, SVGProps, useState } from "react";
import Icon from "feather-icons-react";
import Button from "../Button/Button";
import { useTranslation } from "react-i18next";

type Props = {
    children: React.ReactNode;
    firstText: string;
    secondText: string;
    Component: FunctionComponent<SVGProps<SVGSVGElement>>;
    handleClick?: () => void;
    buttonText?: string;
};

const ExpandedCard: React.FC<Props> = ({
    children,
    firstText,
    secondText,
    Component,
    handleClick,
    buttonText
}: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(prev => !prev);

    const { t } = useTranslation();

    return (
        <div className="w-full px-4 sm:px-6">
            <div className={`shadow-card rounded-2xl w-full ${isExpanded ? "h-auto" : "min-h-[6rem]"} flex flex-col py-5 px-4 md:px-6 space-y-5 max-w-full md:max-w-[1400px]`}>
                <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center sm:space-x-5 space-y-2 sm:space-y-0 overflow-visible">
                    <Component className="w-6 h-6 sm:mt-2" />
                    <div className="flex-grow">
                        <div className={`text-lg font-semibold ${isExpanded ? "text-primary02" : "text-text01"}`}>
                            {firstText}
                        </div>
                        <div className="text-text02">{secondText}</div>
                    </div>
                    <div
                        className="flex items-center justify-end sm:justify-start cursor-pointer self-start sm:self-center"
                        onClick={toggleExpand}
                    >
                        <Icon
                            icon={isExpanded ? "chevron-up" : "chevron-down"}
                            className="w-6 h-6 text-text01"
                        />
                    </div>
                </div>

                {isExpanded && children}

                {isExpanded && (
                    <div className="pl-0 sm:pl-14 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        {handleClick && (<Button
                            title={buttonText || t("organizations.save")}
                            handleClick={handleClick}
                        />)}
                        <Button
                            title={t("marketing.close")}
                            type="outline"
                            handleClick={toggleExpand}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpandedCard;
