import { Button, Table, Pagination, Input } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyOutlined, PlusOutlined, TableOutlined } from '@ant-design/icons';
import Notification from '@ui/Notification.tsx';
import { getStatusTagRender } from '@/utils/tableUnits';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  getMarketingCampaign,
  MarketingCampaignResponse,
} from '@/services/api/marketing';
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

  const tagRender = getStatusTagRender(t);
  const navigate = useNavigate();
  const user = useUser();

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

  const { data: promotionsData, isLoading } = useSWR(
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
      revalidsearchateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      shouldRetryOnError: false,
    }
  );

  const promotions =
    promotionsData?.data?.map(item => ({
      ...item,
      status: t(`tables.${item.status}`),
    })) || [];

  const columns: ColumnsType<MarketingCampaignResponse> = [
    {
      title: t('marketing.campaignName'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        return (
          <Link
            to={{
              pathname: '/marketing/campaigns/new/marketing/campaign',
              search: `?marketingCampaignId=${record.id}`,
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
      render: tagRender,
    },
    {
      title: t('marketing.campaignType'),
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <span>{t(`tables.${text}`) || '—'}</span>,
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
    }
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
          onClick={() =>
            navigate('/marketing/campaigns/new/marketing/campaign')
          }
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
          <Table
            dataSource={promotions}
            columns={columns}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: promotionsData?.total || 0,
              pageSizeOptions: ALL_PAGE_SIZES,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}–${range[1]} / ${total}`,
              onChange: (page, size) =>
                updateSearchParams(searchParams, setSearchParams, {
                  page: String(page),
                  size: String(size),
                }),
            }}
            bordered={false}
            scroll={{ x: 'max-content' }}
            loading={isLoading}
            locale={{ emptyText: t('table.noData') }}
          />
        </div>
      )}

      {view === 'cards' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {promotions.map((card, i) => (
                <CampaignCard
                  key={i}
                  title={card.name}
                  startDate={card.launchDate}
                  endDate={card.endDate}
                  description={card.description || ''}
                  branches={card.posCount}
                  status={card.status as MarketingCampaignStatus}
                  type={t(`marketing.${card.type}`)}
                  loading={isLoading}
                />
              ))}
          </div>
          <div className="mt-4">
            <Pagination
              current={currentPage}
              total={0}
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
