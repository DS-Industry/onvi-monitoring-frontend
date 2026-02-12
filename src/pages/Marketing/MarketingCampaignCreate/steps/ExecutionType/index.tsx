import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, message, Spin } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import {
    RightOutlined,
    SettingOutlined,
    GiftOutlined,
    DollarOutlined,
    PercentageOutlined,
    BankOutlined,
    ScheduleOutlined,
} from '@ant-design/icons';
import { useToast } from '@/components/context/useContext';
import useSWR from 'swr';
import {
    updateMarketingCampaigns,
    MarketingCampaignUpdateDto,
    CampaignExecutionType,
    getMarketingCampaignById,
    createMarketingCampaignAction,
    ACTION_TYPE,
} from '@/services/api/marketing';
import ActionTypeCard from './ActionTypeCard';

interface ExecutionTypeProps {
    isEditable?: boolean;
}

const NEXT_STEP = 3;
const CARD_MIN_HEIGHT = 140;
const CARD_BORDER_RADIUS = 12;
const SELECTED_CARD_STYLE = 'border-primary02 border-2 shadow-md bg-[#F5FBFF]';
const DEFAULT_CARD_STYLE = 'border-gray-200';
const PRIMARY_COLOR = '#0B68E1';

const ACTION_TYPE_CONFIGS = [
    {
        actionType: 'DISCOUNT' as ACTION_TYPE,
        icon: PercentageOutlined,
        titleKey: 'marketingCampaigns.discount',
        descriptionKey: 'marketingCampaigns.discountDescription',
        requiredExecutionType: CampaignExecutionType.TRANSACTIONAL,
    },
    {
        actionType: 'PROMOCODE_ISSUE' as ACTION_TYPE,
        icon: GiftOutlined,
        titleKey: 'marketingCampaigns.promocode',
        descriptionKey: 'marketingCampaigns.promocodeDescription',
        requiredExecutionType: CampaignExecutionType.TRANSACTIONAL,
    },
    {
        actionType: 'CASHBACK_BOOST' as ACTION_TYPE,
        icon: BankOutlined,
        titleKey: 'marketingCampaigns.cashback',
        descriptionKey: 'marketingCampaigns.cashbackDescription',
        requiredExecutionType: CampaignExecutionType.BEHAVIORAL,
    },
    {
        actionType: 'GIFT_POINTS' as ACTION_TYPE,
        icon: DollarOutlined,
        titleKey: 'marketingCampaigns.points',
        descriptionKey: 'marketingCampaigns.pointsDescription',
        requiredExecutionType: CampaignExecutionType.BEHAVIORAL,
    },
] as const;

interface ExecutionTypeCardProps {
    executionType: CampaignExecutionType;
    icon: React.ComponentType<{ style?: React.CSSProperties }>;
    titleKey: string;
    descriptionKey: string;
    isSelected: boolean;
    isDisabled: boolean;
    onClick: () => void;
}

const ExecutionTypeCard: React.FC<ExecutionTypeCardProps> = ({
    executionType,
    icon: Icon,
    titleKey,
    descriptionKey,
    isSelected,
    isDisabled,
    onClick,
}) => {
    const { t } = useTranslation();

    const cardClassName = useMemo(() => {
        const baseClasses = 'transition-all';
        const cursorClass = isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';
        const borderClass = isSelected ? SELECTED_CARD_STYLE : DEFAULT_CARD_STYLE;
        return `${baseClasses} ${cursorClass} ${borderClass}`;
    }, [isSelected, isDisabled]);

    return (
        <Card
            hoverable={!isDisabled}
            onClick={onClick}
            className={cardClassName}
            style={{
                borderRadius: CARD_BORDER_RADIUS,
                minHeight: CARD_MIN_HEIGHT,
            }}
        >
            <div className="flex flex-col items-start">
                <div className="flex items-center">
                    <div
                        className={`w-12 h-12 flex items-center justify-center rounded-lg mb-3 ${executionType === CampaignExecutionType.BEHAVIORAL
                            ? 'bg-primary02/10'
                            : ''
                            }`}
                    >
                        <Icon style={{ fontSize: 24, color: PRIMARY_COLOR }} />
                    </div>
                    <div className="ms-3 font-semibold text-[#0B68E1] text-base mb-2">
                        {t(titleKey)}
                    </div>
                </div>
                <div className="text-base03 text-sm">{t(descriptionKey)}</div>
            </div>
        </Card>
    );
};

