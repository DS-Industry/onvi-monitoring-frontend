import { Button, Table, Pagination, Input, Tag, Spin, Popconfirm, Space } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyOutlined, PlusOutlined, TableOutlined, StopOutlined, DeleteOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Notification from '@ui/Notification.tsx';
import { getStatusColor } from '@/utils/tableUnits';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import {
  getMarketingCampaign,
  MarketingCampaignResponse,
  cancelMarketingCampaign,
  deleteDraftMarketingCampaign,
  pauseMarketingCampaign,
  reactivateMarketingCampaign,
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

  const handleSearch = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

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

  const promotions =
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

  const handleCancelCampaign = async (id: number) => {
    try {
      const res = await cancelMarketingCampaign(id);
      revalidateList();
      showToast(res?.message ?? t('marketing.campaignCancelled') ?? 'Marketing campaign cancelled successfully', 'success');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ??
        t('errors.deleteFailed') ??
        'Failed to cancel marketing campaign';
      showToast(errorMessage, 'error');
    }
  };

  const handleDeleteDraftCampaign = async (id: number) => {
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
  };

  const handlePauseCampaign = async (id: number) => {
    try {
      const res = await pauseMarketingCampaign(id);
      revalidateList();
      showToast(res?.message ?? t('marketing.campaignPaused') ?? 'Marketing campaign paused successfully', 'success');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ??
        t('errors.deleteFailed') ??
        'Failed to pause marketing campaign';
      showToast(errorMessage, 'error');
    }
  };

  const handleReactivateCampaign = async (id: number) => {
    try {
      const res = await reactivateMarketingCampaign(id);
      revalidateList();
      showToast(res?.message ?? t('marketing.campaignReactivated') ?? 'Marketing campaign reactivated successfully', 'success');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ??
        t('errors.deleteFailed') ??
        'Failed to reactivate marketing campaign';
      showToast(errorMessage, 'error');
    }
  };

  const columns: ColumnsType<MarketingCampaignResponse> = [
    {
      title: t('marketing.campaignName'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        return (
          <Link
            to={{
              pathname: '/marketing/campaign/create',
              search: `?marketingCampaignId=${record.id}&mode=edit`,
            }}
            className="text-primary02 hover:text-primary02_Hover font-semibold"
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: t('constants.status'),
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        return (
          <Tag color={getStatusColor(t, record.status)}>{record.status}</Tag>
        );
      },
    },
    {
      title: t('marketing.campaignType'),
      dataIndex: 'executionType',
      key: 'executionType',
      render: (text: string) => <span>{text ? t(`tables.${text}`) : '—'}</span>,
    },
    {
      title: t('marketing.launchDate'),
      dataIndex: 'launchDate',
      key: 'launchDate',
      render: (text: string) => (
        <span>{dayjs(text).format('YYYY-MM-DD hh:mm') || '—'}</span>
      ),
    },
    {
      title: t('shift.endDate'),
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text: string) => (
        <span>{dayjs(text).format('YYYY-MM-DD hh:mm') || '—'}</span>
      ),
    },
    {
      title: t('marketingLoyalty.numberOfBranches'),
      dataIndex: 'posCount',
      key: 'posCount',
    },
    {
      title: t('constants.actions'),
      key: 'actions',
      width: 220,
      render: (_: unknown, record: MarketingCampaignResponse & { rawStatus?: string }) => {
        const isActive = record.rawStatus === 'ACTIVE';
        const isPaused = record.rawStatus === 'PAUSED';
        const canDelete = record.campaignUsage === 0;

        if (isActive) {
          return (
            <Space wrap>
              <Popconfirm
                title={t('marketing.confirmPauseCampaign')}
                onConfirm={() => handlePauseCampaign(record.id)}
                okText={t('marketing.pauseCampaign')}
                okType="default"
                cancelText={t('common.cancel')}
              >
                <Button type="link" icon={<PauseCircleOutlined />} size="small">
                  {t('marketing.pauseCampaign')}
                </Button>
              </Popconfirm>
              <Popconfirm
                title={t('marketing.confirmCancelCampaign')}
                onConfirm={() => handleCancelCampaign(record.id)}
                okText={t('marketing.cancelCampaign')}
                okType="danger"
                cancelText={t('common.cancel')}
              >
                <Button type="link" danger icon={<StopOutlined />} size="small">
                  {t('marketing.cancelCampaign')}
                </Button>
              </Popconfirm>
            </Space>
          );
        }

        if (isPaused) {
          return (
            <Space>
              <Popconfirm
                title={t('marketing.confirmReactivateCampaign')}
                onConfirm={() => handleReactivateCampaign(record.id)}
                okText={t('marketing.reactivateCampaign')}
                okType="default"
                cancelText={t('common.cancel')}
              >
                <Button type="link" icon={<PlayCircleOutlined />} size="small">
                  {t('marketing.reactivateCampaign')}
                </Button>
              </Popconfirm>
            </Space>
          );
        }

        if (canDelete) {
          return (
            <Space>
              <Popconfirm
                title={t('techTasks.confirmDelete')}
                onConfirm={() => handleDeleteDraftCampaign(record.id)}
                okText={t('common.delete')}
                okType="danger"
                cancelText={t('common.cancel')}
              >
                <Button type="link" danger icon={<DeleteOutlined />} size="small">
                  {t('common.delete')}
                </Button>
              </Popconfirm>
            </Space>
          );
        }

        return null;
      },
    },
  ];

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.marketingCompanies')}
          </span>
        </div>
        <Button
          icon={<PlusOutlined />}
          className="btn-primary"
          onClick={() => navigate('/marketing/campaign/create')}
        >
          <div className="hidden sm:flex">{t('routes.newPromotion')}</div>
        </Button>
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

      <div className="mt-6 mb-4 flex flex-col sm:flex-row gap-4">
        <Input.Search
          placeholder={t('analysis.search')}
          value={searchValue}
          onChange={handleSearchChange}
          onSearch={handleSearch}
          allowClear
          className="w-full sm:w-72 md:w-80"
          style={{ height: '32px' }}
        />
        <div className="flex items-center gap-2 sm:gap-3">
          <div style={{ height: '32px' }}>
            <FilterCampaign display={['status']} />
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

      {view === 'table' && (
        <div className="mt-6">
          {isLoading || isValidating ? (
            <div className="h-[600px] w-full flex justify-center items-center">
              <Spin />
            </div>
          ) : (
            <Table
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
              bordered={false}
              scroll={{ x: 'max-content' }}
              loading={isLoading || isValidating}
              locale={{ emptyText: t('table.noData') }}
            />
          )}
        </div>
      )}

      {view === 'cards' && (
        <div>
          {isLoading || isValidating ? (
            <div className="h-[600px] w-full flex justify-center items-center">
              <Spin />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
              {promotions.map((card, i) => (
                <CampaignCard
                  key={i}
                  campaign={card}
                  loading={isLoading || isValidating}
                  onClick={() => {
                    navigate(
                      `/marketing/campaign/create/${card.id}?marketingCampaignId=${card.id}&step=1&mode=edit`
                    );
                  }}
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
