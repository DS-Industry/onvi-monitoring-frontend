import { Button, Table, Pagination, Input, Tag, Spin, Popconfirm } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppstoreOutlined,
  DeleteOutlined,
  LineChartOutlined,
  PlusOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import Notification from '@ui/Notification.tsx';
import { getStatusColor } from '@/utils/tableUnits';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import {
  getMarketingCampaign,
  MarketingCampaignResponse,
  deleteDraftMarketingCampaign,
} from '@/services/api/marketing';
import { useToast } from '@/components/context/useContext';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';
import { useUser } from '@/hooks/useUserStore';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MarketingCampaignStatus,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { debounce } from 'lodash';
import FilterCampaign from './FilterCampaign';
import CampaignCard from './CampaignCard';
import useAuthStore from '@/config/store/authSlice';
import { Can } from '@/permissions/Can';

type CampaignRow = MarketingCampaignResponse & { rawStatus?: string };

const tableCellStyle: React.CSSProperties = {
  padding: '21px 12px',
  lineHeight: '18px',
};

const tableHeaderCell = (): React.HTMLAttributes<HTMLElement> => ({
  className:
    'rounded-none border-x-2 border-x-background02 border-t-0 border-b border-borderFill bg-background03 text-sm font-semibold text-text01 align-middle before:hidden',
  style: { ...tableCellStyle, borderRadius: 0 },
});

const tableBodyCell = (isLastRow: boolean): React.HTMLAttributes<HTMLElement> => ({
  className: [
    'border-x-2 border-x-background02 bg-background02 text-sm align-middle',
    !isLastRow && 'border-b border-borderFill',
  ]
    .filter(Boolean)
    .join(' '),
  style: tableCellStyle,
});

const applyTableCells = (
  columns: ColumnsType<CampaignRow>,
  rowCount: number
): ColumnsType<CampaignRow> =>
  columns.map(column => ({
    ...column,
    onHeaderCell: tableHeaderCell,
    onCell: (_record, rowIndex) => tableBodyCell(rowIndex === rowCount - 1),
  }));

type ViewToggleProps = {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
};

const ViewToggle: React.FC<ViewToggleProps> = ({ active, label, onClick, children }) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={active}
    onClick={onClick}
    className={
      active
        ? 'flex h-8 w-8 items-center justify-center rounded-md border border-primary02 bg-primary02 text-base text-text04'
        : 'flex h-8 w-8 items-center justify-center rounded-md border border-borderFill bg-background02 text-base text-text02 hover:border-primary02 hover:text-primary02'
    }
  >
    {children}
  </button>
);

