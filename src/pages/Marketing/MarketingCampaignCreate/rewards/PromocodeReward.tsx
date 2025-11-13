import React from 'react';
import { useTranslation } from 'react-i18next';
import { GiftOutlined } from '@ant-design/icons';
import {
    MarketingCampaignConditionType,
    type MarketingCampaignResponse,
    type MarketingCampaignConditionsResponseDto,
} from '@/services/api/marketing';

interface PromocodeRewardProps {
    marketingCampaign?: MarketingCampaignResponse;
    marketingConditions?: MarketingCampaignConditionsResponseDto;
}

const PromocodeReward: React.FC<PromocodeRewardProps> = ({
    marketingCampaign,
    marketingConditions,
}) => {
    const { t } = useTranslation();

    const campaignPromocode = marketingCampaign?.promocode;
    const conditionPromocode = marketingConditions?.conditions?.find(
        cond => cond.type === MarketingCampaignConditionType.PROMOCODE_ENTRY
    )?.promocode?.code;

    const promocodeCode = campaignPromocode || conditionPromocode;

    return (
        <div className="flex flex-col items-center min-h-[150px] w-full sm:w-64">
            <div className="w-full h-auto flex flex-col justify-center text-center border-[0.5px] bg-white border-primary02 rounded-2xl p-4">
                <div className="flex justify-center items-center text-primary02 mb-3">
                    <GiftOutlined className="font-semibold text-primary02" />
                    <div className="ml-2 font-semibold text-base">
                        {t('marketingCampaigns.promocode')}
                    </div>
                </div>
                {promocodeCode ? (
                    <div className="flex flex-col space-y-2 text-left">
                        <div className="text-sm">
                            <span className="font-semibold text-text01">
                                {t('marketingCampaigns.promocode')}:{' '}
                            </span>
                            <span className="text-text02">{promocodeCode}</span>
                        </div>
                        {marketingCampaign?.actionPromocode && (
                            <>
                                {marketingCampaign.actionPromocode.discountType && (
                                    <div className="text-sm">
                                        <span className="font-semibold text-text01">
                                            {t('marketing.discountType')}:{' '}
                                        </span>
                                        <span className="text-text02">
                                            {marketingCampaign.actionPromocode.discountType === 'PERCENTAGE'
                                                ? t('marketing.per')
                                                : t('marketing.fix')}
                                        </span>
                                    </div>
                                )}
                                {marketingCampaign.actionPromocode.discountValue && (
                                    <div className="text-sm">
                                        <span className="font-semibold text-text01">
                                            {t('marketing.discountValue')}:{' '}
                                        </span>
                                        <span className="text-text02">
                                            {marketingCampaign.actionPromocode.discountValue}
                                            {marketingCampaign.actionPromocode.discountType === 'PERCENTAGE'
                                                ? '%'
                                                : '₽'}
                                        </span>
                                    </div>
                                )}
                                {marketingCampaign.actionPromocode.maxUsagePerUser && (
                                    <div className="text-sm">
                                        <span className="font-semibold text-text01">
                                            {t('marketing.maxUsagePerUser')}:{' '}
                                        </span>
                                        <span className="text-text02">
                                            {marketingCampaign.actionPromocode.maxUsagePerUser}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-text02">
                        {t('marketingCampaigns.noPromocodeLinked') ||
                            'No promocode linked to this campaign'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromocodeReward;

