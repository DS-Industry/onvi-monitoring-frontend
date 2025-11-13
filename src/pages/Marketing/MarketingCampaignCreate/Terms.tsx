import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloseOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Button, message, Modal, Spin } from 'antd';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useSearchParams } from 'react-router-dom';
import ConditionModal from './ConditionModal';
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
  Weekday,
} from '@/services/api/marketing';
import dayjs from 'dayjs';
import { useToast } from '@/components/context/useContext';

const Terms: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rewardValue, setRewardValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [currentCondition, setCurrentCondition] = useState<{
    type?: MarketingCampaignConditionType;
    value?: any;
  }>({});
  const [loadingCondition, setLoadingCondition] = useState(false);
  const [updatingData, setUpdatingData] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const { showToast } = useToast();

  const marketingCampaignId = Number(searchParams.get('marketingCampaignId'));

  const {
    data: marketingCampaign,
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
        if (payload?.discountValue !== undefined) {
          setRewardValue(payload.discountValue);
        } else if (marketingCampaign.discountValue) {
          setRewardValue(marketingCampaign.discountValue);
        }
        if (payload?.discountType) {
          setDiscountType(payload.discountType as 'PERCENTAGE' | 'FIXED_AMOUNT');
        } else if (marketingCampaign.discountType) {
          setDiscountType(marketingCampaign.discountType as 'PERCENTAGE' | 'FIXED_AMOUNT');
        }
      } else if (actionType === 'CASHBACK_BOOST') {
        if (payload?.percentage !== undefined) {
          setRewardValue(payload.percentage);
          setDiscountType('PERCENTAGE');
        } else if (payload?.multiplier !== undefined) {
          setRewardValue(payload.multiplier);
          setDiscountType('FIXED_AMOUNT');
        } else if (marketingCampaign.discountValue) {
          setRewardValue(marketingCampaign.discountValue);
          if (marketingCampaign.discountType) {
            setDiscountType(marketingCampaign.discountType as 'PERCENTAGE' | 'FIXED_AMOUNT');
          }
        }
      } else if (actionType === 'GIFT_POINTS') {
        if (payload?.points !== undefined) {
          setRewardValue(payload.points);
        } else if (marketingCampaign.discountValue) {
          setRewardValue(marketingCampaign.discountValue);
        }
      }
    }
  }, [marketingCampaign, actionType]);

  const {
    data: marketingConditions,
    mutate: refreshConditions,
    isLoading,
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
      message.success(t('marketingCampaigns.conditionAdded'));
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
          await deleteMarketingCondition(conditionId, index);
          showToast(t('success.recordDeleted'), 'success');
          refreshConditions();
        } catch (err) {
          console.error(err);
          message.error(t('marketing.errorCampaign'));
        }
      },
      onCancel() {
        showToast(t('info.deleteCancelled'), 'info');
      },
    });
  };

  const allConditionTypes = [
    {
      label: t('marketingCampaigns.timePeriod'),
      value: MarketingCampaignConditionType.TIME_RANGE,
    },
    {
      label: t('marketingCampaigns.dayOfWeek'),
      value: MarketingCampaignConditionType.WEEKDAY,
    },
    {
      label: t('marketingCampaigns.purchaseAmount'),
      value: MarketingCampaignConditionType.PURCHASE_AMOUNT,
    },
    {
      label: t('marketingCampaigns.numberOfVisits'),
      value: MarketingCampaignConditionType.VISIT_COUNT,
    },
    {
      label: t('marketingCampaigns.promoCodeEntry'),
      value: MarketingCampaignConditionType.PROMOCODE_ENTRY,
    },
    {
      label: t('marketing.birth'),
      value: MarketingCampaignConditionType.BIRTHDAY,
    },
  ];

  const conditionTypes =
    actionType === 'PROMOCODE_ISSUE'
      ? allConditionTypes.filter(
        type => type.value === MarketingCampaignConditionType.PROMOCODE_ENTRY
      )
      : allConditionTypes.filter(type => type.value !== MarketingCampaignConditionType.PROMOCODE_ENTRY);

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

      {isLoading ? (
        <div className="flex items-center justify-center w-full h-full min-h-[400px]">
          <Spin size="large" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex items-center justify-center h-24 text-lg font-semibold">
              {t('marketingCampaigns.if')}
            </div>

            <div className="flex flex-wrap gap-3 flex-1">
              {marketingConditions?.conditions?.map((cond, index) => {
                let valueDisplay = '';
                switch (cond.type) {
                  case MarketingCampaignConditionType.TIME_RANGE:
                    valueDisplay = `${dayjs(cond.startTime).format('HH:mm')} - ${dayjs(cond.endTime).format('HH:mm')}`;
                    break;
                  case MarketingCampaignConditionType.WEEKDAY: {
                    const weekdayTranslations: Record<Weekday, string> = {
                      [Weekday.MONDAY]: t('common.monday'),
                      [Weekday.TUESDAY]: t('common.tuesday'),
                      [Weekday.WEDNESDAY]: t('common.wednesday'),
                      [Weekday.THURSDAY]: t('common.thursday'),
                      [Weekday.FRIDAY]: t('common.friday'),
                      [Weekday.SATURDAY]: t('common.saturday'),
                      [Weekday.SUNDAY]: t('common.sunday'),
                    };
                    valueDisplay = cond.weekdays?.map(day => weekdayTranslations[day as Weekday] || day).join(', ') ?? '';
                    break;
                  }
                  case MarketingCampaignConditionType.VISIT_COUNT:
                    valueDisplay = `${cond.visitCount}`;
                    break;
                  case MarketingCampaignConditionType.PURCHASE_AMOUNT:
                    valueDisplay = `${cond.minAmount}`;
                    break;
                  case MarketingCampaignConditionType.PROMOCODE_ENTRY:
                    valueDisplay = cond.promocode?.code ?? '';
                    break;
                  case MarketingCampaignConditionType.BIRTHDAY:
                    valueDisplay = t('marketing.birth');
                    break;
                  default:
                    valueDisplay = '';
                }

                return (
                  <React.Fragment key={cond.id}>
                    <div className="relative flex items-center justify-center w-52 h-24 border-[0.5px] border-primary02 rounded-lg bg-white shadow-sm">
                      <Button
                        size="small"
                        type="text"
                        icon={<CloseOutlined />}
                        className="!absolute top-1 right-1 text-text02 hover:text-primary02"
                        onClick={() => handleDelete(cond.id, index)}
                      />

                      <div className="flex flex-col items-center justify-center text-center px-2">
                        <div className="text-sm font-semibold text-text01">
                          {
                            conditionTypes.find(
                              condition => condition.value === cond.type
                            )?.label
                          }
                        </div>
                        <div className="text-sm text-text02">
                          {valueDisplay}
                        </div>
                      </div>
                    </div>

                    {index < marketingConditions.conditions.length - 1 && (
                      <div className="flex items-center justify-center text-primary02 font-semibold">
                        {t('common.and')}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              <div
                onClick={handleOpenModal}
                className="flex items-center justify-center h-24"
              >
                <PlusOutlined
                  style={{ fontSize: 18 }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-background05 cursor-pointer hover:bg-background04 transition"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------- Reward Cards Section --------- */}
      {actionType && (
        <div className="flex flex-wrap gap-4 mt-5 items-start">
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
              marketingConditions={marketingConditions}
            />
          )}
        </div>
      )}

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

              if (!rewardValue || rewardValue <= 0) {
                message.warning(t('validation.rewardValueRequired') || 'Please enter a reward value');
                return;
              }

              // Validate CASHBACK_BOOST percentage range
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
                  // For CASHBACK_BOOST, use percentage if PERCENTAGE, otherwise use multiplier
                  if (discountType === 'PERCENTAGE') {
                    payload = {
                      percentage: rewardValue,
                    };
                  } else {
                    // For fixed amount, use multiplier
                    payload = {
                      multiplier: rewardValue,
                    };
                  }
                } else if (actionType === 'GIFT_POINTS') {
                  payload = {
                    points: Math.floor(rewardValue), // Ensure it's an integer
                  };
                }

                await updateMarketingCampaignAction(marketingCampaignId, {
                  actionType,
                  payload,
                });

                message.success(t('marketingCampaigns.rewardUpdated'));

                updateSearchParams(searchParams, setSearchParams, { step: 3 });
              } catch (error) {
                console.error(error);
                message.error(t('common.somethingWentWrong'));
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
