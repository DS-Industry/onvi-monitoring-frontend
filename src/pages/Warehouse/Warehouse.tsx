import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';
import { getPoses, getWorkers } from '@/services/api/equipment';
import { createWarehouse, getWarehouses } from '@/services/api/warehouse';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import useFormHook from '@/hooks/useFormHook';
import { useToast } from '@/components/context/useContext';
import useSWRMutation from 'swr/mutation';
import Input from '@/components/ui/Input/Input';
import { Drawer, Table, Button } from 'antd';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { ColumnsType } from 'antd/es/table';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { useSearchParams } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useUser } from '@/hooks/useUserStore';

type Warehouse = {
  name: string;
  location: string;
  managerId: number;
  posId: number;
};

const Warehouse: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { showToast } = useToast();
  const userPermissions = usePermissions();
  const posId = Number(searchParams.get('posId')) || undefined;
  const placementId = Number(searchParams.get('city')) || undefined;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const filterParams = useMemo(
    () => ({
      posId,
      placementId,
    }),
    [posId, placementId]
  );

  const swrKey = useMemo(() => {
    return ['get-warehouses', filterParams.posId, filterParams.placementId];
  }, [filterParams]);

  const { data: posData } = useSWR(
    [`get-pos`, placementId],
    () => getPoses({ placementId: placementId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const user = useUser();

  const { data: workerData } = useSWR(
    user.organizationId ? [`get-worker`, user.organizationId] : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: warehouseData, isLoading: warehouseLoading } = useSWR(
    swrKey,
    () =>
      getWarehouses({
        posId: posId,
        placementId: placementId,
        page: currentPage,
        size: pageSize,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const poses: { name: string; value: number | string }[] =
    posData?.map(item => ({ name: item.name, value: item.id })) || [];

  const workers: { name: string; value: number }[] =
    workerData?.map(item => ({
      name: item.name + ' ' + item.surname,
      value: item.id,
    })) || [];

  const warehouses =
    warehouseData?.map(item => ({
      ...item.props,
      manager: item.props.managerName ?? '',
      posName: poses.find(pos => pos.value === item.props.posId)?.name,
    })) || [];

  const defaultValues = {
    name: '',
    location: '',
    managerId: 0,
    posId: 0,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createWare, isMutating } = useSWRMutation(
    ['create-warehouse'],
    async () =>
      createWarehouse({
        name: formData.name,
        location: formData.location,
        managerId: formData.managerId,
        posId: formData.posId,
      })
  );

  type FieldType = 'name' | 'location' | 'managerId' | 'posId';

  const handleInputChange = (field: FieldType, value: string) => {
    const numericFields = ['managerId', 'posId'];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
    setDrawerOpen(false);
  };

  const onSubmit = async () => {
    try {
      const result = await createWare();
      if (result) {
        mutate(swrKey);
        resetForm();
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const columnsWarehouses: ColumnsType<Warehouse> = [
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Расположение',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Менеджер',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: 'Автомойка/ Филиал',
      dataIndex: 'posName',
      key: 'posName',
    },
  ];

  const {
    checkedList,
    setCheckedList,
    options: columnOptions,
    visibleColumns,
  } = useColumnSelector(columnsWarehouses, 'warehouse-plan-fact-columns');

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'Warehouse' },
    { action: 'update', subject: 'Warehouse' },
  ]);

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.ware')}
          </span>
        </div>
        {allowed && (
          <Button
            icon={<PlusOutlined />}
            className="btn-primary"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <div className="hidden sm:flex">{t('routes.add')}</div>
          </Button>
        )}
      </div>
      <GeneralFilters count={warehouses.length} display={['pos', 'city']} />
      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={columnOptions}
          onChange={setCheckedList}
        />
        <Table
          dataSource={warehouses}
          columns={visibleColumns}
          loading={warehouseLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: warehouses.length,
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
      </div>
      <Drawer
        title={t('warehouse.ware')}
        placement="right"
        size="large"
        onClose={resetForm}
        open={drawerOpen}
        className="custom-drawer"
      >
        <form className="w-full max-w-2xl mx-auto p-4 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <span className="font-semibold text-sm text-text01">
            {t('warehouse.fields')}
          </span>
          <Input
            title={t('profile.name')}
            label={t('warehouse.enter')}
            type={'text'}
            classname="w-80"
            value={formData.name}
            changeValue={e => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            {...register('name', { required: t('validation.nameRequired') })}
            helperText={errors.name?.message || ''}
          />
          <Input
            title={`${t('pos.location')} *`}
            label={t('warehouse.enter')}
            type={'text'}
            classname="w-80"
            value={formData.location}
            changeValue={e => handleInputChange('location', e.target.value)}
            error={!!errors.location}
            {...register('location', {
              required: t('validation.locationRequired'),
            })}
            helperText={errors.location?.message || ''}
          />
          <DropdownInput
            title={`${t('warehouse.manager')} *`}
            label={t('warehouse.notSel')}
            options={workers}
            classname="w-64"
            {...register('managerId', {
              required: t('validation.categoryIdRequired'),
              validate: value =>
                value !== 0 || t('validation.categoryIdRequired'),
            })}
            value={formData.managerId}
            onChange={value => handleInputChange('managerId', value)}
            error={!!errors.managerId}
            helperText={errors.managerId?.message}
          />
          <DropdownInput
            title={`${t('marketing.carWash')} *`}
            label={t('warehouse.notSel')}
            options={poses}
            classname="w-64"
            {...register('posId', {
              required: t('validation.categoryIdRequired'),
              validate: value =>
                value !== 0 || t('validation.categoryIdRequired'),
            })}
            value={formData.posId}
            onChange={value => handleInputChange('posId', value)}
            error={!!errors.posId}
            helperText={errors.posId?.message}
          />
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button onClick={() => resetForm()}>
              {t('organizations.cancel')}
            </Button>
            <Button
              htmlType="submit"
              loading={isMutating}
              type='primary'
            >
              {t('organizations.save')}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default Warehouse;
