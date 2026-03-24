import { Spin } from 'antd';
import { Navigate } from 'react-router-dom';
import React from 'react';
import useSubscriptionStore from '@/config/store/subscriptionSlice';
import SubscriptionPlaceholder from '@/components/subscription/SubscriptionPlaceholder';
import {
  canAccessTariff,
  getFeatureCodesFromPermissions,
  type TariffFallbackMode,
  type TariffRequirements,
} from '@/subscription/tariffAccess';

type TariffGuardProps = {
  children: React.ReactNode;
  routeName?: string;
  requirements?: TariffRequirements;
  permissions?: { subject: string; action: string }[];
  fallback?: TariffFallbackMode;
  redirectTo?: string;
};

const TariffGuard = ({
  children,
  routeName,
  requirements,
  permissions = [],
  fallback = 'placeholder',
  redirectTo = '/',
}: TariffGuardProps) => {
  const activeSubscription = useSubscriptionStore(
    state => state.activeSubscription
  );
  const subscriptionStatus = useSubscriptionStore(state => state.status);

  const autoRequiredFeatures = getFeatureCodesFromPermissions(permissions);
  const resolvedRequirements: TariffRequirements | undefined =
    requirements && requirements.requiredTariffFeatures?.length
      ? requirements
      : autoRequiredFeatures.length > 0
        ? {
            ...requirements,
            requiredTariffFeatures: autoRequiredFeatures,
            requiredTariffFeaturesMode: 'any',
          }
        : requirements;

  const access = canAccessTariff(
    activeSubscription,
    subscriptionStatus,
    resolvedRequirements
  );

  if (access.pending) {
    return (
      <div className="w-full p-10 flex justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (access.allowed) {
    return <>{children}</>;
  }

  if (fallback === 'redirect') {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <SubscriptionPlaceholder
      routeName={routeName}
      requirements={requirements}
      reason={access.reason}
    />
  );
};

export default TariffGuard;
