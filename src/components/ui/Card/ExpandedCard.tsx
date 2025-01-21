import React, { FunctionComponent, SVGProps, useState } from "react";
import Icon from "feather-icons-react";

type Props = {
    children: React.ReactNode;
    firstText: string;
    secondText: string;
    Component: FunctionComponent<SVGProps<SVGSVGElement>>;
}

const ExpandedCard: React.FC<Props> = ({
    children,
    firstText,
    secondText,
    Component
}: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded((prevState) => !prevState);
    };

    return (
        <div>
            <div className={`shadow-card rounded-2xl min-w-[1100px] w-full max-w-[1400px] ${isExpanded ? "h-auto" : "h-24"} flex flex-col py-5 px-6 space-y-5`}>
                <div className="flex items-center space-x-5">
                    <Component className="mt-2" />
                    <div className="flex-grow">
                        <div className={`text-lg font-semibold ${isExpanded ? "text-primary02" : "text-text01"}`}>{firstText}</div>
                        <div className="text-text02">{secondText}</div>
                    </div>
                    <div className="flex items-center cursor-pointer" onClick={toggleExpand}>
                        <Icon icon={isExpanded ? "chevron-up" : "chevron-down"} className="w-6 h-6 text-text01" />
                    </div>
                </div>

                {isExpanded && 
                    children
                }
            </div>
        </div>
    );
};

export default ExpandedCard;
