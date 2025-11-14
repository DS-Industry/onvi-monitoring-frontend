import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, RightOutlined } from '@ant-design/icons';
import { Button, message, Modal, Skeleton } from 'antd';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useSearchParams } from 'react-router-dom';
import ConditionModal from './ConditionModal';
import ConditionCard from '../../components/ConditionCard';
import DiscountReward from './rewards/DiscountReward';
import CashbackReward from './rewards/CashbackReward';
import PointsReward from './rewards/PointsReward';
import PromocodeReward from './rewards/PromocodeReward';
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
} from '@/services/api/marketing';
import { useToast } from '@/components/context/useContext';
import { getFilteredConditionTypes } from '../../utils/conditionTypes';

const Terms: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const editMode = Boolean(searchParams.get('mode') === 'edit');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rewardValue, setRewardValue] = useState<number>(0);
    const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
    const [initialRewardValue, setInitialRewardValue] = useState<number | null>(null);
    const [initialDiscountType, setInitialDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT' | null>(null);
    const [currentCondition, setCurrentCondition] = useState<{
        type?: MarketingCampaignConditionType;
        value?: any;
    }>({});
    const [loadingCondition, setLoadingCondition] = useState(false);
    const [deletingConditionId, setDeletingConditionId] = useState<number | null>(null);
    const [updatingData, setUpdatingData] = useState(false);
    const [modal, contextHolder] = Modal.useModal();
    const { showToast } = useToast();

    const currentStep = (Number(searchParams.get('step')) || 1)

    const marketingCampaignId = Number(searchParams.get('marketingCampaignId'));

    const {
        data: marketingCampaign,
        mutate: mutateCampaign,
        isLoading: isLoadingMarketingCampaign,
    } = useSWR(
        marketingCampaignId
            ? [`get-marketing-campaign-by-id`, marketingCampaignId]
            : null,
        () => getMarketingCampaignById(marketingCampaignId),
        {
            revalidateOnFocus: false,
        }
    );

    const actionType = marketingCampaign?.actionType;

    useEffect(() => {
        if (marketingCampaign && actionType) {
            const payload = marketingCampaign.actionPayload;

            if (actionType === 'DISCOUNT') {
                let newRewardValue = 0;
                let newDiscountType: 'PERCENTAGE' | 'FIXED_AMOUNT' = 'PERCENTAGE';

                if (payload?.discountValue !== undefined) {
                    newRewardValue = payload.discountValue;
                } else if (marketingCampaign.discountValue) {
                    newRewardValue = marketingCampaign.discountValue;
                }
                if (payload?.discountType) {
                    newDiscountType = payload.discountType as 'PERCENTAGE' | 'FIXED_AMOUNT';
                } else if (marketingCampaign.discountType) {
                    newDiscountType = marketingCampaign.discountType as 'PERCENTAGE' | 'FIXED_AMOUNT';
                }

                setRewardValue(newRewardValue);
                setDiscountType(newDiscountType);
                if (initialRewardValue === null) {
                    setInitialRewardValue(newRewardValue);
                    setInitialDiscountType(newDiscountType);
                }
            } else if (actionType === 'CASHBACK_BOOST') {
                let newRewardValue = 0;
                let newDiscountType: 'PERCENTAGE' | 'FIXED_AMOUNT' = 'PERCENTAGE';

                if (payload?.percentage !== undefined) {
                    newRewardValue = payload.percentage;
                    newDiscountType = 'PERCENTAGE';
                } else if (payload?.multiplier !== undefined) {
                    newRewardValue = payload.multiplier;
                    newDiscountType = 'FIXED_AMOUNT';
                } else if (marketingCampaign.discountValue) {
                    newRewardValue = marketingCampaign.discountValue;
                    if (marketingCampaign.discountType) {
                        newDiscountType = marketingCampaign.discountType as 'PERCENTAGE' | 'FIXED_AMOUNT';
                    }
                }

                setRewardValue(newRewardValue);
                setDiscountType(newDiscountType);
                if (initialRewardValue === null) {
                    setInitialRewardValue(newRewardValue);
                    setInitialDiscountType(newDiscountType);
                }
            } else if (actionType === 'GIFT_POINTS') {
                let newRewardValue = 0;

                if (payload?.points !== undefined) {
                    newRewardValue = payload.points;
                } else if (marketingCampaign.discountValue) {
                    newRewardValue = marketingCampaign.discountValue;
                }

                setRewardValue(newRewardValue);
                if (initialRewardValue === null) {
                    setInitialRewardValue(newRewardValue);
                }
            }
        }
    }, [marketingCampaign, actionType]);

    const {
        data: marketingConditions,
        mutate: refreshConditions,
        isLoading,
        isValidating,
    } = useSWR(
        marketingCampaignId
            ? [`get-marketing-conditions-by-id`, marketingCampaignId]
            : null,
        () => getMarketingConditionsById(marketingCampaignId),
        { revalidateOnFocus: false }
    );

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleApply = async (condition?: { type?: MarketingCampaignConditionType; value?: any }) => {
        setLoadingCondition(true);
        const conditionToUse = condition || currentCondition;

        if (!conditionToUse.type) {
            message.warning(t('validation.conditionTypeRequired'));
            setLoadingCondition(false);
            return;
        }

        try {
            let promocodeId: number | undefined;

            if (conditionToUse.type === MarketingCampaignConditionType.PROMOCODE_ENTRY) {
                const promocodeData = conditionToUse.value;

                if (!promocodeData?.code || !promocodeData?.discountValue || !promocodeData?.maxUsagePerUser) {
                    message.warning(t('validation.promocodeFieldsRequired') || 'Please fill all promocode fields');
                    setLoadingCondition(false);
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

            const payload: CreateMarketingCampaignConditionDto = {
                type: conditionToUse.type,
            };

            switch (conditionToUse.type) {
                case MarketingCampaignConditionType.TIME_RANGE:
                    payload.startTime = conditionToUse.value?.start;
                    payload.endTime = conditionToUse.value?.end;
                    break;

                case MarketingCampaignConditionType.WEEKDAY:
                    payload.weekdays = conditionToUse.value;
                    break;

                case MarketingCampaignConditionType.VISIT_COUNT:
                    payload.visitCount = Number(conditionToUse.value);
                    break;

                case MarketingCampaignConditionType.PURCHASE_AMOUNT:
                    if (typeof conditionToUse.value === 'object') {
                        payload.minAmount = conditionToUse.value.minAmount;
                        payload.maxAmount = conditionToUse.value.maxAmount;
                    } else {
                        payload.minAmount = Number(conditionToUse.value);
                    }
                    break;

                case MarketingCampaignConditionType.PROMOCODE_ENTRY:
                    payload.promocodeId = promocodeId;
                    break;

                case MarketingCampaignConditionType.BIRTHDAY:
                    break;
            }

            await createNewMarketingConditions(payload, marketingCampaignId);
            mutateCampaign();
            showToast(t('tables.SAVED'), 'success');
            setCurrentCondition({});
            setIsModalOpen(false);
            refreshConditions();
        } catch (err) {
            console.error(err);
            message.error(t('common.somethingWentWrong'));
        } finally {
            setLoadingCondition(false);
        }
    };

    const handleDelete = async (conditionId: number, index: number) => {
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
                    await mutateCampaign()
                    showToast(t('success.recordDeleted'), 'success');
                    refreshConditions();
                } catch (err) {
                    console.error(err);
                    message.error(t('marketing.errorCampaign'));
                } finally {
                    setDeletingConditionId(null);
                }
            },
            onCancel() {
                showToast(t('info.deleteCancelled'), 'info');
            },
        });
    };

    const conditionTypes = getFilteredConditionTypes(actionType, t);

    const hasPromocodeCondition = actionType === 'PROMOCODE_ISSUE' &&
        marketingConditions?.conditions?.some(
            cond => cond.type === MarketingCampaignConditionType.PROMOCODE_ENTRY
        );

    if (isLoadingMarketingCampaign) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-background02 p-6 rounded-lg">
                <div className="text-text02">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 sm:space-y-8 lg:space-y-10 bg-background02 p-6 rounded-lg">
            {contextHolder}
            <ConditionModal
                open={isModalOpen}
                onCancel={handleCloseModal}
                onApply={handleApply}
                currentCondition={currentCondition}
                setCurrentCondition={setCurrentCondition}
                loading={loadingCondition}
                allowedConditionTypes={conditionTypes}
            />

            {isLoading || isValidating ? (
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <div className="flex items-center justify-center h-24 text-lg font-semibold">
                            {t('marketingCampaigns.if')}
                        </div>

                        <div className="flex flex-wrap gap-3 flex-1">
                            {[1, 2, 3].map((index) => (
                                <React.Fragment key={index}>
                                    <Skeleton
                                        active
                                        title={false}
                                        paragraph={{ rows: 2, width: ['100%', '60%'] }}
                                        style={{ width: 208, height: 96, borderRadius: 12 }}
                                    />
                                    {index < 3 && (
                                        <div className="flex items-center justify-center text-primary02 font-semibold">
                                            {t('common.and')}
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <div className="flex items-center justify-center h-24 text-lg font-semibold">
                            {t('marketingCampaigns.if')}
                        </div>

                        <div className="flex flex-wrap gap-3 flex-1">
                            {marketingConditions?.conditions?.map((cond, index) => (
                                <ConditionCard
                                    key={cond.id}
                                    condition={cond}
                                    index={index}
                                    totalConditions={marketingConditions.conditions.length}
                                    conditionTypes={conditionTypes}
                                    onDelete={handleDelete}
                                    isDeleting={deletingConditionId === cond.id}
                                />
                            ))}

                            {!hasPromocodeCondition && (
                                <div
                                    onClick={handleOpenModal}
                                    className="flex items-center justify-center h-24"
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
            )}

            {actionType && (
                <div className="flex flex-wrap gap-4 mt-5 items-start">
                    {!marketingCampaign ? (
                        <Skeleton
                            active
                            paragraph={{ rows: 4 }}
                            title={{ width: 200 }}
                            style={{ width: 300, minHeight: 200 }}
                        />
                    ) : (
                        <>
                            {actionType === 'DISCOUNT' && (
                                <DiscountReward
                                    rewardValue={rewardValue}
                                    discountType={discountType}
                                    onValueChange={setRewardValue}
                                    onTypeChange={setDiscountType}
                                />
                            )}

                            {actionType === 'CASHBACK_BOOST' && (
                                <CashbackReward
                                    rewardValue={rewardValue}
                                    discountType={discountType}
                                    onValueChange={setRewardValue}
                                    onTypeChange={setDiscountType}
                                />
                            )}

                            {actionType === 'GIFT_POINTS' && (
                                <PointsReward
                                    rewardValue={rewardValue}
                                    onValueChange={setRewardValue}
                                />
                            )}

                            {actionType === 'PROMOCODE_ISSUE' && (
                                <PromocodeReward
                                    marketingCampaign={marketingCampaign}
                                />
                            )}
                        </>
                    )}
                </div>
            )}

            {actionType && actionType === 'PROMOCODE_ISSUE' && (<div className="flex justify-end gap-2 mt-3"><Button
                type="primary"
                icon={<RightOutlined />}
                iconPosition="end"
                disabled={marketingCampaign.actionPromocode ? false : true}
                loading={updatingData}
                onClick={() => {
                    console.log('let: ', currentStep)
                    updateSearchParams(searchParams, setSearchParams, { step: currentStep + 1 });
                }}> {t('common.next')}</Button></div>)}
            {actionType && actionType !== 'PROMOCODE_ISSUE' && (
                <div className="flex justify-end gap-2 mt-3">
                    <Button
                        type="primary"
                        icon={<RightOutlined />}
                        iconPosition="end"
                        loading={updatingData}
                        disabled={
                            !rewardValue ||
                            rewardValue <= 0 ||
                            (actionType === 'CASHBACK_BOOST' &&
                                discountType === 'PERCENTAGE' &&
                                (rewardValue < 0 || rewardValue > 100))
                        }
                        onClick={async () => {
                            if (!marketingCampaignId) return;

                            if (editMode) {
                                const hasChanged =
                                    (actionType === 'DISCOUNT' || actionType === 'CASHBACK_BOOST')
                                        ? (rewardValue !== initialRewardValue || discountType !== initialDiscountType)
                                        : (rewardValue !== initialRewardValue);

                                if (!hasChanged) {
                                    updateSearchParams(searchParams, setSearchParams, { step: currentStep + 1 });
                                    return;
                                }
                            }

                            if (!rewardValue || rewardValue <= 0) {
                                message.warning(t('validation.rewardValueRequired') || 'Please enter a reward value');
                                return;
                            }

                            if (actionType === 'CASHBACK_BOOST' && discountType === 'PERCENTAGE') {
                                if (rewardValue < 0 || rewardValue > 100) {
                                    message.warning(t('validation.percentageRange') || 'Percentage must be between 0 and 100');
                                    return;
                                }
                            }

                            try {
                                setUpdatingData(true);

                                let payload: any = {};

                                if (actionType === 'DISCOUNT') {
                                    payload = {
                                        discountType,
                                        discountValue: rewardValue,
                                    };
                                } else if (actionType === 'CASHBACK_BOOST') {
                                    if (discountType === 'PERCENTAGE') {
                                        payload = {
                                            percentage: rewardValue,
                                        };
                                    } else {
                                        payload = {
                                            multiplier: rewardValue,
                                        };
                                    }
                                } else if (actionType === 'GIFT_POINTS') {
                                    payload = {
                                        points: Math.floor(rewardValue),
                                    };
                                }

                                await updateMarketingCampaignAction(marketingCampaignId, {
                                    actionType,
                                    payload,
                                });

                                setInitialRewardValue(rewardValue);
                                if (actionType === 'DISCOUNT' || actionType === 'CASHBACK_BOOST') {
                                    setInitialDiscountType(discountType);
                                }

                                updateSearchParams(searchParams, setSearchParams, { step: currentStep + 1 });
                                showToast(t('tables.SAVED'), 'success');
                            } catch (error) {
                                console.error(error);
                                showToast(t('common.somethingWentWrong'), 'error');
                            } finally {
                                setUpdatingData(false);
                            }
                        }}
                    >
                        {t('common.next')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Terms;

