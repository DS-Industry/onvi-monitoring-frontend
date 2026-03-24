import { create } from 'zustand';
import type { OrganizationSubscriptionResponseDto } from '@/services/api/subscription';

export type SubscriptionLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

type SubscriptionState = {
  activeSubscription: OrganizationSubscriptionResponseDto | null;
  status: SubscriptionLoadStatus;
  setActiveSubscription: (
    active: OrganizationSubscriptionResponseDto | null
  ) => void;
  setStatus: (status: SubscriptionLoadStatus) => void;
  resetSubscriptionState: () => void;
  clearActiveSubscription: () => void;
};

const useSubscriptionStore = create<SubscriptionState>(set => ({
  activeSubscription: null,
  status: 'idle',
  setActiveSubscription: active => set({ activeSubscription: active }),
  setStatus: status => set({ status }),
  resetSubscriptionState: () =>
    set({ activeSubscription: null, status: 'idle' }),
  clearActiveSubscription: () =>
    set({ activeSubscription: null, status: 'idle' }),
}));

export default useSubscriptionStore;