const MarketingCampaigns: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const name = searchParams.get('name') || undefined;
  const status =
    (searchParams.get('status') as MarketingCampaignStatus) || undefined;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const [searchValue, setSearchValue] = useState(name || '');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const userPermissions = useAuthStore(state => state.permissions);
  const navigate = useNavigate();
  const user = useUser();
  const { showToast } = useToast();

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const {
    data: promotionsData,
    isLoading,
    isValidating,
  } = useSWR(
    user.organizationId
      ? [
        'marketing-campaigns',
        user.organizationId,
        status,
        currentPage,
        pageSize,
        name,
      ]
      : null,
    () =>
      getMarketingCampaign({
        organizationId: user.organizationId!,
        status: status,
        page: currentPage,
        size: pageSize,
        search: name,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      shouldRetryOnError: false,
    }
  );

  const promotions: CampaignRow[] =
    promotionsData?.data?.map(item => ({
      ...item,
      status: t(`tables.${item.status}`),
      rawStatus: item.status,
    })) || [];

  const revalidateList = () =>
    mutate([
      'marketing-campaigns',
      user.organizationId,
      status,
      currentPage,
      pageSize,
      name,
    ]);

  const handleDeleteDraftCampaign = useCallback(async (id: number) => {
    try {
      const res = await deleteDraftMarketingCampaign(id);
      revalidateList();
      showToast(res?.message ?? t('success.recordDeleted') ?? 'Draft campaign deleted successfully', 'success');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ??
        t('errors.deleteFailed') ??
        'Failed to delete draft campaign';
      showToast(errorMessage, 'error');
    }
  }, [revalidateList, showToast, t]);

  const formatDateTime = (value?: string) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—';

  const columns: ColumnsType<CampaignRow> = useMemo(() => {
    const rowCount = promotions.length;

    return applyTableCells([
      {
        title: t('marketingCampaigns.tableName'),
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <Can requiredPermissions={[{ action: 'update', subject: 'LTYProgram' }]} userPermissions={userPermissions}>
            {allowed => allowed ? (
              <Link
                to={{
                  pathname: '/marketing/campaign/create',
                  search: `?marketingCampaignId=${record.id}&mode=edit`,
                }}
                className="text-primary02 hover:text-primary02_Hover"
              >
                {text}
              </Link>
            ) : (
              <span className="text-text01">{text}</span>
            )}
          </Can>
        ),
      },
      {
        title: t('marketing.loyaltyProgram'),
        dataIndex: 'ltyProgramName',
        key: 'ltyProgramName',
        render: (text: string) => <span>{text || '—'}</span>,
      },
      {
        title: t('constants.status'),
        dataIndex: 'status',
        key: 'status',
        render: (_, record) => (
          <Tag bordered color={getStatusColor(t, record.status)} className="m-0 px-2 text-sm leading-[18px]">
            {record.status}
          </Tag>
        ),
      },
      {
        title: t('marketing.launchDate'),
        dataIndex: 'launchDate',
        key: 'launchDate',
        render: (text: string) => <span>{formatDateTime(text)}</span>,
      },
      {
        title: t('shift.endDate'),
        dataIndex: 'endDate',
        key: 'endDate',
        render: (text: string) => <span>{formatDateTime(text)}</span>,
      },
      {
        title: t('roles.rol'),
        key: 'role',
        render: () => <span>{t('loyaltyProgramsTable.owner')}</span>,
      },
      {
        title: t('constants.actions'),
        key: 'actions',
        width: 140,
        render: (_: unknown, record) => {
          const canDelete = record.campaignUsage === 0;

          return (
            <Can requiredPermissions={[{ action: 'update', subject: 'LTYProgram' }]} userPermissions={userPermissions}>
              {allowed => allowed ? (
                <div className="flex flex-col items-start gap-0">
                  {canDelete ? (
                    <Popconfirm
                      title={t('techTasks.confirmDelete')}
                      onConfirm={() => handleDeleteDraftCampaign(record.id)}
                      okText={t('common.delete')}
                      okType="danger"
                      cancelText={t('common.cancel')}
                    >
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        className="h-auto p-0"
                      >
                        {t('common.delete')}
                      </Button>
                    </Popconfirm>
                  ) : (
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      className="h-auto p-0"
                      disabled
                    >
                      {t('common.delete')}
                    </Button>
                  )}
                  {/* Заглушка: статистика кампании пока не реализована */}
                  <Button
                    type="link"
                    size="small"
                    icon={<LineChartOutlined />}
                    className="h-auto p-0 text-primary02"
                  >
                    {t('dashboard.indicators')}
                  </Button>
                </div>
              ) : null}
            </Can>
          );
        },
      },
    ], rowCount);
  }, [promotions.length, t, userPermissions, handleDeleteDraftCampaign]);

  return (
    <div>
      <div className="mb-5 ml-12 flex items-start justify-between md:ml-0">
        <span className="text-xl font-normal text-text01 sm:text-3xl">
          {t('routes.marketingCompanies')}
        </span>
      </div>

      <div className="mt-2">
        {notificationVisible && (
          <Notification
            title={t('routes.share')}
            message={t('marketing.promotion')}
            showBonus={true}
            onClose={() => setNotificationVisible(false)}
          />
        )}
      </div>

      <div className="mb-[26px] mt-[22px] flex flex-wrap items-center">
        <Input
          placeholder={t('marketingCampaigns.searchPlaceholder')}
          prefix={<SearchOutlined className="text-base03" />}
          value={searchValue}
          onChange={handleSearchChange}
          allowClear
          className="h-9 w-[296px] max-w-full rounded-md border-borderFill"
        />

        <FilterCampaign
          display={['status']}
          triggerClassName="ml-[23px] h-9 rounded-md border-borderFill px-3 text-sm shadow-none"
        />

        <div className="ml-[23px] flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-text02">{t('marketingCampaigns.view')}</span>
          <ViewToggle
            active={view === 'table'}
            label={t('equipment.table')}
            onClick={() => setView('table')}
          >
            <UnorderedListOutlined />
          </ViewToggle>
          <ViewToggle
            active={view === 'cards'}
            label={t('marketing.cards')}
            onClick={() => setView('cards')}
          >
            <AppstoreOutlined />
          </ViewToggle>
        </div>

        <div className="ml-auto">
          <Can requiredPermissions={[{ action: 'update', subject: 'LTYProgram' }]} userPermissions={userPermissions}>
            {allowed => allowed && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="h-9 rounded-md px-4 text-sm shadow-none"
                onClick={() => navigate('/marketing/campaign/create')}
              >
                {t('routes.create')}
              </Button>
            )}
          </Can>
        </div>
      </div>

      {view === 'table' && (
        <div className="mt-2">
          {isLoading || isValidating ? (
            <div className="flex h-[600px] w-full items-center justify-center">
              <Spin />
            </div>
          ) : (
            <div className="overflow-hidden border-b border-borderFill">
            <Table
              rowKey="id"
              className="rounded-none"
              dataSource={promotions}
              columns={columns}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: promotionsData?.total || 0,
                pageSizeOptions: ALL_PAGE_SIZES,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}–${range[1]} / ${total}`,
                onChange: (page, size) =>
                  updateSearchParams(searchParams, setSearchParams, {
                    page: String(page),
                    size: String(size),
                  }),
              }}
              scroll={{ x: 'max-content' }}
              loading={isLoading || isValidating}
              locale={{ emptyText: t('table.noData') }}
            />
            </div>
          )}
        </div>
      )}

      {view === 'cards' && (
        <div>
          {isLoading || isValidating ? (
            <div className="flex h-[600px] w-full items-center justify-center">
              <Spin />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {promotions.map(card => (
                <CampaignCard
                  key={card.id}
                  campaign={card}
                  loading={isLoading || isValidating}
                  onClick={() => navigate(`/marketing/campaign/${card.id}`)}
                />
              ))}
            </div>
          )}
          <div className="mt-4">
            <Pagination
              current={currentPage}
              total={promotionsData?.total || 0}
              pageSize={pageSize}
              pageSizeOptions={ALL_PAGE_SIZES}
              showTotal={(total, range) => `${range[0]}–${range[1]} / ${total}`}
              onChange={(page, size) => {
                updateSearchParams(searchParams, setSearchParams, {
                  page: String(page),
                  size: String(size),
                });
              }}
              showSizeChanger={true}
              align="end"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingCampaigns;
