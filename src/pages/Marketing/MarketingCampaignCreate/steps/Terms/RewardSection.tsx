import React from 'react';
import { Skeleton } from 'antd';
import DiscountReward from './rewards/DiscountReward';
import CashbackReward from './rewards/CashbackReward';
import PointsReward from './rewards/PointsReward';
import PromocodeReward from './rewards/PromocodeReward';
import { ACTION_TYPE, MarketingCampaignResponse } from '@/services/api/marketing';

type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

interface RewardSectionProps {
    actionType?: ACTION_TYPE;
    marketingCampaign?: MarketingCampaignResponse;
    rewardValue: number;
    discountType: DiscountType;
    onRewardValueChange: (value: number) => void;
    onDiscountTypeChange: (type: DiscountType) => void;
}

const RewardSection: React.FC<RewardSectionProps> = ({
    actionType,
    marketingCampaign,
    rewardValue,
    discountType,
    onRewardValueChange,
    onDiscountTypeChange,
}) => {
    if (!actionType) {
        return null;
    }

    if (!marketingCampaign) {
        return (
            <div className="flex flex-wrap gap-4 mt-5 items-start">
                <Skeleton
                    active
                    paragraph={{ rows: 4 }}
                    title={{ width: 200 }}
                    style={{ width: 300, minHeight: 200 }}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-4 mt-5 items-start">
            {actionType === 'DISCOUNT' && (
                <DiscountReward
                    rewardValue={rewardValue}
                    discountType={discountType}
                    onValueChange={onRewardValueChange}
                    onTypeChange={onDiscountTypeChange}
                />
            )}

            {actionType === 'CASHBACK_BOOST' && (
                <CashbackReward
                    rewardValue={rewardValue}
                    discountType={discountType}
                    onValueChange={onRewardValueChange}
                    onTypeChange={onDiscountTypeChange}
                />
            )}

            {actionType === 'GIFT_POINTS' && (
                <PointsReward
                    rewardValue={rewardValue}
                    onValueChange={onRewardValueChange}
                />
            )}

            {actionType === 'PROMOCODE_ISSUE' && (
                <PromocodeReward marketingCampaign={marketingCampaign} />
            )}
        </div>
    );
};

export default RewardSection;

