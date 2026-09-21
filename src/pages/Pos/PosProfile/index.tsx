import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import BasicInformation from './BasicInformation';
import ShiftCost from './ShiftCost';
import FinTabloTab from './FinTabloTab';
import GenericTabs from '@/components/ui/Tabs/GenericTab';
import useSWR from 'swr';
import { getPosById } from '@/services/api/pos';
import { getOrganizationFinTablo, shouldShowFinTabloPosTab } from '@/services/api/finance/fintablo';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import useSubscriptionStore from '@/config/store/subscriptionSlice';
import { canAccessTariff } from '@/subscription/tariffAccess';

const PosProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const userPermissions = usePermissions();
  const activeSubscription = useSubscriptionStore(
    state => state.activeSubscription
  );
  const subscriptionStatus = useSubscriptionStore(state => state.status);

  const tabFromUrl = searchParams.get('tab') || 'basic';
  const posId = Number(searchParams.get('posId')) || undefined;

  const canUpdateOrganization = hasPermission(
    [{ action: 'update', subject: 'Organization' }],
    userPermissions
  );
  const canUpdateManagerPaper = hasPermission(
    [{ action: 'update', subject: 'ManagerPaper' }],
    userPermissions
  );
  const hasManagerPaperTariff = canAccessTariff(
    activeSubscription,
    subscriptionStatus,
    { requiredTariffFeatures: ['ManagerPaper'] }
  ).allowed;

  const { data: posData } = useSWR(
    posId ? [`get-pos-by-id`, posId] : null,
    () => getPosById(posId!),
    { shouldRetryOnError: false }
  );

  const organizationId = posData?.props.organizationId;

  const { data: orgFinTablo, error: orgFinTabloError } = useSWR(
    canUpdateOrganization && hasManagerPaperTariff && organizationId
      ? ['organization-fintablo', organizationId]
      : null,
    () => getOrganizationFinTablo(organizationId!),
    { shouldRetryOnError: false }
  );

  const orgStatusPending = Boolean(
    canUpdateOrganization &&
      hasManagerPaperTariff &&
      organizationId &&
      !orgFinTablo &&
      !orgFinTabloError
  );

  const showFinTabloTab = shouldShowFinTabloPosTab({
    canUpdateOrganization,
    canUpdateManagerPaper,
    hasManagerPaperTariff,
    objectsEnabled: orgFinTabloError ? false : orgFinTablo?.objectsEnabled,
    orgStatusPending,
  });

  const handleTabChange = (key: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      tab: key,
    });
  };

  useEffect(() => {
    if (orgStatusPending) {
      return;
    }
    if (tabFromUrl === 'fintablo' && !showFinTabloTab) {
      updateSearchParams(searchParams, setSearchParams, {
        tab: 'basic',
      });
    }
  }, [
    tabFromUrl,
    showFinTabloTab,
    orgStatusPending,
    searchParams,
    setSearchParams,
  ]);

  const tabItems = [
    {
      key: 'basic',
      label: t('pos.basicInformation'),
      content: <BasicInformation />,
    },
    {
      key: 'shift',
      label: t('pos.shiftCost'),
      content: <ShiftCost />,
    },
    ...(showFinTabloTab && organizationId && posId
      ? [
          {
            key: 'fintablo',
            label: t('fintablo.tab'),
            content: (
              <FinTabloTab organizationId={organizationId} posId={posId} />
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
        onClick={() => {
          navigate('/administration/objectManagement');
        }}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.viewBranch')}
          </span>
        </div>
      </div>
      <div className="max-w-5xl bg-white">
        <div className="py-5">
          <GenericTabs
            tabs={tabItems}
            activeKey={tabFromUrl}
            onChange={handleTabChange}
            tabBarGutter={24}
            tabBarStyle={{ marginBottom: 24 }}
            type="line"
          />
        </div>
      </div>
    </div>
  );
};

export default PosProfile;
