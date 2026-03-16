import { create } from 'zustand';
import type { OrganizationSubscriptionResponseDto } from '@/services/api/subscription';

type SubscriptionState = {
  activeSubscription: OrganizationSubscriptionResponseDto | null;
  setActiveSubscription: (
    active: OrganizationSubscriptionResponseDto | null
  ) => void;
  clearActiveSubscription: () => void;
};

const useSubscriptionStore = create<SubscriptionState>(set => ({
  activeSubscription: null,
  setActiveSubscription: active => set({ activeSubscription: active }),
  clearActiveSubscription: () => set({ activeSubscription: null }),
}));

export default useSubscriptionStore;

