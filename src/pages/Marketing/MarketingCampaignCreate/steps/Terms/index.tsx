import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Modal } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import ConditionModal from './ConditionModal';
import ConditionsSection from './ConditionsSection';
import RewardSection from './RewardSection';
import ActionButtons from './ActionButtons';

import { CheckOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import {
    getMarketingConditionsById,
    createNewMarketingConditions,
    deleteMarketingCondition,
    MarketingCampaignConditionType,
    CreateMarketingCampaignConditionDto,
    updateMarketingCampaignAction,
    createPromocode,
    PromocodeType,
    getMarketingCampaignById,
    ACTION_TYPE,
} from '@/services/api/marketing';
import { useToast } from '@/components/context/useContext';
import { getFilteredConditionTypes } from '../../utils/conditionTypes';
import { useRewardInitialization } from './useRewardInitialization';

type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

interface Condition {
    type?: MarketingCampaignConditionType;
    value?: any;
}

const MIN_PERCENTAGE = 0;
const MAX_PERCENTAGE = 100;

const buildConditionPayload = (
    conditionType: MarketingCampaignConditionType,
    value: any,
    promocodeId?: number
): CreateMarketingCampaignConditionDto => {
    const payload: CreateMarketingCampaignConditionDto = {
        type: conditionType,
    };

    switch (conditionType) {
        case MarketingCampaignConditionType.TIME_RANGE:
            payload.startTime = value?.start;
            payload.endTime = value?.end;
            break;

        case MarketingCampaignConditionType.WEEKDAY:
            payload.weekdays = value;
            break;

        case MarketingCampaignConditionType.VISIT_COUNT:
            payload.visitCount = Number(value);
            break;

        case MarketingCampaignConditionType.PURCHASE_AMOUNT:
            if (typeof value === 'object') {
                payload.minAmount = value.minAmount;
                payload.maxAmount = value.maxAmount;
            } else {
                payload.minAmount = Number(value);
            }
            break;

        case MarketingCampaignConditionType.PROMOCODE_ENTRY:
            payload.promocodeId = promocodeId;
            break;

        case MarketingCampaignConditionType.BIRTHDAY:
            break;
    }

    return payload;
};

const buildActionPayload = (
    actionType: ACTION_TYPE,
    discountType: DiscountType,
    rewardValue: number
): Record<string, any> => {
    switch (actionType) {
        case 'DISCOUNT':
            return {
                discountType,
                discountValue: rewardValue,
            };

        case 'CASHBACK_BOOST':
            return discountType === 'PERCENTAGE'
                ? { percentage: rewardValue }
                : { multiplier: rewardValue };

        case 'GIFT_POINTS':
            return {
                points: Math.floor(rewardValue),
            };

        default:
            return {};
    }
};

const Terms: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCondition, setCurrentCondition] = useState<Condition>({});
    const [isLoadingCondition, setIsLoadingCondition] = useState(false);
    const [deletingConditionId, setDeletingConditionId] = useState<number | null>(null);
    const [isUpdatingData, setIsUpdatingData] = useState(false);
    const [modal, contextHolder] = Modal.useModal();
    const { showToast } = useToast();

    const marketingCampaignId = searchParams.get('marketingCampaignId')
        ? Number(searchParams.get('marketingCampaignId'))
        : null;

    const editMode = searchParams.get('mode') === 'edit';
    const currentStep = Number(searchParams.get('step')) || 1;

    const {
        data: marketingCampaign,
        mutate: mutateCampaign,
        isLoading: isLoadingMarketingCampaign,
    } = useSWR(
        marketingCampaignId
            ? ['get-marketing-campaign-by-id', marketingCampaignId]
            : null,
        () => getMarketingCampaignById(marketingCampaignId!),
        {
            revalidateOnFocus: false,
        }
    );

    const actionType = marketingCampaign?.actionType as ACTION_TYPE | undefined;

    const {
        rewardValue,
        discountType,
        initialRewardValue,
        initialDiscountType,
        setRewardValue,
        setDiscountType,
        setInitialRewardValue,
        setInitialDiscountType,
    } = useRewardInitialization(marketingCampaign, actionType);

    const {
        data: marketingConditions,
        mutate: refreshConditions,
        isLoading,
        isValidating,
    } = useSWR(
        marketingCampaignId
            ? ['get-marketing-conditions-by-id', marketingCampaignId]
            : null,
        () => getMarketingConditionsById(marketingCampaignId!),
        { revalidateOnFocus: false }
    );

    const conditionTypes = getFilteredConditionTypes(actionType, t);

    const hasPromocodeCondition = Boolean(
        actionType === 'PROMOCODE_ISSUE' &&
        marketingConditions?.conditions?.some(
            (cond) => cond.type === MarketingCampaignConditionType.PROMOCODE_ENTRY
        )
    );

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleApply = useCallback(
        async (condition?: Condition) => {
            if (!marketingCampaignId) {
                message.error(t('errors.other.errorDuringFormSubmission'));
                return;
            }

            setIsLoadingCondition(true);
            const conditionToUse = condition || currentCondition;

            if (!conditionToUse.type) {
                message.warning(t('validation.conditionTypeRequired'));
                setIsLoadingCondition(false);
                return;
            }

            try {
                let promocodeId: number | undefined;

                if (conditionToUse.type === MarketingCampaignConditionType.PROMOCODE_ENTRY) {
                    const promocodeData = conditionToUse.value;

                    if (
                        !promocodeData?.code ||
                        !promocodeData?.discountValue ||
                        !promocodeData?.maxUsagePerUser
                    ) {
                        message.warning(
                            t('validation.promocodeFieldsRequired')
                        );
                        setIsLoadingCondition(false);
                        return;
                    }

                    const promocodeResponse = await createPromocode({
                        campaignId: marketingCampaignId,
                        code: promocodeData.code,
                        promocodeType: PromocodeType.CAMPAIGN,
                        discountType: promocodeData.discountType,
                        discountValue: promocodeData.discountValue
                            ? Number(promocodeData.discountValue)
                            : undefined,
                        maxUsagePerUser: promocodeData.maxUsagePerUser
                            ? Number(promocodeData.maxUsagePerUser)
                            : undefined,
                    });

                    promocodeId = promocodeResponse.id;
                }

                const payload = buildConditionPayload(
                    conditionToUse.type,
                    conditionToUse.value,
                    promocodeId
                );

                await createNewMarketingConditions(payload, marketingCampaignId);
                await mutateCampaign();
                showToast(t('tables.SAVED'), 'success');
                setCurrentCondition({});
                setIsModalOpen(false);
                refreshConditions();
            } catch (err) {
                console.error('Error creating condition:', err);
                message.error(t('common.somethingWentWrong'));
            } finally {
                setIsLoadingCondition(false);
            }
        },
        [marketingCampaignId, currentCondition, mutateCampaign, showToast, t, refreshConditions]
    );

    const handleDelete = useCallback(
        (conditionId: number, index: number) => {
            modal.confirm({
                title: t('common.title'),
                content: t('common.content'),
                okText: t('common.okText'),
                okType: 'danger',
                cancelText: t('common.cancel'),
                async onOk() {
                    try {
                        setDeletingConditionId(conditionId);
                        await deleteMarketingCondition(conditionId, index);
                        await mutateCampaign();
                        showToast(t('success.recordDeleted'), 'success');
                        refreshConditions();
                    } catch (err) {
                        console.error('Error deleting condition:', err);
                        message.error(t('marketing.errorCampaign'));
                    } finally {
                        setDeletingConditionId(null);
                    }
                },
                onCancel() {
                    showToast(t('info.deleteCancelled'), 'info');
                },
            });
        },
        [modal, t, mutateCampaign, showToast, refreshConditions]
    );

    const validateRewardValue = (): boolean => {
        if (!rewardValue || rewardValue <= 0) {
            message.warning(
                t('validation.rewardValueRequired') || 'Please enter a reward value'
            );
            return false;
        }

        if (
            actionType === 'CASHBACK_BOOST' &&
            discountType === 'PERCENTAGE' &&
            (rewardValue < MIN_PERCENTAGE || rewardValue > MAX_PERCENTAGE)
        ) {
            message.warning(
                t('validation.percentageRange') ||
                'Percentage must be between 0 and 100'
            );
            return false;
        }

        return true;
    };

    const hasRewardValueChanged = (): boolean => {
        if (!editMode) return true;

        if (actionType === 'DISCOUNT' || actionType === 'CASHBACK_BOOST') {
            return (
                rewardValue !== initialRewardValue ||
                discountType !== initialDiscountType
            );
        }

        return rewardValue !== initialRewardValue;
    };

    const navigateToNextStep = () => {
        updateSearchParams(searchParams, setSearchParams, {
            step: currentStep + 1,
        });
    };

    const handleSaveReward = async () => {
        if (!marketingCampaignId || !actionType) return;

        if (editMode && !hasRewardValueChanged()) {
            navigateToNextStep();
            return;
        }

        if (!validateRewardValue()) {
            return;
        }

        try {
            setIsUpdatingData(true);

            const payload = buildActionPayload(actionType, discountType, rewardValue);

            await updateMarketingCampaignAction(marketingCampaignId, {
                actionType,
                payload,
            });

            setInitialRewardValue(rewardValue);
            if (actionType === 'DISCOUNT' || actionType === 'CASHBACK_BOOST') {
                setInitialDiscountType(discountType);
            }

            navigateToNextStep();
            showToast(t('tables.SAVED'), 'success');
        } catch (error) {
            console.error('Error updating campaign action:', error);
            showToast(t('common.somethingWentWrong'), 'error');
        } finally {
            setIsUpdatingData(false);
        }
    };

    const isRewardButtonDisabled = () => {
        if (!rewardValue || rewardValue <= 0) return true;

        if (
            actionType === 'CASHBACK_BOOST' &&
            discountType === 'PERCENTAGE' &&
            (rewardValue < MIN_PERCENTAGE || rewardValue > MAX_PERCENTAGE)
        ) {
            return true;
        }

        return false;
    };

    if (isLoadingMarketingCampaign) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-background02 p-6 rounded-lg">
                <div className="text-text02">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 sm:space-y-8 lg:space-y-10 bg-background02 p-6 rounded-lg">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary02 flex items-center justify-center rounded-full text-white">
                    <CheckOutlined style={{ fontSize: 24 }} />
                </div>
                <div>
                    <div className="font-bold text-text01 text-2xl">
                        {t('marketingCampaigns.term')}
                    </div>
                    <div className="text-base03 text-md">
                        {t('marketingCampaigns.settingUp')}
                    </div>
                </div>
            </div>

            {contextHolder}
            <ConditionModal
                open={isModalOpen}
                onCancel={handleCloseModal}
                onApply={handleApply}
                currentCondition={currentCondition}
                setCurrentCondition={setCurrentCondition}
                loading={isLoadingCondition}
                allowedConditionTypes={conditionTypes}
            />

            <ConditionsSection
                isLoading={isLoading}
                isValidating={isValidating}
                conditions={marketingConditions?.conditions}
                conditionTypes={conditionTypes}
                hasPromocodeCondition={hasPromocodeCondition}
                deletingConditionId={deletingConditionId}
                onOpenModal={handleOpenModal}
                onDelete={handleDelete}
            />

            <RewardSection
                actionType={actionType}
                marketingCampaign={marketingCampaign}
                rewardValue={rewardValue}
                discountType={discountType}
                onRewardValueChange={setRewardValue}
                onDiscountTypeChange={setDiscountType}
            />

            <ActionButtons
                actionType={actionType}
                marketingCampaign={marketingCampaign}
                isUpdating={isUpdatingData}
                isDisabled={isRewardButtonDisabled()}
                onNext={
                    actionType === 'PROMOCODE_ISSUE' ? navigateToNextStep : handleSaveReward
                }
            />
        </div>
    );
};

export default Terms;
