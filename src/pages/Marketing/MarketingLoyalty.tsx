import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '@ui/Notification.tsx';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  LoyaltyProgramStatus,
  getLoyaltyPrograms,
} from '@/services/api/marketing';
import { Button, Input, Table } from 'antd';
import { CopyOutlined, PlusOutlined, TableOutlined } from '@ant-design/icons';
import { getDateRender, getStatusTagRender } from '@/utils/tableUnits';
import { LoyaltyProgramsResponse } from '@/services/api/marketing';
import { ColumnsType } from 'antd/es/table';
import { useUser } from '@/hooks/useUserStore';
import { usePermissions } from '@/hooks/useAuthStore';
import ParticipantRequestModal from './ParticipantRequestModal';
import { debounce } from 'lodash';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import LoyaltyCard from './LoyaltyCard';
import FilterLoyalty from './FilterLoyalty';

const MarketingLoyalty: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const navigate = useNavigate();
  const name = searchParams.get('name') || undefined;
  const [searchValue, setSearchValue] = useState(name || '');
  const [view, setView] = useState<'table' | 'cards'>('table');

  const user = useUser();
  const permissions = usePermissions();

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateSearchParams(searchParams, setSearchParams, {
        name: value || undefined,
        page: '1',
      });
    }, 500),
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    setSearchValue(name || '');
  }, [name]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const hasPermission = user?.organizationId
    ? permissions.some(
        permission =>
          (permission.action === 'create' ||
            permission.action === 'manage' ||
            permission.action === 'read') &&
          permission.subject === 'Pos' &&
          Array.isArray(permission.conditions?.organizationId?.in) &&
          permission.conditions.organizationId.in.includes(user.organizationId!)
      )
    : false;

  const { data: loyaltyProgramsData, isLoading: loyaltyProgramsLoading } =
    useSWR<LoyaltyProgramsResponse[]>(
      'get-loyalty-programs',
      () => getLoyaltyPrograms(user.organizationId),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true,
      }
    );
  const loyaltyPrograms =
    loyaltyProgramsData?.map(item => ({
      ...item.props,
      status: t(`tables.${item.props.status}`) as LoyaltyProgramStatus,
    })) || [];

  const statusRender = getStatusTagRender(t);
  const dateRender = getDateRender();

  const columnsLoyaltyPrograms: ColumnsType<LoyaltyProgramsResponse['props']> =
    [
      {
        title: t('loyaltyProgramsTable.programName'),
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record) => {
          return (
            <>
              <Link
                to={{
                  pathname: `/marketing/loyalty/program/${record.id}`,
                  search: `?loyaltyProgramId=${record.id}&step=1&mode=edit`,
                }}
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                {text}
              </Link>
            </>
          );
        },
      },
      {
        title: t('loyaltyProgramsTable.status'),
        dataIndex: 'status',
        key: 'status',
        render: statusRender,
      },
      {
        title: t('loyaltyProgramsTable.launchDate'),
        dataIndex: 'startDate',
        key: 'startDate',
        render: dateRender,
      },
      {
        title: t('loyaltyProgramsTable.participationStatus'),
        dataIndex: 'type',
        key: 'type',
        render: (_, record) => (
          <span>
            {record.ownerOrganizationId === user.organizationId ? (
              <>{t('loyaltyProgramsTable.owner')}</>
            ) : (
              <>{t('loyaltyProgramsTable.participant')}</>
            )}
          </span>
        ),
      },
      {
        title: t('marketing.ty'),
        dataIndex: 'isHub',
        key: 'isHub',
        render: (_, record) => (
          <span>
            {record.isHub ? (
              <>{t('marketing.hub')}</>
            ) : (
              <>{t('loyaltyProgramsTable.regularProgram')}</>
            )}
          </span>
        ),
      },
      {
        title: t('marketingLoyalty.numberOfBranches'),
        dataIndex: 'numberOfBranches',
        key: 'numberOfBranches',
        render: () => 10,
      },
      {
        title: t('marketingLoyalty.numberOfClients'),
        dataIndex: 'numberOfClients',
        key: 'numberOfClients',
        render: () => 10,
      },
    ];

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.loyalty')}
          </span>
        </div>
        {!loyaltyProgramsLoading && user && permissions && (
          <div className="flex items-center space-x-2">
            {hasPermission && (
              <Button
                icon={<PlusOutlined />}
                className="btn-outline-primary"
                onClick={() => {
                  navigate('/marketing/loyalty/program');
                }}
              >
                {t('routes.add')}
              </Button>
            )}
            <Button
              icon={<PlusOutlined />}
              className="btn-primary"
              onClick={() => setIsParticipantModalOpen(true)}
            >
              {t('loyaltyProgramsTable.join')}
            </Button>
          </div>
        )}
      </div>
      <div className="mt-2">
        {notificationVisible && (
          <Notification
            title={t('routes.loyalty')}
            message={t('marketing.promotion')}
            showBonus={true}
            onClose={() => setNotificationVisible(false)}
          />
        )}

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-4 mb-6 px-4 sm:px-6 md:px-8 lg:px-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <Input.Search
              placeholder={t('techTasks.searchPlaceholder')}
              value={searchValue}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              allowClear
              className="w-full sm:w-72 md:w-80"
              style={{ height: '32px' }}
            />
            <div className="flex items-center gap-2 sm:gap-3">
              <div style={{ height: '32px' }}>
                <FilterLoyalty display={['status', 'assigned']} />
              </div>
            </div>
            <Button
              icon={view === 'table' ? <TableOutlined /> : <CopyOutlined />}
              onClick={() => {
                if (view === 'table') setView('cards');
                else setView('table');
              }}
            >
              {view === 'table' ? t('equipment.table') : t('marketing.cards')}
            </Button>
          </div>
        </div>

        {view === 'table' && (
          <div className="mt-8">
            <Table
              rowKey={record => record.id.toString()}
              dataSource={loyaltyPrograms}
              columns={columnsLoyaltyPrograms}
              loading={loyaltyProgramsLoading}
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: t('table.noData') }}
            />
          </div>
        )}

        {view === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loyaltyPrograms.map((card, i) => (
              <LoyaltyCard
                key={i}
                title={card.name}
                date={card.startDate}
                description=""
                branches={0}
                status={card.status}
                clients={0}
              />
            ))}
          </div>
        )}
      </div>

      <ParticipantRequestModal
        open={isParticipantModalOpen}
        onClose={() => setIsParticipantModalOpen(false)}
      />
    </>
  );
};

export default MarketingLoyalty;
