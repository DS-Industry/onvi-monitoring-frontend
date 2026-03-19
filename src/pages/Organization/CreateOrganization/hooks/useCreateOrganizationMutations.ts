import useSWRMutation from 'swr/mutation';
import { precreateOrganization } from '@/services/api/platform';
import {
  createSubscriptionRequest,
  updateSubscriptionRequest,
} from '@/services/api/subscription';
import api from '@/config/axiosConfig';
import { PLAN_TO_API } from '../types';
import type { PlanId, ConnectionType } from '../types';
import type { DetailsFormData } from '../steps/StepDetails.types';
import type { KeyedMutator } from 'swr';
import type { SubscriptionRequestResponseDto } from '@/services/api/subscription';
import type { User } from '@/config/store/userSlice';

type CreateSubscriptionPayload = {
  organizationId: number;
  selectedPlan: PlanId;
  addonMobile: boolean;
  addonCorporate: boolean;
  selectedConnectionType: ConnectionType | null;
  customPoses?: number;
  customUsers?: number;
};

type UpdatePlanPayload = {
  requestId: number;
  selectedPlan: PlanId;
  addonMobile: boolean;
  addonCorporate: boolean;
  customPoses?: number;
  customUsers?: number;
};

type UpdateConnectionPayload = {
  requestId: number;
  selectedConnectionType: ConnectionType;
};

type ToastFn = (message: string, type: 'success' | 'error') => void;
type TFn = (key: string) => string;

type UseCreateOrganizationMutationsOptions = {
  showToast: ToastFn;
  t: TFn;
  clearData: () => void;
  setUser: (payload: { user: User }) => void;
  currentUser: User | null;
  mutateSubscriptionRequests: KeyedMutator<SubscriptionRequestResponseDto[]>;
};

export function useCreateOrganizationMutations({
  showToast,
  t,
  clearData,
  setUser,
  currentUser,
  mutateSubscriptionRequests,
}: UseCreateOrganizationMutationsOptions) {
  const { trigger: triggerPrecreate, isMutating: isMutatingPrecreate } =
    useSWRMutation(
      ['precreate-org'] as const,
      async (
        _key: readonly [string],
        { arg }: { arg: DetailsFormData }
      ) => {
        return precreateOrganization({
          fullName: arg.fullName,
          shortName: arg.shortName,
          organizationType: arg.organizationType,
          addressRegistration: arg.addressRegistration,
          additionalAddress: arg.additionalAddress,
          phone: arg.phone,
          email: arg.email,
          inn: arg.inn,
          kpp: arg.kpp,
          ogrn: arg.ogrn,
          bank: arg.bank,
          bik: arg.bik,
          settlementAccount: arg.settlementAccount,
          correspondentAccount: arg.correspondentAccount,
          addressBank: arg.addressBank,
          rateVat: arg.rateVat,
          okpo: arg.okpo,
        });
      }
    );

  const {
    trigger: triggerCreateSubscriptionRequest,
    isMutating: isSubmittingSubscription,
  } = useSWRMutation(
    'subscription/request',
    async (_key: string, { arg }: { arg: CreateSubscriptionPayload }) => {
      const {
        organizationId,
        selectedPlan,
        addonMobile,
        addonCorporate,
        selectedConnectionType,
        customPoses,
        customUsers,
      } = arg;
      const body: Parameters<typeof createSubscriptionRequest>[0] = {
        subscriptionPlan: PLAN_TO_API[selectedPlan],
        onviFeature: addonMobile,
        corporateClientsFeature: addonCorporate,
        connectionType: selectedConnectionType ?? undefined,
        organizationId,
      };
      if (selectedPlan === 'custom') {
        if (customPoses != null) body.posesCount = customPoses;
        if (customUsers != null) body.usersCount = customUsers;
      }
      return createSubscriptionRequest(body);
    }
  );

  const { trigger: triggerUpdatePlan, isMutating: isUpdatingPlan } =
    useSWRMutation(
      'subscription/request/update-plan',
      async (_key: string, { arg }: { arg: UpdatePlanPayload }) => {
        const {
          requestId,
          selectedPlan,
          addonMobile,
          addonCorporate,
          customPoses,
          customUsers,
        } = arg;
        const body: Parameters<typeof updateSubscriptionRequest>[1] = {
          subscriptionPlan: PLAN_TO_API[selectedPlan],
          onviFeature: addonMobile,
          corporateClientsFeature: addonCorporate,
        };
        if (selectedPlan === 'custom') {
          if (customPoses != null) body.posesCount = customPoses;
          if (customUsers != null) body.usersCount = customUsers;
        }
        return updateSubscriptionRequest(requestId, body);
      }
    );

  const {
    trigger: triggerUpdateConnectionType,
    isMutating: isUpdatingConnectionType,
  } = useSWRMutation(
    'subscription/request/update-connection',
    async (_key: string, { arg }: { arg: UpdateConnectionPayload }) => {
      const { requestId, selectedConnectionType } = arg;
      return updateSubscriptionRequest(requestId, {
        connectionType: selectedConnectionType,
      });
    }
  );

  const submitOrganization = async (formData: DetailsFormData) => {
    const result = await triggerPrecreate(formData);
    if (result && currentUser) {
      setUser({
        user: {
          ...currentUser,
          organizations: [
            ...(currentUser.organizations ?? []),
            { id: result.id, name: result.name },
          ],
          organizationId: result.id,
        },
      });
      try {
        await api.post('/user/auth/refresh');
      } catch {
        console.error('Failed to refresh token');
      }
      window.location.reload();
    }
    return result;
  };

  const createSubscriptionRequestAction = async (
    payload: CreateSubscriptionPayload
  ) => {
    await triggerCreateSubscriptionRequest(payload);
    await mutateSubscriptionRequests();
    showToast(t('createOrganization.toast.subscriptionRequestCreated'), 'success');
  };

  const updatePlanAction = async (payload: UpdatePlanPayload) => {
    await triggerUpdatePlan(payload);
    await mutateSubscriptionRequests();
    showToast(t('createOrganization.toast.planUpdated'), 'success');
  };

  const updateConnectionTypeAction = async (
    payload: UpdateConnectionPayload
  ) => {
    await triggerUpdateConnectionType(payload);
    await mutateSubscriptionRequests();
    showToast(t('createOrganization.toast.connectionTypeUpdated'), 'success');
  };

  return {
    triggerPrecreate,
    submitOrganization,
    isMutatingPrecreate,
    createSubscriptionRequestAction,
    isSubmittingSubscription,
    updatePlanAction,
    isUpdatingPlan,
    updateConnectionTypeAction,
    isUpdatingConnectionType,
    showToast,
    t,
    clearData,
  };
}
