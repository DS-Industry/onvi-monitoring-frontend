import { useEffect, useState } from 'react';
import { Alert, Button, Input, Modal, Spin, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import SubscriptionPlaceholder from '@/components/subscription/SubscriptionPlaceholder';
import { useToast } from '@/components/context/useContext';
import useSubscriptionStore from '@/config/store/subscriptionSlice';
import {
  getOrganizationFinTablo,
  updateOrganizationFinTablo,
} from '@/services/api/finance/fintablo';
import { getFinTabloErrorMessage } from '@/services/api/finance/fintablo-errors';
import { canAccessTariff } from '@/subscription/tariffAccess';

const MANAGER_PAPER_TARIFF = {
  requiredTariffFeatures: ['ManagerPaper'],
};

type FinTabloOrgModalProps = {
  open: boolean;
  organizationId: number | null;
  onClose: () => void;
  onSaved: () => void;
};

const FinTabloOrgModal = ({
  open,
  organizationId,
  onClose,
  onSaved,
}: FinTabloOrgModalProps) => {
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

  const [objectsEnabled, setObjectsEnabled] = useState(false);
  const [token, setToken] = useState('');
  const [tokenConfigured, setTokenConfigured] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canFetch = open && organizationId != null && tariffAccess.allowed;

  const { data, isLoading, error, mutate } = useSWR(
    canFetch ? ['organization-fintablo', organizationId] : null,
    () => getOrganizationFinTablo(organizationId!),
    { shouldRetryOnError: false }
  );

  const { trigger: save, isMutating } = useSWRMutation(
    'update-organization-fintablo',
    async () => {
      if (organizationId == null) {
        throw new Error('organizationId is required');
      }
      return updateOrganizationFinTablo({
        organizationId,
        objectsEnabled,
        token,
      });
    }
  );

  useEffect(() => {
    if (!open) {
      setToken('');
      setFormError(null);
      setObjectsEnabled(false);
      setTokenConfigured(false);
      return;
    }
    if (data) {
      setObjectsEnabled(data.objectsEnabled);
      setTokenConfigured(data.tokenConfigured);
      setToken('');
      setFormError(null);
    }
  }, [open, data]);

  useEffect(() => {
    if (!error) {
      return;
    }
    setFormError(getFinTabloErrorMessage(error) ?? null);
  }, [error]);

  const handleSave = async () => {
    if (organizationId == null) {
      return;
    }

    const persist = async () => {
      setFormError(null);
      try {
        const result = await save();
        if (result) {
          setToken('');
          setTokenConfigured(result.tokenConfigured);
          setObjectsEnabled(result.objectsEnabled);
          await mutate(result, false);
          showToast(t('fintablo.saveSuccess'), 'success');
          onSaved();
          onClose();
        }
      } catch (caught) {
        setFormError(getFinTabloErrorMessage(caught) ?? null);
      }
    };

    if (data?.objectsEnabled && !objectsEnabled) {
      modal.confirm({
        title: t('fintablo.disableOrgConfirmTitle'),
        content: t('fintablo.disableOrgConfirm'),
        okText: t('fintablo.save'),
        cancelText: t('fintablo.cancel'),
        okType: 'danger',
        onOk: persist,
      });
      return;
    }

    await persist();
  };

  const tokenPlaceholder = tokenConfigured
    ? t('fintablo.tokenConfigured')
    : t('fintablo.tokenPlaceholder');

  return (
    <>
      {contextHolder}
      <Modal
        title={t('fintablo.title')}
        open={open}
        onCancel={onClose}
        destroyOnClose
        footer={
          tariffAccess.allowed
            ? [
                <Button key="cancel" onClick={onClose}>
                  {t('fintablo.cancel')}
                </Button>,
                <Button
                  key="save"
                  type="primary"
                  className="btn-primary"
                  loading={isMutating}
                  onClick={handleSave}
                >
                  {t('fintablo.save')}
                </Button>,
              ]
            : [
                <Button key="close" onClick={onClose}>
                  {t('fintablo.cancel')}
                </Button>,
              ]
        }
      >
        {tariffAccess.pending ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : !tariffAccess.allowed ? (
          <SubscriptionPlaceholder
            routeName="legalEntities"
            requirements={MANAGER_PAPER_TARIFF}
            reason={tariffAccess.reason}
          />
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {formError ? (
              <Alert type="error" showIcon message={formError} />
            ) : null}
            <label className="flex items-center justify-between gap-4">
              <span>{t('fintablo.objectsEnabled')}</span>
              <Switch
                checked={objectsEnabled}
                onChange={setObjectsEnabled}
                disabled={isMutating}
              />
            </label>
            <div className="flex flex-col gap-1">
              <label htmlFor="fintablo-org-token">{t('fintablo.token')}</label>
              <Input.Password
                id="fintablo-org-token"
                value={token}
                onChange={event => setToken(event.target.value)}
                placeholder={tokenPlaceholder}
                autoComplete="off"
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default FinTabloOrgModal;
