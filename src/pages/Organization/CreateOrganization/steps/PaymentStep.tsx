import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import { useCreateOrganizationContext } from '../context';
import { requestSubscriptionPayment } from '@/services/api/subscription';

const PaymentStep: React.FC = () => {
  const { t } = useTranslation();
  const {
    latestSubscriptionRequest,
    isSubscriptionRequestPending,
    isSubscriptionRequestReady,
    isSubscriptionPaymentRequested,
    isSubscriptionApproved,
    mutateSubscriptionRequests,
    showToast,
  } = useCreateOrganizationContext();

  const [isLoading, setIsLoading] = useState(false);

  let messageKey: string = 'step4';
  if (isSubscriptionPaymentRequested) {
    messageKey = 'paymentRequested';
  } else if (isSubscriptionRequestReady) {
    messageKey = 'paymentWillArrive';
  } else if (isSubscriptionApproved) {
    messageKey = 'subscriptionPaid';
  }

  const handleRequestPayment = async () => {
    if (!latestSubscriptionRequest || !isSubscriptionRequestPending || isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      await requestSubscriptionPayment(
        latestSubscriptionRequest.id
      );
      await mutateSubscriptionRequests();
      showToast(
        t('createOrganization.paymentRequestSuccess'),
        'success'
      );
    } catch {
      showToast(
        t('createOrganization.paymentRequestError'),
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showRequestButton =
    isSubscriptionRequestPending && !isSubscriptionPaymentRequested;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#BFFA00]">
          {t('createOrganization.stepLabel6')}
        </span>
      </div>
      <div className="py-8 sm:py-10 md:py-14 text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-[#2563eb]/20 flex items-center justify-center mx-auto">
          <span className="text-2xl text-[#2563eb]">₽</span>
        </div>
        <p className="text-[#a3a3a3] text-sm sm:text-base max-w-sm mx-auto">
          {t(`createOrganization.${messageKey}`)}
        </p>
        {showRequestButton && (
          <div className="flex justify-center">
            <Button
              type="basic"
              title={t('createOrganization.paymentRequestButton')}
              classname="w-[220px] !rounded-xl !py-3 font-semibold"
              isLoading={isLoading}
              disabled={!latestSubscriptionRequest}
              handleClick={handleRequestPayment}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;

