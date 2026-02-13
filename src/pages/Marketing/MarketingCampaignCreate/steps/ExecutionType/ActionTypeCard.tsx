import React from 'react';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { CampaignExecutionType, ACTION_TYPE } from '@/services/api/marketing';

interface ActionTypeCardProps {
    actionType: ACTION_TYPE;
    icon: React.ComponentType<{ style?: React.CSSProperties }>;
    titleKey: string;
    descriptionKey: string;
    requiredExecutionType: CampaignExecutionType;
    selectedActionType: ACTION_TYPE | null;
    executionType: CampaignExecutionType | null;
    isEditable: boolean;
    onSelect: (actionType: ACTION_TYPE) => void;
    forceDisabled?: boolean;
    forceDisabledMessageKey?: string;
}

const ActionTypeCard: React.FC<ActionTypeCardProps> = ({
    actionType,
    icon,
    titleKey,
    descriptionKey,
    requiredExecutionType,
    selectedActionType,
    executionType,
    isEditable,
    onSelect,
    forceDisabled = false,
    forceDisabledMessageKey,
}) => {
    const { t } = useTranslation();

    const isSelected = selectedActionType === actionType;
    const isEnabledByExecutionType =
        executionType === CampaignExecutionType.BEHAVIORAL || executionType === requiredExecutionType;
    const isDisabled =
        forceDisabled || !executionType || !isEnabledByExecutionType;

    const handleClick = () => {
        if (forceDisabled) return;
        if (!executionType) return;
        if (!isEnabledByExecutionType) return;
        if (isEditable) {
            onSelect(actionType);
        }
    };

    const borderColor = isSelected
        ? 'border-primary02 border-2 shadow-md bg-[#F5FBFF]'
        : isDisabled
            ? 'border-[#7A7D86] border-2 shadow-md bg-[#F5FBFF]'
            : 'border-gray-200';

    const iconColor = isDisabled ? '#7A7D86' : '#0B68E1';
    const textColor = isDisabled ? 'text-[#7A7D86]' : 'text-[#0B68E1]';

    const cursorClass = isDisabled ? 'cursor-not-allowed opacity-60' : isEditable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60';

    return (
        <Card
            hoverable={!isDisabled}
            onClick={handleClick}
            className={`transition-all ${borderColor} ${cursorClass}`}
            style={{
                borderRadius: 12,
                minHeight: 140,
            }}
        >
            <div className="flex justify-center w-full">
                <div className="flex items-center space-x-3">
                    {React.createElement(icon, { style: { fontSize: 24, color: iconColor } })}
                    <div className={`font-semibold ${textColor} text-lg`}>
                        {t(titleKey)}
                    </div>
                </div>
            </div>
            <div className="text-base03 text-sm mt-4 text-center">
                {t(descriptionKey)}
            </div>
            {forceDisabled && forceDisabledMessageKey && (
                <div className="text-[#7A7D86] text-xs mt-2 text-center">
                    {t(forceDisabledMessageKey)}
                </div>
            )}
        </Card>
    );
};

export default ActionTypeCard;

