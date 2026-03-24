import type { SubscriptionPlanCode } from '@/services/api/subscription';
import type { OrganizationSubscriptionResponseDto } from '@/services/api/subscription';
import type { SubscriptionLoadStatus } from '@/config/store/subscriptionSlice';

export type TariffFallbackMode = 'placeholder' | 'redirect';
export type TariffFeatureMatchMode = 'all' | 'any';

type PermissionLike = {
  subject: string;
  action: string;
};

const FEATURE_CODE_SUBJECTS = new Set([
  'ORGANIZATION',
  'POS',
  'INCIDENT',
  'TECHTASK',
  'WAREHOUSE',
  'CASHCOLLECTION',
  'SHIFTREPORT',
  'LTYPROGRAM',
  'HR',
  'MANAGERPAPER',
]);

export type TariffRequirements = {
  requiredTariffFeatures?: string[];
  requiredTariffFeaturesMode?: TariffFeatureMatchMode;
  requiredPlanCodes?: SubscriptionPlanCode[];
  tariffFallback?: TariffFallbackMode;
};

export type TariffAccessResult = {
  allowed: boolean;
  pending: boolean;
  reason?: 'missing_subscription' | 'inactive_subscription' | 'feature' | 'plan';
};

const normalizeFeature = (feature: string): string => feature.trim().toUpperCase();

const resolvePlanCode = (
  subscription: OrganizationSubscriptionResponseDto
): SubscriptionPlanCode | undefined => {
  return (
    subscription.planCode ||
    (subscription.planName
      ? (normalizeFeature(subscription.planName) as SubscriptionPlanCode)
      : undefined)
  );
};

const isAddonEligiblePlan = (
  subscription: OrganizationSubscriptionResponseDto
): boolean => {
  const planCode = resolvePlanCode(subscription);
  return planCode === 'BUSINESS' || planCode === 'CUSTOM';
};

export const getFeatureCodesFromPermissions = (
  permissions: PermissionLike[] = []
): string[] => {
  const features = new Set<string>();

  permissions.forEach(permission => {
    const normalizedSubject = normalizeFeature(permission.subject);
    if (FEATURE_CODE_SUBJECTS.has(normalizedSubject)) {
      features.add(permission.subject);
    }
  });

  return Array.from(features);
};

const hasRequiredFeatures = (
  subscription: OrganizationSubscriptionResponseDto,
  requiredTariffFeatures: string[],
  matchMode: TariffFeatureMatchMode
): boolean => {
  const backendFeatures = new Set(
    (subscription.planFeatures || []).map(normalizeFeature)
  );

  const checkFeature = (feature: string): boolean => {
    const normalized = normalizeFeature(feature);

    if (normalized === 'ONVI') {
      return isAddonEligiblePlan(subscription) && subscription.onviFeature === true;
    }

    if (
      normalized === 'CORPORATE_CLIENTS' ||
      normalized === 'CORPORATECLIENTS'
    ) {
      return (
        isAddonEligiblePlan(subscription) &&
        subscription.corporateClientsFeature === true
      );
    }

    if (backendFeatures.has(normalized)) {
      return true;
    }

    return false;
  };

  return matchMode === 'any'
    ? requiredTariffFeatures.some(checkFeature)
    : requiredTariffFeatures.every(checkFeature);
};

const hasRequiredPlan = (
  subscription: OrganizationSubscriptionResponseDto,
  requiredPlanCodes: SubscriptionPlanCode[]
): boolean => {
  const resolvedPlanCode = resolvePlanCode(subscription);

  if (!resolvedPlanCode) return false;
  return requiredPlanCodes.includes(resolvedPlanCode);
};

const isSubscriptionActive = (
  subscription: OrganizationSubscriptionResponseDto
): boolean => {
  return subscription.status === 'ACTIVE';
};

export const canAccessTariff = (
  subscription: OrganizationSubscriptionResponseDto | null,
  status: SubscriptionLoadStatus,
  requirements?: TariffRequirements
): TariffAccessResult => {
  if (!requirements) {
    return { allowed: true, pending: false };
  }

  const requiredTariffFeatures = requirements.requiredTariffFeatures || [];
  const requiredTariffFeaturesMode =
    requirements.requiredTariffFeaturesMode || 'all';
  const requiredPlanCodes = requirements.requiredPlanCodes || [];
  const requiresTariff =
    requiredTariffFeatures.length > 0 || requiredPlanCodes.length > 0;

  if (!requiresTariff) {
    return { allowed: true, pending: false };
  }

  if (status === 'loading') {
    return { allowed: false, pending: true };
  }

  if (!subscription) {
    return { allowed: false, pending: false, reason: 'missing_subscription' };
  }

  if (!isSubscriptionActive(subscription)) {
    return { allowed: false, pending: false, reason: 'inactive_subscription' };
  }

  if (
    requiredTariffFeatures.length > 0 &&
    !hasRequiredFeatures(
      subscription,
      requiredTariffFeatures,
      requiredTariffFeaturesMode
    )
  ) {
    return { allowed: false, pending: false, reason: 'feature' };
  }

  if (
    requiredPlanCodes.length > 0 &&
    !hasRequiredPlan(subscription, requiredPlanCodes)
  ) {
    return { allowed: false, pending: false, reason: 'plan' };
  }

  return { allowed: true, pending: false };
};
