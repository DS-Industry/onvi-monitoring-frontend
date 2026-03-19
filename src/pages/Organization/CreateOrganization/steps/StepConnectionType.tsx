import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import { useCreateOrganizationContext } from '../context';

const StepConnectionType: React.FC = () => {
  const { t } = useTranslation();
  const {
    selectedConnectionType,
    setSelectedConnectionType,
    isSubscriptionRequestPending,
    isSubscriptionRequestReady,
    pendingRequestId,
    isUpdatingConnectionType,
    updateConnectionTypeAction,
    showToast,
  } = useCreateOrganizationContext();

  const isConnectionTypeLocked = isSubscriptionRequestReady;

  const handleUpdateConnectionType = async () => {
    if (pendingRequestId == null || selectedConnectionType == null) return;
    try {
      await updateConnectionTypeAction({
        requestId: pendingRequestId,
        selectedConnectionType,
      });
    } catch {
      showToast(
        t('createOrganization.toast.errorUpdateConnection'),
        'error'
      );
    }
  };

  const cardBase =
    'rounded-xl border-2 p-6 text-left transition-all duration-200 flex flex-col items-start';
  const cardSelected =
    'border-[#BFFA00] bg-[#BFFA00]/10 shadow-[0_0_24px_rgba(191,250,0,0.12)]';
  const cardDefault =
    'border-[#1a1a1a] bg-[#141414] hover:border-[#2563eb]/50 hover:bg-[#2563eb]/5';

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#BFFA00] mb-2">
          {t('createOrganization.stepLabel3')}
        </span>
        <h1 className="text-lg sm:text-xl font-bold text-white">
          {t('createOrganization.connectionTypeHeading')}
        </h1>
      </div>
      {isSubscriptionRequestPending && (
        <div className="mb-4 rounded-xl bg-[#2563eb]/15 border border-[#2563eb]/40 px-4 py-3 text-[#93c5fd] text-xs sm:text-sm">
          {t('createOrganization.paymentRequestUnderReview')}
          {pendingRequestId != null && (
            <span className="block mt-1 text-[#93c5fd]/90 text-xs">
              {t('createOrganization.youCanUpdateRequest')}
            </span>
          )}
        </div>
      )}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isConnectionTypeLocked ? 'pointer-events-none opacity-70' : ''}`}
      >
        <button
          type="button"
          disabled={isConnectionTypeLocked}
          onClick={() => setSelectedConnectionType('DS_EQUIPMENT')}
          className={`${cardBase} ${selectedConnectionType === 'DS_EQUIPMENT' ? cardSelected : cardDefault}`}
        >
          <span className="text-white font-semibold">
            {t('createOrganization.connectionTypeDsEquipment')}
          </span>
        </button>
        <button
          type="button"
          disabled={isConnectionTypeLocked}
          onClick={() => setSelectedConnectionType('COUPLING_MODULE')}
          className={`${cardBase} ${selectedConnectionType === 'COUPLING_MODULE' ? cardSelected : cardDefault}`}
        >
          <span className="text-white font-semibold">
            {t('createOrganization.connectionTypeCouplingModule')}
          </span>
        </button>
      </div>
      {isSubscriptionRequestPending && pendingRequestId != null && (
        <div className="mt-6">
          <Button
            type="basic"
            title={t('common.next')}
            classname="w-[200px] !bg-[#2563eb] hover:!bg-[#1d4ed8] !rounded-xl !py-4 font-semibold"
            disabled={!selectedConnectionType}
            isLoading={isUpdatingConnectionType}
            handleClick={handleUpdateConnectionType}
          />
        </div>
      )}
    </div>
  );
};

export default StepConnectionType;
