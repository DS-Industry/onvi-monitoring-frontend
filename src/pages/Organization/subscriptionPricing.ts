import type {
  OrganizationSubscriptionResponseDto,
  SubscriptionPlanCode,
} from '@/services/api/subscription';

export const PLAN_BASE_PRICES: Record<SubscriptionPlanCode, number> = {
  BASIC: 0,
  SPACE: 3000,
  BUSINESS: 5000,
  CUSTOM: 0,
};

export const CUSTOM_POS_UNIT_PRICE = 1000;
export const CUSTOM_USER_UNIT_PRICE = 100;

export const ONVI_FEATURE_PRICE = 5000;
export const CORPORATE_CLIENTS_FEATURE_PRICE = 10000;

export function calculateMonthlyAmountFromSubscription(
  subscription: OrganizationSubscriptionResponseDto
): number {
  const planCode = subscription.planName as SubscriptionPlanCode | undefined;

  if (!planCode) return 0;

  const basePrice = PLAN_BASE_PRICES[planCode];
  if (basePrice === undefined) {
    return 0;
  }

  let amount = basePrice;

  const posesCount = subscription.posesCount ?? 0;
  const usersCount = subscription.usersCount ?? 0;

  amount += posesCount * CUSTOM_POS_UNIT_PRICE;
  amount += usersCount * CUSTOM_USER_UNIT_PRICE;

  if (subscription.onviFeature) {
    amount += ONVI_FEATURE_PRICE;
  }

  if (subscription.corporateClientsFeature) {
    amount += CORPORATE_CLIENTS_FEATURE_PRICE;
  }

  return amount;
}

