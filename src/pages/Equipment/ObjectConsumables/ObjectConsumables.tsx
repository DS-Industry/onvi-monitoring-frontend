import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Table, Button, Space, Select, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';

import AddConsumableModal from './AddConsumableModal';
import { useToast } from '@/components/context/useContext';
import { Can } from '@/permissions/Can';
import useAuthStore from '@/config/store/authSlice';
import {
  createTechConsumables,
  deleteTechConsumables,
  getTechConsumables,
  ConsumablesType,
} from '@/services/api/equipment';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { updateSearchParams } from '@/utils/searchParamsUtils';

const { Option } = Select;

const ObjectConsumables: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const userPermissions = useAuthStore(state => state.permissions);

  const posId = Number(searchParams.get('posId')) || undefined;
  const typeFilter = searchParams.get('type') || undefined;

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: consumables, isLoading } = useSWR(
    posId ? ['get-tech-consumables', posId, typeFilter] : null,
    () => getTechConsumables(posId!, { type: typeFilter }),
    { revalidateOnFocus: false }
  );

  const { trigger: createTrigger, isMutating: creating } = useSWRMutation(
    'create-consumable',
    (_, { arg }: { arg: { posId: number; nomenclatureId: number; type?: string } }) =>
      createTechConsumables(arg)
  );

  const { trigger: deleteTrigger, isMutating: deleting } = useSWRMutation(
    'delete-consumables',
    (_, { arg }: { arg: { ids: number[] } }) => deleteTechConsumables(arg)
  );

  const handleAdd = async (nomenclatureId: number, type?: string) => {
    if (!posId) return;
    try {
      await createTrigger({ posId, nomenclatureId, type });
      mutate(['get-tech-consumables', posId, typeFilter]);
      setIsModalOpen(false);
      showToast(t('success.recordCreated'), 'success');
    } catch {
      showToast(t('analysis.ERROR'), 'error');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await deleteTrigger({ ids: selectedRowKeys.map(Number) });
      mutate(['get-tech-consumables', posId, typeFilter]);
      setSelectedRowKeys([]);
      showToast(t('success.recordDeleted'), 'success');
    } catch {
      showToast(t('info.deleteCancelled'), 'error');
    }
  };

  const handleTypeChange = (value: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      type: value || undefined,
    });
  };

  const columns = [
    {
      title: t('equipment.name'),
      dataIndex: 'nomenclatureName',
      key: 'nomenclatureName',
    },
    {
      title: t('equipment.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => t(`equipment.types.${type}`) || type,
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <>
      <div className="ml-12 md:ml-0 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.objectConsumables')}
          </span>
        </div>
      </div>

      <GeneralFilters display={['pos']}>
        <div className="flex flex-col sm:w-80">
          <label className="text-sm text-text02">{t('equipment.type')}</label>
          <Select
            allowClear
            placeholder={t('equipment.selectType')}
            className="w-full"
            value={typeFilter}
            onChange={handleTypeChange}
          >
            {Object.values(ConsumablesType).map(type => (
              <Option key={type} value={type}>
                {t(`equipment.types.${type}`)}
              </Option>
            ))}
          </Select>
        </div>
      </GeneralFilters>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <Space>
            <Can
              requiredPermissions={[
                { action: 'create', subject: 'Incident' },
                { action: 'manage', subject: 'Incident' },
              ]}
              userPermissions={userPermissions}
            >
              {allowed => allowed && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalOpen(true)}
                  disabled={!posId}
                >
                  {t('finance.addRow')}
                </Button>
              )}
            </Can>

            <Popconfirm
              title={t('marketingLoyalty.confirmDelete')}
              description={t('finance.del')}
              onConfirm={handleDeleteSelected}
              okText={t('actions.delete')}
              cancelText={t('actions.cancel')}
              disabled={selectedRowKeys.length === 0}
            >
              <Button
                danger
                disabled={!selectedRowKeys.length}
                loading={deleting}
                icon={<DeleteOutlined />}
              >
                {t('finance.del')} ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          </Space>
        </div>

        <Table
          rowKey="id"
          dataSource={consumables}
          columns={columns}
          loading={isLoading}
          rowSelection={rowSelection}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </div>

      <AddConsumableModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
        isLoading={creating}
        existingNomenclatureIds={consumables?.map(item => item.nomenclatureId) || []}
      />
    </>
  );
};

export default ObjectConsumables;