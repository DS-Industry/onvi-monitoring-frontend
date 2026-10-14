import {
    CampaignExecutionType,
    createNewMarketingConditions,
    getMarketingConditionsById,
    MarketingCampaignConditionType,
    MarketingCampaignResponse,
} from '@/services/api/marketing';
import type { SpendMilestoneDiscountType } from './spendMilestone';

export type RegistrationPromocodePayload = {
    discountType: SpendMilestoneDiscountType;
    discountValue: number;
    validDays: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
};

export const createDefaultRegistrationPayload = (): RegistrationPromocodePayload => ({
    discountType: 'PERCENTAGE',
    discountValue: 10,
    validDays: 30,
});

// A registration campaign is a behavioral promocode campaign whose payload is a
// single promocode (no spend tiers). The REGISTRATION condition itself is only
// added once the campaign is bound to a region, so the payload is the signal.
export const isRegistrationPayload = (payload?: Record<string, unknown>): boolean =>
    Boolean(payload) &&
    !Array.isArray(payload?.tiers) &&
    typeof payload?.discountType === 'string' &&
    payload?.validDays !== undefined;

export const isRegistrationCampaign = (
    campaign?: Pick<
        MarketingCampaignResponse,
        'executionType' | 'actionType' | 'actionPayload'
    >
): boolean =>
    campaign?.executionType === CampaignExecutionType.BEHAVIORAL &&
    campaign?.actionType === 'PROMOCODE_ISSUE' &&
    isRegistrationPayload(campaign?.actionPayload);

export const parseRegistrationPayload = (
    payload?: Record<string, unknown>
): RegistrationPromocodePayload => {
    const defaults = createDefaultRegistrationPayload();
    return {
        discountType:
            (payload?.discountType as SpendMilestoneDiscountType) || defaults.discountType,
        discountValue:
            payload?.discountValue !== undefined
                ? Number(payload.discountValue)
                : defaults.discountValue,
        validDays: Number(payload?.validDays) || defaults.validDays,
        minOrderAmount:
            payload?.minOrderAmount !== undefined && payload?.minOrderAmount !== null
                ? Number(payload.minOrderAmount)
                : undefined,
        maxDiscountAmount:
            payload?.maxDiscountAmount !== undefined && payload?.maxDiscountAmount !== null
                ? Number(payload.maxDiscountAmount)
                : undefined,
    };
};

export const validateRegistrationPayload = (
    payload: RegistrationPromocodePayload
): { valid: boolean; errorKey?: string } => {
    if (payload.discountType !== 'FREE_SERVICE' && !(payload.discountValue > 0)) {
        return { valid: false, errorKey: 'validation.registrationDiscountValueRequired' };
    }
    if (payload.discountType === 'PERCENTAGE' && payload.discountValue > 100) {
        return { valid: false, errorKey: 'validation.registrationPercentageRange' };
    }
    if (!payload.validDays || payload.validDays < 1) {
        return { valid: false, errorKey: 'validation.spendMilestoneInvalidValidDays' };
    }
    return { valid: true };
};

export const areRegistrationPayloadsEqual = (
    a: RegistrationPromocodePayload,
    b: RegistrationPromocodePayload
): boolean => JSON.stringify(a) === JSON.stringify(b);

// The backend accepts the REGISTRATION condition only after the campaign has a
// placementId, so call this after the region is saved.
export const ensureRegistrationCondition = async (campaignId: number): Promise<void> => {
    const { conditions } = await getMarketingConditionsById(campaignId);
    const hasCondition = conditions?.some(
        condition => condition.type === MarketingCampaignConditionType.REGISTRATION
    );
    if (hasCondition) return;

    await createNewMarketingConditions(
        { type: MarketingCampaignConditionType.REGISTRATION },
        campaignId
    );
};
