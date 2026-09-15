import { useEffect, useState } from 'react';
import { Alert, Input, Modal, Spin, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import SubscriptionPlaceholder from '@/components/subscription/SubscriptionPlaceholder';
import { useToast } from '@/components/context/useContext';
import useSubscriptionStore from '@/config/store/subscriptionSlice';
import {
  getPosFinTabloList,
  patchPosFinTablo,
} from '@/services/api/finance/fintablo';
import { getFinTabloErrorMessage } from '@/services/api/finance/fintablo-errors';
import { canAccessTariff } from '@/subscription/tariffAccess';

const MANAGER_PAPER_TARIFF = {
  requiredTariffFeatures: ['ManagerPaper'],
};

type FinTabloTabProps = {
  organizationId: number;
  posId: number;
};

const FinTabloTab = ({ organizationId, posId }: FinTabloTabProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [modal, contextHolder] = Modal.useModal();
  const activeSubscription = useSubscriptionStore(
    state => state.activeSubscription
  );
  const subscriptionStatus = useSubscriptionStore(state => state.status);
  const tariffAccess = canAccessTariff(
    activeSubscription,
    subscriptionStatus,
    MANAGER_PAPER_TARIFF
  );

  const [moneybagName, setMoneybagName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const canFetch = tariffAccess.allowed;

  const { data, isLoading, mutate } = useSWR(
    canFetch ? ['pos-fintablo-list', organizationId] : null,
    () => getPosFinTabloList(organizationId),
    { shouldRetryOnError: false }
  );

  const posState = data?.find(item => item.posId === posId);
  const enabled = posState?.enabled === true;

  useEffect(() => {
    if (!posState) {
      setMoneybagName('');
      return;
    }
    setMoneybagName(posState.moneybagName ?? '');
  }, [posState]);

  const { trigger: patch, isMutating } = useSWRMutation(
    ['patch-pos-fintablo', posId],
    async (_key, { arg }: { arg: { enabled: boolean; moneybagName: string } }) =>
      patchPosFinTablo(posId, {
        enabled: arg.enabled,
        moneybagName: arg.moneybagName,
      })
  );

  const applyEnabled = async (nextEnabled: boolean) => {
    setFormError(null);
    try {
      const result = await patch({
        enabled: nextEnabled,
        moneybagName,
      });
      await mutate(
        current =>
          (current ?? []).map(item =>
            item.posId === result.posId ? result : item
          ),
        false
      );
      showToast(t('fintablo.saveSuccess'), 'success');
    } catch (caught) {
      setFormError(getFinTabloErrorMessage(caught) ?? null);
    }
  };

  const handleToggle = (checked: boolean) => {
    if (!checked && enabled) {
      modal.confirm({
        title: t('fintablo.disablePosConfirmTitle'),
        content: t('fintablo.disablePosConfirm'),
        okText: t('fintablo.save'),
        cancelText: t('fintablo.cancel'),
        okType: 'danger',
        onOk: () => applyEnabled(false),
      });
      return;
    }
    void applyEnabled(checked);
  };

  if (tariffAccess.pending) {
    return (
      <div className="flex justify-center py-8">
        <Spin />
      </div>
    );
  }

  if (!tariffAccess.allowed) {
    return (
      <SubscriptionPlaceholder
        routeName="objectManagement"
        requirements={MANAGER_PAPER_TARIFF}
        reason={tariffAccess.reason}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spin />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="flex flex-col gap-4 max-w-xl px-1">
        {formError ? <Alert type="error" showIcon message={formError} /> : null}
        <label className="flex items-center justify-between gap-4">
          <span>{t('fintablo.posEnabled')}</span>
          <Switch
            checked={enabled}
            onChange={handleToggle}
            disabled={isMutating || !posState}
          />
        </label>
        <div className="flex flex-col gap-1">
          <label htmlFor="fintablo-moneybag-name">
            {t('fintablo.moneybagName')}
          </label>
          <Input
            id="fintablo-moneybag-name"
            value={moneybagName}
            onChange={event => setMoneybagName(event.target.value)}
            placeholder={t('fintablo.moneybagNamePlaceholder')}
            disabled={enabled}
            readOnly={enabled}
          />
        </div>
      </div>
    </>
  );
};

export default FinTabloTab;
