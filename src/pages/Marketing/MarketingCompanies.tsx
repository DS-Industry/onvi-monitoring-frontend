import { Button, Table, Input, Select } from 'antd';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Notification from '@ui/Notification.tsx';
import { getStatusTagRender } from '@/utils/tableUnits';
import { Link, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import {
  getMarketingCampaign,
  MarketingCampaignResponse,
  MarketingCampaignsFilterDto,
} from '@/services/api/marketing';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';
import { useUser } from '@/hooks/useUserStore';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MarketingCampaignStatus } from '@/utils/constants';

const MarketingCompanies: React.FC = () => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [filters, setFilters] = useState<MarketingCampaignsFilterDto>({
    page: DEFAULT_PAGE,
    size: DEFAULT_PAGE_SIZE,
    organizationId: 0,
  });
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<(MarketingCampaignStatus & "ALL") | undefined>(undefined);
  
  const tagRender = getStatusTagRender(t);
  const navigate = useNavigate();
  const user = useUser();

  const currentFilters = useMemo(() => {
    const filtersObj: MarketingCampaignsFilterDto = {
      ...filters,
      organizationId: user.organizationId || 0,
    };
    
    if (searchValue) {
      filtersObj.search = searchValue;
    }
    
    if (statusFilter) {
      filtersObj.status = statusFilter === "ALL" ? undefined : statusFilter;
    }
    
    return filtersObj;
  }, [filters, user.organizationId, searchValue, statusFilter]);

  const { data: promotionsData, isLoading } = useSWR(
    user.organizationId ? ['marketing-campaigns', currentFilters] : null,
    () => getMarketingCampaign(currentFilters),
    {
      revalidsearchateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      shouldRetryOnError: false
    }
  );

  const promotions =
    promotionsData?.data?.map(item => ({
      ...item,
      status: t(`tables.${item.status}`),
    })) || [];

  const handlePageChange = (page: number, pageSize?: number) => {
    setFilters(prev => ({
      ...prev,
      page,
      size: pageSize || prev.size,
    }));
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status: (MarketingCampaignStatus & "ALL") | undefined) => {
    setStatusFilter(status);
    setFilters(prev => ({ ...prev, page: 1 }));
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
              pathname: '/marketing/companies/new/marketing/campaign',
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
        <span>{dayjs(text).format('DD.MM.YYYY') || '—'}</span>
      ),
    },
  ];

  const statusOptions = [
    { value: "ALL", label: t('constants.all') },
    { value: MarketingCampaignStatus.DRAFT, label: t(`tables.${MarketingCampaignStatus.DRAFT}`) },
    { value: MarketingCampaignStatus.ACTIVE, label: t(`tables.${MarketingCampaignStatus.ACTIVE}`) },
    { value: MarketingCampaignStatus.PAUSED, label: t(`tables.${MarketingCampaignStatus.PAUSED}`) },
    { value: MarketingCampaignStatus.COMPLETED, label: t(`tables.${MarketingCampaignStatus.COMPLETED}`) },
    { value: MarketingCampaignStatus.CANCELLED, label: t(`tables.${MarketingCampaignStatus.CANCELLED}`) },
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
            navigate('/marketing/companies/new/marketing/campaign')
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
        <Input
          placeholder={t('filters.search.placeholder')}
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
          allowClear
        />
        <Select
          placeholder={t('constants.status')}
          value={statusFilter}
          onChange={handleStatusFilter}
          options={statusOptions}
          className="min-w-[200px]"
          allowClear
        />
      </div>

      <div className="mt-6">
        <Table
          dataSource={promotions}
          columns={columns}
          pagination={{
            current: promotionsData?.page || 1,
            total: promotionsData?.total || 0,
            pageSize: promotionsData?.size || 10,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange,
          }}
          bordered={false}
          scroll={{ x: 'max-content' }}
          loading={isLoading}
          locale={{ emptyText: t('table.noData') }}
        />
      </div>
    </div>
  );
};

export default MarketingCompanies;
