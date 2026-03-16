import type { SubscriptionRequestResponseDto } from '@/services/api/subscription';
import type { Organization } from '@/services/api/organization';
import { API_CODE_TO_PLAN, type PlanId, type ConnectionType } from './types';

export const ORGANIZATION_STATUS = {
  PENDING: 'PENDING',
  VERIFICATE: 'VERIFICATE',
  ACTIVE: 'ACTIVE',
} as const;

export function getLatestSubscriptionRequest(
  list: SubscriptionRequestResponseDto[] | undefined
): SubscriptionRequestResponseDto | null {
  if (!Array.isArray(list) || list.length === 0) return null;
  const sorted = [...list].sort(
    (a, b) =>
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
  return sorted[0];
}

export type StepDisabledInput = {
  stepIndex: number;
  hasOrganization: boolean;
  organizationStatus: Organization['organizationStatus'] | undefined;
  hasExistingOrganization: boolean;
  selectedPlan: PlanId | null;
  isSubscriptionRequestReady: boolean;
  hasSubscriptionRequest: boolean;
};

export function isStepDisabled(input: StepDisabledInput): boolean {
  const {
    stepIndex,
    hasOrganization,
    organizationStatus,
    hasExistingOrganization,
    selectedPlan,
    isSubscriptionRequestReady,
    hasSubscriptionRequest,
  } = input;

  const isVerificate = organizationStatus === ORGANIZATION_STATUS.VERIFICATE;
  const isPending = organizationStatus === ORGANIZATION_STATUS.PENDING;
  const isActive = organizationStatus === ORGANIZATION_STATUS.ACTIVE;


  console.log({
    isVerificate,
    isPending,
    isActive,
    isSubscriptionRequestReady
  })

  if (stepIndex === 0) return false;
  if (stepIndex === 1) return !hasOrganization || isVerificate;
  if (stepIndex === 2) {
    if (isSubscriptionRequestReady) return false;
    return (
      !hasSubscriptionRequest ||
      !selectedPlan ||
      isVerificate ||
      isPending ||
      (hasExistingOrganization && !isActive)
    );
  }

  if (stepIndex === 3) {
    if (isSubscriptionRequestReady) return false;
    return (
      !hasSubscriptionRequest ||
      !selectedPlan ||
      isVerificate ||
      isPending ||
      (hasExistingOrganization && !isActive)
    );
  }

  if (stepIndex === 4) {
    if (isSubscriptionRequestReady) return false;
    return (
      !hasSubscriptionRequest ||
      !selectedPlan ||
      isVerificate ||
      isPending ||
      (hasExistingOrganization && !isActive)
    );
  }

  if (stepIndex == 5) {
    if (isSubscriptionRequestReady) return false;
    return (
      !hasSubscriptionRequest ||
      !selectedPlan ||
      isVerificate ||
      isPending ||
      (hasExistingOrganization && !isActive)
    );
  }

  return true;
}

export function getPlanAndConnectionFromRequest(
  latest: SubscriptionRequestResponseDto | null
): { plan: PlanId | null; connectionType: ConnectionType | null } {
  if (!latest) return { plan: null, connectionType: null };
  const plan =
    latest.planCode && API_CODE_TO_PLAN[latest.planCode]
      ? API_CODE_TO_PLAN[latest.planCode]
      : null;
  const connectionType =
    latest.connectionType === 'DS_EQUIPMENT' ||
    latest.connectionType === 'COUPLING_MODULE'
      ? (latest.connectionType as ConnectionType)
      : null;
  return { plan, connectionType };
}
