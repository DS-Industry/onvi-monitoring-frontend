import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import { useCreateOrganizationContext } from '../context';
import { requestSubscriptionPayment } from '@/services/api/subscription';
import {
  CUSTOM_POS_UNIT_PRICE,
  CUSTOM_USER_UNIT_PRICE,
} from '../types';

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

  const planCode = latestSubscriptionRequest?.planCode;
  const onviFeature = latestSubscriptionRequest?.onviFeature === true;
  const corporateClientsFeature =
    latestSubscriptionRequest?.corporateClientsFeature === true;
  const posesCount = latestSubscriptionRequest?.posesCount ?? 0;
  const usersCount = latestSubscriptionRequest?.usersCount ?? 0;

  const basePlanAmount =
    planCode === 'SPACE'
      ? 3000
      : planCode === 'BUSINESS'
        ? 5000
        : planCode === 'CUSTOM'
          ? posesCount * CUSTOM_POS_UNIT_PRICE + usersCount * CUSTOM_USER_UNIT_PRICE
          : 0;
  const addonsAmount =
    (onviFeature ? 5000 : 0) + (corporateClientsFeature ? 10000 : 0);
  const totalAmount = basePlanAmount + addonsAmount;

  const formatRub = (value: number) =>
    `${value.toLocaleString('ru-RU')} \u20bd`;

  const getPlanTitle = () => {
    if (planCode === 'BASIC') return t('createOrganization.planBase');
    if (planCode === 'SPACE') return t('createOrganization.planSpace');
    if (planCode === 'BUSINESS') return t('createOrganization.planBusiness');
    if (planCode === 'CUSTOM') return t('createOrganization.planCustom');
    return '-';
  };

  const getConnectionTypeTitle = () => {
    const connectionType = latestSubscriptionRequest?.connectionType;
    if (connectionType === 'DS_EQUIPMENT') {
      return t('createOrganization.connectionTypeDsEquipment');
    }
    if (connectionType === 'COUPLING_MODULE') {
      return t('createOrganization.connectionTypeCouplingModule');
    }
    return '-';
  };

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
        {latestSubscriptionRequest && (
          <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-[#111827]/25 p-4 sm:p-5 text-left">
            <div className="text-white font-semibold mb-3">
              {t('subscriptions.request')}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-[#d4d4d4]">
                <span>{t('createOrganization.step0')}</span>
                <span className="text-white">{getPlanTitle()}</span>
              </div>
              <div className="flex items-center justify-between text-[#d4d4d4]">
                <span>{t('createOrganization.step2')}</span>
                <span className="text-white">{getConnectionTypeTitle()}</span>
              </div>
              {planCode === 'CUSTOM' && (
                <>
                  <div className="flex items-center justify-between text-[#d4d4d4]">
                    <span>{t('createOrganization.customPlanPoses')}</span>
                    <span className="text-white">{posesCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#d4d4d4]">
                    <span>{t('createOrganization.customPlanUsers')}</span>
                    <span className="text-white">{usersCount}</span>
                  </div>
                </>
              )}
              {onviFeature && (
                <div className="flex items-center justify-between text-[#d4d4d4]">
                  <span>
                    {t('createOrganization.addonMobile')}{' '}
                    {t('createOrganization.addonMobilePrice')}
                  </span>
                  <span className="text-white">{formatRub(5000)}</span>
                </div>
              )}
              {corporateClientsFeature && (
                <div className="flex items-center justify-between text-[#d4d4d4]">
                  <span>
                    {t('createOrganization.addonCorporate')}{' '}
                    {t('createOrganization.addonCorporatePrice')}
                  </span>
                  <span className="text-white">{formatRub(10000)}</span>
                </div>
              )}
              <div className="mt-3 border-t border-white/10 pt-3 flex items-center justify-between text-white">
                <span className="font-medium">
                  {t('table.columns.totalSum')}
                </span>
                <span className="text-base font-bold">
                  {formatRub(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}
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

