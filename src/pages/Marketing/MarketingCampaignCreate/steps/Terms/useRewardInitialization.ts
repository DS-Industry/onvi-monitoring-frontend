import React, { useState, useEffect } from 'react';
import { ACTION_TYPE, MarketingCampaignResponse } from '@/services/api/marketing';

type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

interface RewardState {
    rewardValue: number;
    discountType: DiscountType;
    initialRewardValue: number | null;
    initialDiscountType: DiscountType | null;
}

const initializeDiscountReward = (
    payload: any,
    campaign: any
): { value: number; type: DiscountType } => {
    let value = 0;
    let type: DiscountType = 'PERCENTAGE';

    if (payload?.discountValue !== undefined) {
        value = payload.discountValue;
    } else if (campaign.discountValue) {
        value = campaign.discountValue;
    }

    if (payload?.discountType) {
        type = payload.discountType as DiscountType;
    } else if (campaign.discountType) {
        type = campaign.discountType as DiscountType;
    }

    return { value, type };
};

const initializeCashbackReward = (
    payload: any,
    campaign: any
): { value: number; type: DiscountType } => {
    let value = 0;
    let type: DiscountType = 'PERCENTAGE';

    if (payload?.percentage !== undefined) {
        value = payload.percentage;
        type = 'PERCENTAGE';
    } else if (payload?.multiplier !== undefined) {
        value = payload.multiplier;
        type = 'FIXED_AMOUNT';
    } else if (campaign.discountValue) {
        value = campaign.discountValue;
        if (campaign.discountType) {
            type = campaign.discountType as DiscountType;
        }
    }

    return { value, type };
};

const initializePointsReward = (payload: any, campaign: any): number => {
    if (payload?.points !== undefined) {
        return payload.points;
    }
    if (campaign.discountValue) {
        return campaign.discountValue;
    }
    return 0;
};

export const useRewardInitialization = (
    marketingCampaign: MarketingCampaignResponse | undefined,
    actionType?: ACTION_TYPE
): RewardState & {
    setRewardValue: React.Dispatch<React.SetStateAction<number>>;
    setDiscountType: React.Dispatch<React.SetStateAction<DiscountType>>;
    setInitialRewardValue: React.Dispatch<React.SetStateAction<number | null>>;
    setInitialDiscountType: React.Dispatch<React.SetStateAction<DiscountType | null>>;
} => {
    const [rewardValue, setRewardValue] = useState<number>(0);
    const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
    const [initialRewardValue, setInitialRewardValue] = useState<number | null>(null);
    const [initialDiscountType, setInitialDiscountType] = useState<DiscountType | null>(null);

    useEffect(() => {
        if (!marketingCampaign || !actionType) return;

        const payload = marketingCampaign.actionPayload;

        switch (actionType) {
            case 'DISCOUNT': {
                const result = initializeDiscountReward(payload, marketingCampaign);
                setRewardValue(result.value);
                setDiscountType(result.type);
                setInitialRewardValue((prev) => {
                    if (prev === null) {
                        setInitialDiscountType(result.type);
                        return result.value;
                    }
                    return prev;
                });
                break;
            }
            case 'CASHBACK_BOOST': {
                const result = initializeCashbackReward(payload, marketingCampaign);
                setRewardValue(result.value);
                setDiscountType(result.type);
                setInitialRewardValue((prev) => {
                    if (prev === null) {
                        setInitialDiscountType(result.type);
                        return result.value;
                    }
                    return prev;
                });
                break;
            }
            case 'GIFT_POINTS': {
                const pointsValue = initializePointsReward(payload, marketingCampaign);
                setRewardValue(pointsValue);
                setInitialRewardValue((prev) => (prev === null ? pointsValue : prev));
                break;
            }
        }
    }, [marketingCampaign, actionType]);

    return {
        rewardValue,
        discountType,
        initialRewardValue,
        initialDiscountType,
        setRewardValue,
        setDiscountType,
        setInitialRewardValue,
        setInitialDiscountType,
    };
};

