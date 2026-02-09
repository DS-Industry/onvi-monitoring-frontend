import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Select,
  Popconfirm,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/components/context/useContext';
import {
  getPromocodes,
  deletePromocode,
  PersonalPromocodeResponse,
  PromocodeType,
  PromocodeFilterType,
} from '@/services/api/marketing';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { ColumnsType } from 'antd/es/table';
import { debounce } from 'lodash';
import PromoCodeDrawer from './PromoCodeDrawer';

const { Option } = Select;

interface PromoCodesTabProps {
  organizationId: number;
}

const PromoCodesTab: React.FC<PromoCodesTabProps> = ({
  organizationId,
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [promoDrawerOpen, setPromoDrawerOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PersonalPromocodeResponse | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const search = searchParams.get('search') || undefined;
  const filter = (searchParams.get('filter') as PromocodeFilterType | 'all' | 'standalone' | 'campaign' | 'personal') || PromocodeFilterType.ALL;
  const isActive = searchParams.get('isActive');
  const personalUserId = searchParams.get('personalUserId');

  const { data: promocodesData, isLoading: promocodesLoading } = useSWR(
    organizationId
      ? [
        'promocodes',
        organizationId,
        currentPage,
        pageSize,
        filter,
        search,
        isActive,
        personalUserId,
      ]
      : null,
    () =>
      getPromocodes({
        organizationId: organizationId,
        page: currentPage,
        size: pageSize,
        filter: filter as PromocodeFilterType,
        search,
        isActive: isActive ? isActive === 'true' : undefined,
        personalUserId: personalUserId ? Number(personalUserId) : undefined,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const { trigger: deletePromoMutation } = useSWRMutation(
    ['delete-promocode'],
    async (_, { arg }: { arg: number }) => {
      return deletePromocode(arg);
    }
  );

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateSearchParams(searchParams, setSearchParams, {
        search: value || undefined,
        page: '1',
      });
    }, 500),
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    setSearchValue(search || '');
  }, [search]);

  useEffect(() => {
    if (isActive !== null && isActive !== undefined) {
      setIsActiveFilter(isActive === 'true');
    }
  }, [isActive]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleCreatePromo = () => {
    setEditingPromo(null);
    setPromoDrawerOpen(true);
  };

  const handleEditPromo = (id: number) => {
    const promo = promocodesData?.data?.find((p) => p.id === id);
    if (!promo) {
      message.error(t('common.somethingWentWrong'));
      return;
    }
    setEditingPromo(promo);
    setPromoDrawerOpen(true);
  };

  const handleDeletePromo = async (id: number) => {
    try {
      await deletePromoMutation(id);
      mutate([
        'promocodes',
        organizationId,
        currentPage,
        pageSize,
        filter,
        search,
        isActive,
        personalUserId,
      ]);
      showToast(t('success.recordDeleted'), 'success');
    } catch (error) {
      showToast(t('errors.deleteFailed'), 'error');
    }
  };

  const handlePromoDrawerClose = () => {
    setPromoDrawerOpen(false);
    setEditingPromo(null);
  };

  const handlePromoSubmitSuccess = () => {
    mutate([
      'promocodes',
      organizationId,
      currentPage,
      pageSize,
      filter,
      search,
      isActive,
      personalUserId,
    ]);
    handlePromoDrawerClose();
  };

  const hasPersonalUsers = promocodesData?.data?.some(
    (record) => record.personalUser !== null
  );

  const promoColumns: ColumnsType<PersonalPromocodeResponse> = [
    {
      title: t('marketing.promoCode'),
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => (
        <span className="font-semibold">{text}</span>
      ),
    },
    ...(filter === PromocodeFilterType.PERSONAL || hasPersonalUsers
      ? [
        {
          title: t('marketing.personalUser'),
          key: 'personalUser',
          render: (_: any, record: PersonalPromocodeResponse) => {
            if (record.personalUser) {
              return (
                <div>
                  <div className="font-medium">{record.personalUser.name}</div>
                  <div className="text-sm text-gray-500">{record.personalUser.phone}</div>
                  {record.personalUser.email && (
                    <div className="text-sm text-gray-500">{record.personalUser.email}</div>
                  )}
                </div>
              );
            }
            return '—';
          },
        } as const,
      ]
      : []),
    {
      title: t('constants.type'),
      dataIndex: 'promocodeType',
      key: 'promocodeType',
      render: (type: string) => {
        const typeEnum = type as PromocodeType;
        return (
          <Tag color={typeEnum === PromocodeType.CAMPAIGN ? 'blue' : 'green'}>
            {t(`tables.${type}`) || type}
          </Tag>
        );
      },
    },
    {
      title: t('marketing.discountType'),
      dataIndex: 'discountType',
      key: 'discountType',
      render: (type: string | null | undefined) => {
        if (!type) return '—';
        return t(`tables.${type}`) || type;
      },
    },
    {
      title: t('marketing.discountValue'),
      dataIndex: 'discountValue',
      key: 'discountValue',
      render: (value: number | null | undefined, record: PersonalPromocodeResponse) => {
        if (!value) return '—';
        const discountType = record.discountType;
        if (discountType === 'PERCENTAGE') {
          return `${value}%`;
        }
        return `${value}`;
      },
    },
    {
      title: t('marketing.maxUsage'),
      dataIndex: 'maxUsage',
      key: 'maxUsage',
      render: (value: number | null | undefined) => value || "-",
    },
    {
      title: t('marketing.currentUsage'),
      dataIndex: 'currentUsage',
      key: 'currentUsage',
      render: (value: number | undefined) => value || 0,
    },
    {
      title: t('constants.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? t('constants.active') : t('constants.inactive')}
        </Tag>
      ),
    },
    {
      title: t('constants.actions'),
      key: 'actions',
      render: (_: any, record: PersonalPromocodeResponse) => {
        const isCampaignPromocode = record.promocodeType === PromocodeType.CAMPAIGN;

        return (
          <Space>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditPromo(record.id)}
            >
              {t('constants.edit')}
            </Button>
            {isCampaignPromocode ? (
              <Tooltip title={t('marketing.campaignPromocodeDeleteWarning')}>
                <Button type="link" danger icon={<DeleteOutlined />} disabled>
                  {t('common.delete')}
                </Button>
              </Tooltip>
            ) : (
              <Popconfirm
                title={t('techTasks.confirmDelete')}
                onConfirm={() => handleDeletePromo(record.id)}
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  {t('common.delete')}
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.promoCodeManagement')}
          </span>
        </div>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={handleCreatePromo}
        >
          <span className="hidden sm:flex">
            {t('routes.add')}
          </span>
        </Button>
      </div>

      <div className="mt-6 mb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">{t('analysis.search')}</label>
          <Input.Search
            placeholder={t('analysis.search')}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={handleSearch}
            allowClear
            className="w-full sm:w-72 md:w-80"
            style={{ height: '32px' }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">{t('constants.type')}</label>
          <Select
            value={filter}
            onChange={(value) => {
              updateSearchParams(searchParams, setSearchParams, {
                filter: value,
                page: '1',
              });
            }}
            style={{ width: 150, height: '32px' }}
          >
            <Option value={PromocodeFilterType.ALL}>{t('constants.all')}</Option>
            <Option value={PromocodeFilterType.STANDALONE}>{t('tables.STANDALONE')}</Option>
            <Option value={PromocodeFilterType.CAMPAIGN}>{t('tables.CAMPAIGN')}</Option>
            <Option value={PromocodeFilterType.PERSONAL}>{t('tables.PERSONAL')}</Option>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">{t('constants.status')}</label>
          <Select
            value={isActiveFilter === undefined ? 'all' : isActiveFilter ? 'active' : 'inactive'}
            onChange={(value) => {
              const newValue = value === 'all' ? undefined : value === 'active';
              setIsActiveFilter(newValue);
              updateSearchParams(searchParams, setSearchParams, {
                isActive: newValue === undefined ? undefined : String(newValue),
                page: '1',
              });
            }}
            style={{ width: 150, height: '32px' }}
          >
            <Option value="all">{t('constants.all')}</Option>
            <Option value="active">{t('constants.active')}</Option>
            <Option value="inactive">{t('constants.inactive')}</Option>
          </Select>
        </div>
      </div>

      <Table
        dataSource={(promocodesData?.data || []) as PersonalPromocodeResponse[]}
        columns={promoColumns}
        loading={promocodesLoading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: promocodesData?.total || 0,
          pageSizeOptions: ALL_PAGE_SIZES,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          onChange: (page, size) => {
            updateSearchParams(searchParams, setSearchParams, {
              page: String(page),
              size: String(size),
            });
          },
        }}
        scroll={{ x: 'max-content' }}
      />

      <PromoCodeDrawer
        isOpen={promoDrawerOpen}
        onClose={handlePromoDrawerClose}
        editingPromo={editingPromo}
        organizationId={organizationId}
        onSuccess={handlePromoSubmitSuccess}
      />
    </>
  );
};

export default PromoCodesTab;
