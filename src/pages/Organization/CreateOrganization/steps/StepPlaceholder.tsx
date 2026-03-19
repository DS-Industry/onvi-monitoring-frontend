import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateOrganizationContext } from '../context';

type StepPlaceholderProps = {
  translationKey: string;
};

const StepPlaceholder: React.FC<StepPlaceholderProps> = ({ translationKey }) => {
  const { t } = useTranslation();
  const {
    isSubscriptionRequestReady,
    isSubscriptionPaymentRequested,
    isSubscriptionApproved,
  } = useCreateOrganizationContext();

  let messageKey = translationKey;
  if (isSubscriptionPaymentRequested) {
    messageKey = 'paymentRequested';
  } else if (isSubscriptionRequestReady) {
    messageKey = 'paymentWillArrive';
  } else if (isSubscriptionApproved) {
    messageKey = 'subscriptionPaid';
  }

  return (
    <div className="w-full max-w-[560px] rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] p-4 sm:p-6 md:p-8 shadow-xl shadow-black/30">
      <div className="mb-6">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#BFFA00]">
          {t('createOrganization.stepLabel4')}
        </span>
      </div>
      <div className="py-8 sm:py-10 md:py-14 text-center">
        <div className="w-14 h-14 rounded-full bg-[#2563eb]/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-[#2563eb]">✓</span>
        </div>
        <p className="text-[#a3a3a3] text-sm sm:text-base max-w-sm mx-auto">
          {t(`createOrganization.${messageKey}`)}
        </p>
      </div>
    </div>
  );
};

export default StepPlaceholder;
