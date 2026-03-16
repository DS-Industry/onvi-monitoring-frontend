import { useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { getOrganization } from '@/services/api/organization';
import { getSubscriptionRequests } from '@/services/api/subscription';
import type { Organization } from '@/services/api/organization';
import type { KeyedMutator } from 'swr';
import type { SubscriptionRequestResponseDto } from '@/services/api/subscription';
import {
  getLatestSubscriptionRequest,
  isStepDisabled as isStepDisabledFn,
  ORGANIZATION_STATUS,
} from '../utils';
import type { PlanId } from '../types';

type UserWithOrg = {
  organizationId?: number | null;
  organizations?: { id: number; name: string }[] | null;
};

export type UseCreateOrganizationStateResult = {
  organizationsData: Organization[] | undefined;
  orgLoading: boolean;
  orgError: Error | null;
  mutateOrganizations: KeyedMutator<Organization[]>;
  subscriptionRequestsData: SubscriptionRequestResponseDto[] | undefined;
  mutateSubscriptionRequests: KeyedMutator<SubscriptionRequestResponseDto[]>;
  subLoading: boolean;
  subError: Error | null;
  organizationId: number | null;
  latestSubscriptionRequest: SubscriptionRequestResponseDto | null;
  isSubscriptionRequestPending: boolean;
  isSubscriptionRequestReady: boolean;
  isSubscriptionPaymentRequested: boolean;
  isSubscriptionApproved: boolean;
  hasOrganization: boolean;
  isVerificateStatus: boolean;
  isPendingOrganizationStatus: boolean;
  isActiveStatus: boolean;
  isStepDisabled: (index: number) => boolean;
  pendingRequestId: number | null;
  isOfferAccepted: boolean;
};

export function useCreateOrganizationState(
  currentUser: UserWithOrg | null,
  existingOrganization: Organization | null,
  selectedPlan: PlanId | null
): UseCreateOrganizationStateResult {
  const {
    data: organizationsData,
    isLoading: orgLoading,
    error: orgError,
    mutate: mutateOrganizations,
  } = useSWR('user/organization/filter-create', () => getOrganization({}));

  const organizationId =
    currentUser?.organizationId ?? existingOrganization?.id ?? null;

  const {
    data: subscriptionRequestsData,
    mutate: mutateSubscriptionRequests,
    isLoading: subLoading,
    error: subError,
  } = useSWR(
    organizationId ? ['subscription-requests', organizationId] : null,
    () => getSubscriptionRequests(Number(organizationId))
  );

  const latestSubscriptionRequest = useMemo(
    () => getLatestSubscriptionRequest(subscriptionRequestsData),
    [subscriptionRequestsData]
  );

  const subscriptionRequestStatus = latestSubscriptionRequest?.status ?? null;
  console.log("latestSubscriptionRequest: ", latestSubscriptionRequest);
  const statusUpper =
    typeof subscriptionRequestStatus === 'string'
      ? subscriptionRequestStatus.toUpperCase()
      : '';
  const isSubscriptionRequestPending = statusUpper === 'PENDING';
  const isSubscriptionRequestReady = statusUpper === 'READY';
  const isSubscriptionPaymentRequested = statusUpper === 'PAYMENT_REQUESTED';
  const isSubscriptionApproved = statusUpper === 'APPROVED';

  console.log("statusUpper: ", statusUpper);

  const hasOrganization = organizationId != null;
  const organizationStatus = existingOrganization?.organizationStatus;
  const isVerificateStatus =
    organizationStatus === ORGANIZATION_STATUS.VERIFICATE;
  const isPendingOrganizationStatus =
    organizationStatus === ORGANIZATION_STATUS.PENDING;
  const isActiveStatus = organizationStatus === ORGANIZATION_STATUS.ACTIVE;

  const hasSubscriptionRequest = latestSubscriptionRequest != null;

  const isOfferAccepted = Boolean(existingOrganization?.offerAcceptedAt);

  const isStepDisabled = useCallback(
    (stepIndex: number) =>
      isStepDisabledFn({
        stepIndex,
        hasOrganization,
        organizationStatus,
        hasExistingOrganization: existingOrganization != null,
        selectedPlan,
        isSubscriptionRequestReady,
        hasSubscriptionRequest,
      }),
    [
      hasOrganization,
      organizationStatus,
      existingOrganization,
      selectedPlan,
      isSubscriptionRequestReady,
      hasSubscriptionRequest,
    ]
  );

  const pendingRequestId =
    isSubscriptionRequestPending && latestSubscriptionRequest?.id != null
      ? latestSubscriptionRequest.id
      : null;

  return {
    organizationsData,
    orgLoading,
    orgError: orgError ?? null,
    mutateOrganizations,
    subscriptionRequestsData,
    mutateSubscriptionRequests,
    subLoading,
    subError: subError ?? null,
    organizationId,
    latestSubscriptionRequest,
    isSubscriptionRequestPending,
    isSubscriptionRequestReady,
    isSubscriptionPaymentRequested,
    isSubscriptionApproved,
    hasOrganization,
    isVerificateStatus,
    isPendingOrganizationStatus,
    isActiveStatus,
    isStepDisabled,
    pendingRequestId,
    isOfferAccepted,
  };
}
