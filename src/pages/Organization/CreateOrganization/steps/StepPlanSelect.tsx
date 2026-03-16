import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button/Button';
import { useCreateOrganizationContext } from '../context';
import {
  buildSearchParams,
  PLANS_CONFIG,
  CUSTOM_PLAN_MIN_POSES,
  CUSTOM_PLAN_MAX_POSES,
  CUSTOM_PLAN_MIN_USERS,
  CUSTOM_PLAN_MAX_USERS,
} from '../types';

const DEFAULT_CONNECTION_TYPE = 'DS_EQUIPMENT' as const;

const StepPlanSelect: React.FC = () => {
  const { t } = useTranslation();
  const {
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
    setSearchParams,
    pendingRequestId,
    isUpdatingPlan,
    isSubmittingSubscription,
    isSubscriptionRequestReady,
    updatePlanAction,
    createSubscriptionRequestAction,
    organizationId,
    showToast,
  } = useCreateOrganizationContext();

  const hasPendingRequest =
    pendingRequestId != null && updatePlanAction != null;
  const canSelectPlan = !isSubscriptionRequestReady;

  const handleConnect = async (plan: (typeof PLANS_CONFIG)[number]['id']) => {
    if (organizationId == null) return;
    setSelectedPlan(plan);
    setSearchParams(buildSearchParams(plan, addonMobile, addonCorporate));
    try {
      await createSubscriptionRequestAction({
        organizationId,
        selectedPlan: plan,
        addonMobile,
        addonCorporate,
        selectedConnectionType: DEFAULT_CONNECTION_TYPE,
        ...(plan === 'custom' && {
          customPoses,
          customUsers,
        }),
      });
    } catch {
      showToast(
        t('createOrganization.toast.errorSubscriptionRequest'),
        'error'
      );
    }
  };

  const handleUpdatePlan = async (plan: (typeof PLANS_CONFIG)[number]['id']) => {
    if (pendingRequestId == null) return;
    setSelectedPlan(plan);
    setSearchParams(buildSearchParams(plan, addonMobile, addonCorporate));
    try {
      await updatePlanAction({
        requestId: pendingRequestId,
        selectedPlan: plan,
        addonMobile,
        addonCorporate,
        ...(plan === 'custom' && {
          customPoses,
          customUsers,
        }),
      });
    } catch {
      showToast(t('createOrganization.toast.errorUpdatePlan'), 'error');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#BFFA00] mb-2">
          {t('createOrganization.stepLabel2')}
        </span>
        <h1 className="text-lg sm:text-xl font-bold text-white">
          {t('createOrganization.step0')}
        </h1>
      </div>
      {hasPendingRequest && (
        <div className="mb-4 rounded-xl bg-[#2563eb]/15 border border-[#2563eb]/40 px-4 py-3 text-[#93c5fd] text-xs sm:text-sm">
          {t('createOrganization.paymentRequestUnderReview')}
          <span className="block mt-1 text-[#93c5fd]/90 text-xs">
            {t('createOrganization.youCanUpdateRequest')}
          </span>
        </div>
      )}
      <div className="rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] p-3 sm:p-4 mb-6 flex flex-wrap gap-4 sm:gap-6 shadow-lg shadow-black/20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-[#737373] text-sm">?</span>
          <span className="text-white text-sm sm:text-base">
            {t('createOrganization.addonMobile')}{' '}
            <span className="text-[#737373] text-xs sm:text-sm">
              {t('createOrganization.addonMobilePrice')}
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              const next = !addonMobile;
              setAddonMobile(next);
              setSearchParams(
                buildSearchParams(selectedPlan ?? 'base', next, addonCorporate)
              );
            }}
            className={`w-11 h-6 rounded-full transition-all duration-200 relative ${addonMobile ? 'bg-[#BFFA00] shadow-[0_0_12px_rgba(191,250,0,0.4)' : 'bg-[#262626]'}`}
            aria-pressed={addonMobile}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${addonMobile ? 'left-6' : 'left-1'}`}
            />
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-[#737373] text-sm">?</span>
          <span className="text-white text-sm sm:text-base">
            {t('createOrganization.addonCorporate')}{' '}
            <span className="text-[#737373] text-xs sm:text-sm">
              {t('createOrganization.addonCorporatePrice')}
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              const next = !addonCorporate;
              setAddonCorporate(next);
              setSearchParams(
                buildSearchParams(selectedPlan ?? 'base', addonMobile, next)
              );
            }}
            className={`w-11 h-6 rounded-full transition-all duration-200 relative ${addonCorporate ? 'bg-[#BFFA00] shadow-[0_0_12px_rgba(191,250,0,0.4)' : 'bg-[#262626]'}`}
            aria-pressed={addonCorporate}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${addonCorporate ? 'left-6' : 'left-1'}`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {PLANS_CONFIG.map(plan => {
          const isSelected = selectedPlan === plan.id;
          const isBusiness = plan.id === 'business';
          return (
            <div
              key={plan.id}
              className={`rounded-2xl border-2 overflow-hidden flex flex-col transition-all duration-200 ${isSelected
                ? 'border-[#BFFA00] shadow-[0_0_28px_rgba(191,250,0,0.15)]'
                : 'border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#2563eb]/40'
                }`}
            >
              <div
                className={`${plan.headerBg} px-4 py-3 sm:px-5 sm:py-4 ${isBusiness ? 'text-black' : 'text-white'}`}
              >
                <div className="font-bold text-base sm:text-lg">
                  {t(`createOrganization.${plan.titleKey}`)}
                </div>
                <div
                  className={`text-sm mt-0.5 ${isBusiness ? 'text-black/80' : 'text-white/80'}`}
                >
                  {t(`createOrganization.${plan.descKey}`)}
                </div>
              </div>
              <div className="px-4 py-3 sm:px-5 sm:py-4 bg-[#141414] flex-1 flex flex-col">
                <div className="font-bold text-white text-base sm:text-lg mb-2 sm:mb-3">
                  {plan.priceValue ? (
                    <>
                      {plan.priceValue}{' '}
                      <span className="text-[#737373] font-normal text-sm">
                        {t('createOrganization.pricePerMonth')}
                      </span>
                    </>
                  ) : plan.priceKey === 'priceOnRequest' ? (
                    t('createOrganization.priceOnRequest')
                  ) : (
                    t('createOrganization.priceFree')
                  )}
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map(featureKey => (
                    <li
                      key={featureKey}
                      className="flex items-start gap-2 text-[#d4d4d4] text-sm"
                    >
                      <CheckOutlined
                        className="text-[#2563eb] shrink-0 mt-0.5"
                        style={{ fontSize: 14 }}
                      />
                      <span>{t(`createOrganization.${featureKey}`)}</span>
                    </li>
                  ))}
                </ul>
                {plan.allowsCustomCounts && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label
                        htmlFor={`custom-poses-${plan.id}`}
                        className="block text-[#a3a3a3] text-xs font-medium mb-1"
                      >
                        {t('createOrganization.customPlanPoses')}
                      </label>
                      <input
                        id={`custom-poses-${plan.id}`}
                        type="number"
                        min={CUSTOM_PLAN_MIN_POSES}
                        max={CUSTOM_PLAN_MAX_POSES}
                        value={customPoses}
                        onChange={e => {
                          const v = e.target.valueAsNumber;
                          if (e.target.value === '')
                            setCustomPoses(CUSTOM_PLAN_MIN_POSES);
                          else if (!Number.isNaN(v))
                            setCustomPoses(Math.min(CUSTOM_PLAN_MAX_POSES, Math.max(CUSTOM_PLAN_MIN_POSES, v)));
                        }}
                        className="w-full rounded-lg bg-[#0d0d0d] border border-[#262626] px-3 py-2 text-white text-sm focus:border-[#2563eb] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`custom-users-${plan.id}`}
                        className="block text-[#a3a3a3] text-xs font-medium mb-1"
                      >
                        {t('createOrganization.customPlanUsers')}
                      </label>
                      <input
                        id={`custom-users-${plan.id}`}
                        type="number"
                        min={CUSTOM_PLAN_MIN_USERS}
                        max={CUSTOM_PLAN_MAX_USERS}
                        value={customUsers}
                        onChange={e => {
                          const v = e.target.valueAsNumber;
                          if (e.target.value === '')
                            setCustomUsers(CUSTOM_PLAN_MIN_USERS);
                          else if (!Number.isNaN(v))
                            setCustomUsers(Math.min(CUSTOM_PLAN_MAX_USERS, Math.max(CUSTOM_PLAN_MIN_USERS, v)));
                        }}
                        className="w-full rounded-lg bg-[#0d0d0d] border border-[#262626] px-3 py-2 text-white text-sm focus:border-[#2563eb] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
                {canSelectPlan &&
                  (hasPendingRequest ? (
                    <Button
                      type="basic"
                      title={t('createOrganization.updatePlan')}
                      classname="w-full mt-4 !bg-[#2563eb] hover:!bg-[#1d4ed8] !rounded-xl !py-4 font-semibold"
                      isLoading={isUpdatingPlan}
                      handleClick={() => handleUpdatePlan(plan.id)}
                    />
                  ) : (
                    <Button
                      type="basic"
                      title={t('createOrganization.connect')}
                      classname="w-full mt-4 !bg-[#BFFA00] hover:!bg-[#a8e000] !text-black !rounded-xl !py-4 font-semibold"
                      isLoading={isSubmittingSubscription}
                      handleClick={() => handleConnect(plan.id)}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepPlanSelect;
