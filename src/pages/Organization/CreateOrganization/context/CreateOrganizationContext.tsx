import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/context/useContext';
import { useUser, useSetUser, useClearUserData } from '@/hooks/useUserStore';
import {
  useCreateOrganizationState,
  useCreateOrganizationMutations,
} from '../hooks';
import { getPlanAndConnectionFromRequest } from '../utils';
import type { SubscriptionRequestResponseDto } from '@/services/api/subscription';
import {
  type PlanId,
  type ConnectionType,
  CUSTOM_PLAN_DEFAULT_POSES,
  CUSTOM_PLAN_DEFAULT_USERS,
  CUSTOM_PLAN_MIN_POSES,
  CUSTOM_PLAN_MAX_POSES,
  CUSTOM_PLAN_MIN_USERS,
  CUSTOM_PLAN_MAX_USERS,
} from '../types';
import type { Organization } from '@/services/api/organization';
import type { DetailsFormData } from '../steps/StepDetails.types';
import { CreateOrganizationSkeleton } from '../CreateOrganizationSkeleton';

export type CreateOrganizationContextValue = {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isStepDisabled: (index: number) => boolean;

  existingOrganization: Organization | null;
  organizationId: number | null;
  isVerificateStatus: boolean;
  isSubscriptionRequestPending: boolean;
  isSubscriptionRequestReady: boolean;
  isSubscriptionPaymentRequested: boolean;
  isSubscriptionApproved: boolean;
  pendingRequestId: number | null;
  isOfferAccepted: boolean;
  latestSubscriptionRequest: SubscriptionRequestResponseDto | null;

  selectedPlan: PlanId | null;
  setSelectedPlan: (plan: PlanId | null) => void;
  addonMobile: boolean;
  setAddonMobile: (v: boolean) => void;
  addonCorporate: boolean;
  setAddonCorporate: (v: boolean) => void;
  customPoses: number;
  setCustomPoses: (v: number) => void;
  customUsers: number;
  setCustomUsers: (v: number) => void;
  selectedConnectionType: ConnectionType | null;
  setSelectedConnectionType: (t: ConnectionType | null) => void;

  formDefaultValues: DetailsFormData | null;

  submitOrganization: (formData: DetailsFormData) => Promise<unknown>;
  isMutatingPrecreate: boolean;
  createSubscriptionRequestAction: (payload: {
    organizationId: number;
    selectedPlan: PlanId;
    addonMobile: boolean;
    addonCorporate: boolean;
    selectedConnectionType: ConnectionType | null;
    customPoses?: number;
    customUsers?: number;
  }) => Promise<void>;
  isSubmittingSubscription: boolean;
  updatePlanAction: (payload: {
    requestId: number;
    selectedPlan: PlanId;
    addonMobile: boolean;
    addonCorporate: boolean;
    customPoses?: number;
    customUsers?: number;
  }) => Promise<void>;
  isUpdatingPlan: boolean;
  updateConnectionTypeAction: (payload: {
    requestId: number;
    selectedConnectionType: ConnectionType;
  }) => Promise<void>;
  isUpdatingConnectionType: boolean;

  setSearchParams: (params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)) => void;

  showToast: (message: string, type: 'success' | 'error') => void;
  t: (key: string) => string;
  clearData: () => void;

  orgLoading: boolean;
  orgError: Error | null;
  subLoading: boolean;
  subError: Error | null;
  mutateOrganizations: () => void | Promise<unknown>;
  mutateSubscriptionRequests: () => void | Promise<unknown>;
  canCreateOrganization: boolean;
};

const CreateOrganizationContext =
  createContext<CreateOrganizationContextValue | null>(null);

export function useCreateOrganizationContext(): CreateOrganizationContextValue {
  const ctx = useContext(CreateOrganizationContext);
  if (ctx == null) {
    throw new Error(
      'useCreateOrganizationContext must be used within CreateOrganizationProvider'
    );
  }
  return ctx;
}

type CreateOrganizationProviderProps = {
  children: React.ReactNode;
};

