import {
    CampaignExecutionType,
    MarketingCampaignResponse,
} from '@/services/api/marketing';

export type SpendCycle = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ALL_TIME';

export type SpendMilestoneDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SERVICE';

export type SpendMilestoneTier = {
    threshold: number;
    discountType: SpendMilestoneDiscountType;
    discountValue: number;
    validDays: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
};

export type SpendMilestonePayload = {
    spendCycle: SpendCycle;
    tiers: SpendMilestoneTier[];
};

export const DEFAULT_SPEND_CYCLE: SpendCycle = 'MONTHLY';

export const createEmptyTier = (): SpendMilestoneTier => ({
    threshold: 0,
    discountType: 'PERCENTAGE',
    discountValue: 0,
    validDays: 30,
});

export const isSpendMilestoneCampaign = (
    campaign?: Pick<MarketingCampaignResponse, 'executionType' | 'actionType'>
): boolean =>
    campaign?.executionType === CampaignExecutionType.BEHAVIORAL &&
    campaign?.actionType === 'PROMOCODE_ISSUE';

export const parseSpendMilestonePayload = (
    payload?: Record<string, unknown>
): SpendMilestonePayload => ({
    spendCycle: (payload?.spendCycle as SpendCycle) || DEFAULT_SPEND_CYCLE,
    tiers: Array.isArray(payload?.tiers)
        ? (payload.tiers as SpendMilestoneTier[]).map(tier => ({
              threshold: Number(tier.threshold) || 0,
              discountType: tier.discountType || 'PERCENTAGE',
              discountValue: Number(tier.discountValue) || 0,
              validDays: Number(tier.validDays) || 30,
              minOrderAmount:
                  tier.minOrderAmount !== undefined
                      ? Number(tier.minOrderAmount)
                      : undefined,
              maxDiscountAmount:
                  tier.maxDiscountAmount !== undefined
                      ? Number(tier.maxDiscountAmount)
                      : undefined,
          }))
        : [],
});

export const validateSpendMilestoneTiers = (
    tiers: SpendMilestoneTier[]
): { valid: boolean; errorKey?: string } => {
    if (!tiers.length) {
        return { valid: false, errorKey: 'validation.spendMilestoneTiersRequired' };
    }

    for (const tier of tiers) {
        if (tier.threshold < 0) {
            return { valid: false, errorKey: 'validation.spendMilestoneInvalidThreshold' };
        }
        if (tier.discountValue < 0) {
            return { valid: false, errorKey: 'validation.spendMilestoneInvalidDiscountValue' };
        }
        if (!tier.validDays || tier.validDays < 1) {
            return { valid: false, errorKey: 'validation.spendMilestoneInvalidValidDays' };
        }
    }

    const thresholds = tiers.map(tier => tier.threshold);
    const uniqueThresholds = new Set(thresholds);
    if (uniqueThresholds.size !== thresholds.length) {
        return { valid: false, errorKey: 'validation.spendMilestoneDuplicateThresholds' };
    }

    const sortedThresholds = [...thresholds].sort((a, b) => a - b);
    const isAscending = thresholds.every(
        (threshold, index) => threshold === sortedThresholds[index]
    );
    if (!isAscending) {
        return { valid: false, errorKey: 'validation.spendMilestoneThresholdsNotAscending' };
    }

    return { valid: true };
};

export const areSpendMilestonePayloadsEqual = (
    a: SpendMilestonePayload,
    b: SpendMilestonePayload
): boolean => JSON.stringify(a) === JSON.stringify(b);
