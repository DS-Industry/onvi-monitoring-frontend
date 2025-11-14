import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import ConditionCard from '../../components/ConditionCard';
import {
    MarketingCampaignConditionResponseDto,
    MarketingCampaignConditionType,
} from '@/services/api/marketing';

interface ConditionTypeOption {
    label: string;
    value: MarketingCampaignConditionType;
}

interface ConditionsSectionProps {
    isLoading: boolean;
    isValidating: boolean;
    conditions?: MarketingCampaignConditionResponseDto[];
    conditionTypes: ConditionTypeOption[];
    hasPromocodeCondition: boolean;
    deletingConditionId: number | null;
    onOpenModal: () => void;
    onDelete: (conditionId: number, index: number) => void;
}

const SKELETON_COUNT = 3;
const SKELETON_WIDTH = 208;
const SKELETON_HEIGHT = 96;

const ConditionsSection: React.FC<ConditionsSectionProps> = ({
    isLoading,
    isValidating,
    conditions,
    conditionTypes,
    hasPromocodeCondition,
    deletingConditionId,
    onOpenModal,
    onDelete,
}) => {
    const { t } = useTranslation();

    if (isLoading || isValidating) {
        return (
            <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                    <div className="flex items-center justify-center h-24 text-lg font-semibold">
                        {t('marketingCampaigns.if')}
                    </div>

                    <div className="flex flex-wrap gap-3 flex-1">
                        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                            <React.Fragment key={index}>
                                <Skeleton
                                    active
                                    title={false}
                                    paragraph={{ rows: 2, width: ['100%', '60%'] }}
                                    style={{
                                        width: SKELETON_WIDTH,
                                        height: SKELETON_HEIGHT,
                                        borderRadius: 12,
                                    }}
                                />
                                {index < SKELETON_COUNT - 1 && (
                                    <div className="flex items-center justify-center text-primary02 font-semibold">
                                        {t('common.and')}
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-3">
                <div className="flex items-center justify-center h-24 text-lg font-semibold">
                    {t('marketingCampaigns.if')}
                </div>

                <div className="flex flex-wrap gap-3 flex-1">
                    {conditions && conditions.length > 0
                        ? conditions.map((cond, index) => (
                            <ConditionCard
                                key={cond.id}
                                condition={cond}
                                index={index}
                                totalConditions={conditions.length}
                                conditionTypes={conditionTypes}
                                onDelete={onDelete}
                                isDeleting={deletingConditionId === cond.id}
                            />
                        ))
                        : null}

                    {!hasPromocodeCondition && (
                        <div
                            onClick={onOpenModal}
                            className="flex items-center justify-center h-24"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onOpenModal();
                                }
                            }}
                        >
                            <PlusOutlined
                                style={{ fontSize: 18 }}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-background05 cursor-pointer hover:bg-background04 transition"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConditionsSection;