const ExecutionType: React.FC<ExecutionTypeProps> = ({ isEditable = true }) => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { showToast } = useToast();
    const [executionType, setExecutionType] = useState<CampaignExecutionType | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [actionType, setActionType] = useState<ACTION_TYPE | null>(null);

    const marketingCampaignId = useMemo(() => {
        const id = searchParams.get('marketingCampaignId');
        return id ? Number(id) : null;
    }, [searchParams]);

    const editMode = useMemo(
        () => searchParams.get('mode') === 'edit',
        [searchParams]
    );

    const {
        data: marketingCampaign,
        isLoading,
        isValidating,
    } = useSWR(
        marketingCampaignId
            ? ['get-marketing-campaign-by-id', marketingCampaignId]
            : null,
        () => getMarketingCampaignById(marketingCampaignId!),
        {
            revalidateOnFocus: false,
        }
    );

    useEffect(() => {
        if (!marketingCampaign) return;

        if (marketingCampaign.executionType) {
            setExecutionType(marketingCampaign.executionType as CampaignExecutionType);
        }

        if (marketingCampaign.actionType) {
            setActionType(marketingCampaign.actionType as ACTION_TYPE);
        }
    }, [marketingCampaign]);

    const isConfigurationLocked = useMemo(
        () => editMode && marketingCampaign?.executionType && marketingCampaign?.actionType,
        [editMode, marketingCampaign]
    );

    const canEdit = useMemo(
        () => !isConfigurationLocked && isEditable,
        [isConfigurationLocked, isEditable]
    );

    const handleExecutionTypeChange = useCallback(
        (newExecutionType: CampaignExecutionType) => {
            if (!canEdit) return;

            if (executionType !== newExecutionType) {
                setActionType(null);
            }
            setExecutionType(newExecutionType);
        },
        [canEdit, executionType]
    );

    const validateForm = useCallback((): boolean => {
        if (!executionType) {
            message.warning(t('validation.executionTypeRequired'));
            return false;
        }

        if (!actionType) {
            message.warning(t('validation.actionTypeRequired'));
            return false;
        }

        return true;
    }, [executionType, actionType, t]);

    const navigateToNextStep = useCallback(() => {
        updateSearchParams(searchParams, setSearchParams, {
            step: NEXT_STEP,
        });
    }, [searchParams, setSearchParams]);

    const handleNext = useCallback(async () => {
        if (editMode && isConfigurationLocked) {
            navigateToNextStep();
            return;
        }

        if (!marketingCampaignId) {
            showToast(t('errors.other.errorDuringFormSubmission'), 'error');
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            setIsUpdating(true);

            const updatePayload: MarketingCampaignUpdateDto = {
                executionType: executionType!,
            };
            await updateMarketingCampaigns(updatePayload, marketingCampaignId);

            await createMarketingCampaignAction({
                campaignId: marketingCampaignId,
                actionType: actionType!,
            });

            showToast(t('tables.SAVED'), 'success');
            navigateToNextStep();
        } catch (error) {
            console.error('Error updating execution type:', error);
            showToast(t('errors.other.errorDuringFormSubmission'), 'error');
        } finally {
            setIsUpdating(false);
        }
    }, [
        editMode,
        isConfigurationLocked,
        marketingCampaignId,
        validateForm,
        executionType,
        actionType,
        showToast,
        t,
        navigateToNextStep,
    ]);

    if (isLoading || isValidating) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-background02 p-6 rounded-lg">
                <Spin size="large" tip={t('common.loading')} />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 sm:space-y-8 lg:space-y-10 bg-background02 p-6 rounded-lg">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary02 flex items-center justify-center rounded-full text-white">
                    <SettingOutlined style={{ fontSize: 24 }} />
                </div>
                <div>
                    <div className="font-bold text-text01 text-2xl">
                        {t('marketingCampaigns.actionType')}
                    </div>
                    <div className="text-base03 text-md">
                        {t('marketingCampaigns.actionTypeDescription')}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 mt-6">
                <div>
                    <div className="text-text01 text-sm font-semibold mb-4">
                        {t('marketingCampaigns.triggerType')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ExecutionTypeCard
                            executionType={CampaignExecutionType.TRANSACTIONAL}
                            icon={BankOutlined}
                            titleKey="marketingCampaigns.transactional"
                            descriptionKey="marketingCampaigns.transactionalDescription"
                            isSelected={executionType === CampaignExecutionType.TRANSACTIONAL}
                            isDisabled={!canEdit}
                            onClick={() =>
                                handleExecutionTypeChange(CampaignExecutionType.TRANSACTIONAL)
                            }
                        />

                        <ExecutionTypeCard
                            executionType={CampaignExecutionType.BEHAVIORAL}
                            icon={ScheduleOutlined}
                            titleKey="marketingCampaigns.behavioral"
                            descriptionKey="marketingCampaigns.behavioralDescription"
                            isSelected={executionType === CampaignExecutionType.BEHAVIORAL}
                            isDisabled={true}
                            onClick={() => {
                                return
                                handleExecutionTypeChange(CampaignExecutionType.BEHAVIORAL)
                            }}
                        />
                    </div>
                </div>

                <div>
                    <div className="text-text01 text-sm font-semibold mb-4">
                        {t('marketingCampaigns.actionType')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {ACTION_TYPE_CONFIGS.map((config) => (
                            <ActionTypeCard
                                key={config.actionType}
                                actionType={config.actionType}
                                icon={config.icon}
                                titleKey={config.titleKey}
                                descriptionKey={config.descriptionKey}
                                requiredExecutionType={config.requiredExecutionType}
                                selectedActionType={actionType}
                                executionType={executionType}
                                isEditable={canEdit}
                                onSelect={setActionType}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {(isEditable || editMode) && (
                <div className="flex justify-end gap-2 mt-6">

                    <Button
                        type="primary"
                        icon={<RightOutlined />}
                        iconPosition="end"
                        loading={isUpdating}
                        onClick={handleNext}
                    >
                        {t('common.next')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ExecutionType;