export function CreateOrganizationProvider({
  children,
}: CreateOrganizationProviderProps) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const currentUser = useUser();
  const setUser = useSetUser();
  const clearData = useClearUserData();

  const [currentStep, setCurrentStep] = useState(0);
  const [existingOrganization, setExistingOrganization] =
    useState<Organization | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [addonMobile, setAddonMobile] = useState(false);
  const [addonCorporate, setAddonCorporate] = useState(false);
  const [customPoses, setCustomPoses] = useState(CUSTOM_PLAN_DEFAULT_POSES);
  const [customUsers, setCustomUsers] = useState(CUSTOM_PLAN_DEFAULT_USERS);
  const [selectedConnectionType, setSelectedConnectionType] =
    useState<ConnectionType | null>(null);
  const [formDefaultValues, setFormDefaultValues] =
    useState<DetailsFormData | null>(null);

  const state = useCreateOrganizationState(
    currentUser,
    existingOrganization,
    selectedPlan
  );

  const {
    organizationsData,
    orgLoading,
    orgError,
    mutateOrganizations,
    mutateSubscriptionRequests,
    subLoading,
    subError,
    organizationId,
    latestSubscriptionRequest,
    isSubscriptionRequestPending,
    isSubscriptionRequestReady,
    isSubscriptionPaymentRequested,
    isSubscriptionApproved,
    isVerificateStatus,
    isStepDisabled,
    pendingRequestId,
    isOfferAccepted,
    canCreateOrganization
  } = state;

  const mutations = useCreateOrganizationMutations({
    showToast,
    t,
    clearData,
    setUser,
    currentUser,
    mutateSubscriptionRequests,
  });

  const {
    submitOrganization,
    isMutatingPrecreate,
    createSubscriptionRequestAction,
    isSubmittingSubscription,
    updatePlanAction,
    isUpdatingPlan,
    updateConnectionTypeAction,
    isUpdatingConnectionType,
  } = mutations;

  useEffect(() => {
    const { plan, connectionType } =
      getPlanAndConnectionFromRequest(latestSubscriptionRequest);
    if (connectionType != null) setSelectedConnectionType(connectionType);
    if (latestSubscriptionRequest) {
      if (latestSubscriptionRequest.onviFeature != null) {
        setAddonMobile(latestSubscriptionRequest.onviFeature);
      }
      if (latestSubscriptionRequest.corporateClientsFeature != null) {
        setAddonCorporate(latestSubscriptionRequest.corporateClientsFeature);
      }
    }
    if (plan != null) {
      setSelectedPlan(plan);
      if (plan === 'custom' && latestSubscriptionRequest) {
        const poses = latestSubscriptionRequest.posesCount;
        const users = latestSubscriptionRequest.usersCount;
        if (poses != null && !Number.isNaN(poses)) {
          setCustomPoses(
            Math.min(CUSTOM_PLAN_MAX_POSES, Math.max(CUSTOM_PLAN_MIN_POSES, poses))
          );
        }
        if (users != null && !Number.isNaN(users)) {
          setCustomUsers(
            Math.min(CUSTOM_PLAN_MAX_USERS, Math.max(CUSTOM_PLAN_MIN_USERS, users))
          );
        }
      }
    }
  }, [latestSubscriptionRequest]);

  useEffect(() => {
    if (!organizationsData) return;

    const org = currentUser.organizationId ? organizationsData.find(o => o.id === currentUser.organizationId) : organizationsData?.at(0);
    setExistingOrganization(org ?? null);

    const orgInUserList = currentUser?.organizations?.some(o => o.id === org?.id);
    if (currentUser && !orgInUserList) {
      if (org) {
        setUser({
          user: {
            ...currentUser,
            organizations: [
              ...(currentUser.organizations ?? []),
              { id: org.id, name: org.name },
            ],
            organizationId: org.id,
          },
        });
      }
    }

    setFormDefaultValues({
      fullName: org?.name ?? '',
      shortName: org?.shortName ?? '',
      organizationType: org?.organizationType ?? '',
      addressRegistration: org?.address ?? '',
      additionalAddress: org?.additionalAddress ?? '',
      phone: org?.phone ?? '',
      email: org?.email ?? currentUser?.email ?? '',
      inn: org?.inn ?? '',
      kpp: org?.kpp ?? '',
      ogrn: org?.ogrn ?? '',
      bank: org?.bank ?? '',
      bik: org?.bik ?? '',
      settlementAccount: org?.settlementAccount ?? '',
      correspondentAccount: org?.correspondentAccount ?? '',
      addressBank: org?.addressBank ?? '',
      rateVat: org?.rateVat ?? '',
      okpo: org?.okpo ?? '',
    });
  }, [
    organizationsData,
    searchParams,
    selectedPlan,
    latestSubscriptionRequest,
    currentUser,
    setUser,
    setSearchParams,
  ]);

  const value: CreateOrganizationContextValue = {
    currentStep,
    setCurrentStep,
    isStepDisabled,
    existingOrganization,
    organizationId,
    isVerificateStatus,
    isSubscriptionRequestPending,
    isSubscriptionRequestReady,
    isSubscriptionPaymentRequested,
    isSubscriptionApproved,
    pendingRequestId,
    isOfferAccepted,
    latestSubscriptionRequest,
    selectedPlan,
    setSelectedPlan,
    addonMobile,
    setAddonMobile,
    addonCorporate,
    setAddonCorporate,
    customPoses,
    setCustomPoses,
    customUsers,
    setCustomUsers,
    selectedConnectionType,
    setSelectedConnectionType,
    formDefaultValues,
    submitOrganization,
    isMutatingPrecreate,
    createSubscriptionRequestAction,
    isSubmittingSubscription,
    updatePlanAction,
    isUpdatingPlan,
    updateConnectionTypeAction,
    isUpdatingConnectionType,
    setSearchParams,
    showToast,
    t,
    clearData,
    orgLoading,
    orgError,
    subLoading,
    subError,
    mutateOrganizations,
    mutateSubscriptionRequests,
    canCreateOrganization
  };

  return (
    <CreateOrganizationContext.Provider value={value}>
      {children}
    </CreateOrganizationContext.Provider>
  );
}

export function CreateOrganizationContent({ children }: CreateOrganizationContentProps) {
  const {
    t,
    orgLoading,
    orgError,
    subError,
    organizationId,
    subLoading,
    mutateOrganizations,
    mutateSubscriptionRequests,
  } = useCreateOrganizationContext();

  const isLoading = orgLoading || (organizationId != null && subLoading);
  const error = orgError ?? subError;
  const retry = useCallback(() => {
    void mutateOrganizations();
    if (organizationId != null) void mutateSubscriptionRequests();
  }, [mutateOrganizations, mutateSubscriptionRequests, organizationId]);

  if (isLoading) {
    return <CreateOrganizationSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black text-gray-300 p-4">
        <p>{t('createOrganization.errorLoading')}</p>
        <button
          type="button"
          onClick={retry}
          className="px-5 py-2.5 rounded-xl bg-[#2563eb] text-white font-medium hover:bg-[#1d4ed8] transition-colors border border-[#2563eb]"
        >
          {t('createOrganization.retry')}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

export type CreateOrganizationContentProps = {
  children: React.ReactNode;
};