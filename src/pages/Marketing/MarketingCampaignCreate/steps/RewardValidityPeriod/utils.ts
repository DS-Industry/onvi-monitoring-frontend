import { MarketingCampaignResponse } from '@/services/api/marketing';

export interface RewardValidityPeriodData {
    days: number | null;
    isIndefinite: boolean;
}

export const extractRewardValidityPeriod = (
    campaign: MarketingCampaignResponse
): RewardValidityPeriodData => {
    if (campaign.activeDays !== undefined && campaign.activeDays !== null) {
        return {
            days: campaign.activeDays,
            isIndefinite: false,
        };
    }

    if (campaign.actionPayload) {
        const payload = campaign.actionPayload;
        
        if (payload.rewardValidityDays !== undefined) {
            return {
                days: payload.rewardValidityDays,
                isIndefinite: false,
            };
        }
        
        if (payload.rewardValidityIndefinite === true) {
            return {
                days: null,
                isIndefinite: true,
            };
        }
    }

    return {
        days: null,
        isIndefinite: false,
    };
};

export const hasValidityPeriodChanged = (
    current: RewardValidityPeriodData,
    initial: RewardValidityPeriodData
): boolean => {
    return current.days !== initial.days || current.isIndefinite !== initial.isIndefinite;
};

