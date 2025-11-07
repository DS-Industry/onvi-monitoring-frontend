import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BoxPlotOutlined,
  CloseOutlined,
  PercentageOutlined,
  PlusOutlined,
  RightOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Button, Input, message, Modal, Spin } from 'antd';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useSearchParams } from 'react-router-dom';
import ConditionModal from './ConditionModal';
import useSWR from 'swr';
import {
  getMarketingConditionsById,
  createNewMarketingConditions,
  deleteMarketingCondition,
  MarketingCampaignConditionType,
  CreateMarketingCampaignConditionDto,
} from '@/services/api/marketing';
import dayjs from 'dayjs';
import { useToast } from '@/components/context/useContext';

enum CardType {
  percent = 'percent',
  graph = 'graph',
  diamond = 'diamond',
}

const Terms: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [card, setCard] = useState<CardType>(CardType.percent);
  const [currentCondition, setCurrentCondition] = useState<{
    type?: MarketingCampaignConditionType;
    value?: any;
  }>({});
  const [loadingCondition, setLoadingCondition] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const { showToast } = useToast();

  const marketingCampaignId = Number(searchParams.get('marketingCampaignId'));

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

  const handleApply = async () => {
    setLoadingCondition(true);
    if (!currentCondition.type) {
      message.warning(t('validation.conditionTypeRequired'));
      return;
    }

    const payload: CreateMarketingCampaignConditionDto = {
      type: currentCondition.type,
    };

    switch (currentCondition.type) {
      case MarketingCampaignConditionType.TIME_RANGE:
        payload.startTime = currentCondition.value?.start;
        payload.endTime = currentCondition.value?.end;
        break;

      case MarketingCampaignConditionType.WEEKDAY:
        payload.weekdays = currentCondition.value;
        break;

      case MarketingCampaignConditionType.VISIT_COUNT:
        payload.visitCount = Number(currentCondition.value);
        break;

      case MarketingCampaignConditionType.PURCHASE_AMOUNT:
        if (typeof currentCondition.value === 'object') {
          payload.minAmount = currentCondition.value.minAmount;
          payload.maxAmount = currentCondition.value.maxAmount;
        } else {
          payload.minAmount = Number(currentCondition.value);
        }
        break;

      case MarketingCampaignConditionType.PROMOCODE_ENTRY:
        payload.promocodeId = Number(currentCondition.value);
        break;

      case MarketingCampaignConditionType.EVENT:
        payload.benefitId = Number(currentCondition.value);
        break;
    }

    try {
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

  // ✅ Delete condition
  const handleDelete = async (conditionId: number) => {
    modal.confirm({
      title: t('common.title'),
      content: t('common.content'),
      okText: t('common.okText'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      async onOk() {
        try {
          await deleteMarketingCondition(conditionId);
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

  const conditionTypes = [
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
      label: t('marketingCampaigns.event'),
      value: MarketingCampaignConditionType.EVENT,
    },
  ];

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
                  case MarketingCampaignConditionType.WEEKDAY:
                    valueDisplay = cond.weekdays?.join(', ') ?? '';
                    break;
                  case MarketingCampaignConditionType.VISIT_COUNT:
                    valueDisplay = `${cond.visitCount}`;
                    break;
                  case MarketingCampaignConditionType.PURCHASE_AMOUNT:
                    valueDisplay = `${cond.minAmount} - ${cond.maxAmount}`;
                    break;
                  case MarketingCampaignConditionType.PROMOCODE_ENTRY:
                    valueDisplay = cond.promocode?.code ?? '';
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
                        onClick={() => handleDelete(cond.id)}
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
      <div className="flex flex-wrap gap-4 mt-5 items-start">
        {/* Discount */}
        <div className="flex flex-col items-center min-h-[150px]">
          <div className="h-[48px] flex items-center justify-center">
            {card === CardType.percent && (
              <div className="flex items-center space-x-3">
                <div className="text-text01">
                  {t('marketingCampaigns.discount')}
                </div>
                <Input
                  type="number"
                  className="w-28"
                  value={percentage}
                  suffix={<div>%</div>}
                  onChange={e => setPercentage(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <div
            onClick={() => setCard(CardType.percent)}
            className={`w-full sm:w-64 h-24 flex flex-col justify-center text-center cursor-pointer border-[0.5px] ${
              card === CardType.percent
                ? 'bg-white border-primary02'
                : 'bg-opacity02'
            } rounded-2xl transition-all duration-200 hover:shadow-md`}
          >
            <div
              className={`flex justify-center items-center ${
                card === CardType.percent ? 'text-primary02' : 'text-text01'
              }`}
            >
              <PercentageOutlined className="font-semibold text-primary02" />
              <div className="ml-2 font-semibold text-base">
                {t('marketing.discount')}
              </div>
            </div>
            <div className="px-4 text-sm text-text02 font-normal">
              {t('marketingCampaigns.give')}
            </div>
          </div>
        </div>

        {/* Cashback */}
        <div className="flex flex-col items-center min-h-[150px]">
          <div className="h-[48px] flex items-center justify-center">
            {card === CardType.graph && (
              <div className="flex items-center space-x-3">
                <div className="text-text01">
                  {t('marketingCampaigns.cashback')}
                </div>
                <Input
                  type="number"
                  className="w-28"
                  value={percentage}
                  suffix={<div>%</div>}
                  onChange={e => setPercentage(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <div
            onClick={() => setCard(CardType.graph)}
            className={`w-full sm:w-64 h-24 flex flex-col justify-center text-center cursor-pointer border-[0.5px] ${
              card === CardType.graph
                ? 'bg-white border-primary02'
                : 'bg-opacity02'
            } rounded-2xl transition-all duration-200 hover:shadow-md`}
          >
            <div
              className={`flex justify-center items-center ${
                card === CardType.graph ? 'text-primary02' : 'text-text01'
              }`}
            >
              <RiseOutlined className="font-semibold text-primary02" />
              <div className="ml-2 font-semibold text-base">
                {t('marketingCampaigns.increased')}
              </div>
            </div>
            <div className="px-4 text-sm text-text02 font-normal">
              {t('marketingCampaigns.increase')}
            </div>
          </div>
        </div>

        {/* Points */}
        <div className="flex flex-col items-center min-h-[150px]">
          <div className="h-[48px] flex items-center justify-center">
            {card === CardType.diamond && (
              <div className="flex items-center space-x-3">
                <div className="text-text01">{t('marketing.accrue')}</div>
                <Input
                  type="number"
                  className="w-28"
                  value={percentage}
                  suffix={
                    <div className="text-text02">
                      {t('loyaltyRequests.points')}
                    </div>
                  }
                  onChange={e => setPercentage(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <div
            onClick={() => setCard(CardType.diamond)}
            className={`w-full sm:w-64 h-24 flex flex-col justify-center text-center cursor-pointer border-[0.5px] ${
              card === CardType.diamond
                ? 'bg-white border-primary02'
                : 'bg-opacity02'
            } rounded-2xl transition-all duration-200 hover:shadow-md`}
          >
            <div
              className={`flex justify-center items-center ${
                card === CardType.diamond ? 'text-primary02' : 'text-text01'
              }`}
            >
              <BoxPlotOutlined className="font-semibold text-primary02" />
              <div className="ml-2 font-semibold text-base">
                {t('marketingCampaigns.accrual')}
              </div>
            </div>
            <div className="px-4 text-sm text-text02 font-normal">
              {t('marketingCampaigns.award')}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-3">
        <Button
          type="primary"
          icon={<RightOutlined />}
          iconPosition="end"
          onClick={() => {
            updateSearchParams(searchParams, setSearchParams, { step: 3 });
          }}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};

export default Terms;
