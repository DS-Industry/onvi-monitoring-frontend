import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import useSWR from 'swr';
import GenericTabs from '@/components/ui/Tabs/GenericTab';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { CarWashPosType, getPosById } from '@/services/api/pos';
import PeriodToggle from './components/PeriodToggle';
import CurrencyConverterBar from './components/CurrencyConverterBar';
import { useOverviewDateRange } from './hooks/useOverviewFilters';
import { useCurrencyConversion } from './hooks/useCurrencyConversion';
import { OverviewCurrencyProvider } from './hooks/OverviewCurrencyContext';
import OverviewTab from './tabs/OverviewTab';
import DepositsTab from './tabs/DepositsTab';
import LoyaltyTab from './tabs/LoyaltyTab';
import PlanFactTab from './tabs/PlanFactTab';
import ProgramsTab from './tabs/ProgramsTab';
import CleaningTab from './tabs/CleaningTab';

type StationTab =
  | 'overview'
  | 'deposits'
  | 'loyalty'
  | 'planFact'
  | 'programs'
  | 'cleaning'
  | 'idle';

const PosOverviewStation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { posId: posIdParam } = useParams<{ posId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dateStart, dateEnd } = useOverviewDateRange();
  const conversion = useCurrencyConversion();

  const posId = Number(posIdParam);
  const isValidPosId = Boolean(posIdParam) && !Number.isNaN(posId);
  const posName = searchParams.get('posName') || String(posIdParam ?? '');
  const activeTab = (searchParams.get('tab') as StationTab) || 'overview';

  const { data: posData } = useSWR(
    isValidPosId ? ['get-pos-by-id', posId] : null,
    () => getPosById(posId),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const isRobot = posData?.props.carWashPosType === CarWashPosType.Portal;

  useEffect(() => {
    if (!isRobot || activeTab !== 'cleaning') return;
    updateSearchParams(searchParams, setSearchParams, { tab: 'overview' });
  }, [isRobot, activeTab, searchParams, setSearchParams]);

  const backHref = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('tab');
    params.delete('posName');
    params.delete('depositsMode');
    params.delete('loyaltyMode');
    params.delete('depPage');
    params.delete('depSize');
    params.delete('progPage');
    params.delete('progSize');
    const qs = params.toString();
    return `/station/enrollments${qs ? `?${qs}` : ''}`;
  }, [searchParams]);

  if (!isValidPosId) {
    return (
      <div className="px-2 md:px-0">
        <Alert
          type="error"
          showIcon
          message={t('posOverview.invalidStation')}
          action={
            <Link to="/station/enrollments" className="text-primary02">
              {t('login.back')}
            </Link>
          }
        />
      </div>
    );
  }

  const handleTabChange = (key: string) => {
    updateSearchParams(searchParams, setSearchParams, { tab: key });
  };

  const showPeriodInHeader =
    activeTab === 'overview' ||
    activeTab === 'planFact' ||
    activeTab === 'programs' ||
    activeTab === 'cleaning' ||
    activeTab === 'idle';

  const tabs = [
    {
      key: 'overview',
      label: t('posOverview.tabs.overview'),
      content:
        activeTab === 'overview' ? (
          <OverviewTab posId={posId} dateStart={dateStart} dateEnd={dateEnd} />
        ) : null,
    },
    {
      key: 'deposits',
      label: t('posOverview.tabs.deposits'),
      content:
        activeTab === 'deposits' ? (
          <DepositsTab posId={posId} dateStart={dateStart} dateEnd={dateEnd} />
        ) : null,
    },
    {
      key: 'loyalty',
      label: t('posOverview.tabs.loyalty'),
      content:
        activeTab === 'loyalty' ? (
          <LoyaltyTab posId={posId} dateStart={dateStart} dateEnd={dateEnd} />
        ) : null,
    },
    {
      key: 'planFact',
      label: t('posOverview.tabs.planFact'),
      content:
        activeTab === 'planFact' ? (
          <PlanFactTab posId={posId} dateStart={dateStart} dateEnd={dateEnd} />
        ) : null,
    },
    {
      key: 'programs',
      label: t('posOverview.tabs.programs'),
      content:
        activeTab === 'programs' ? (
          posData == null ? null : (
            <ProgramsTab
              posId={posId}
              dateStart={dateStart}
              dateEnd={dateEnd}
              isRobot={isRobot}
            />
          )
        ) : null,
    },
    ...(!isRobot
      ? [
          {
            key: 'cleaning',
            label: t('posOverview.tabs.cleaning'),
            content:
              activeTab === 'cleaning' ? (
                <CleaningTab
                  posId={posId}
                  dateStart={dateStart}
                  dateEnd={dateEnd}
                />
              ) : null,
          },
        ]
      : []),
  ];

  return (
    <OverviewCurrencyProvider value={conversion}>
      <div className="px-2 md:px-0">
        <div
          className="mb-4 flex cursor-pointer items-center text-primary02 w-fit"
          onClick={() => navigate(backHref)}
        >
          <ArrowLeftOutlined />
          <span className="ms-2">{t('login.back')}</span>
        </div>

        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-3xl font-semibold text-text01 m-0">
            {t('posOverview.stationTitle', { name: posName })}
          </h1>
          {showPeriodInHeader ? <PeriodToggle /> : null}
        </div>

        <div className="mb-5">
          <CurrencyConverterBar conversion={conversion} />
        </div>

        <GenericTabs
          tabs={tabs}
          activeKey={activeTab}
          onChange={handleTabChange}
          size="middle"
          tabBarGutter={24}
          tabBarStyle={{ marginBottom: 24 }}
        />
      </div>
    </OverviewCurrencyProvider>
  );
};

export default PosOverviewStation;
