import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '@/components/ui/Input/Input';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import MultilineInput from '@/components/ui/Input/MultilineInput';
import useSWR, { mutate } from 'swr';
import {
  createNomenclature,
  deleteNomenclature,
  getCategory,
  getNomenclature,
  getNomenclatureCount,
  getSupplier,
  updateNomenclature,
} from '@/services/api/warehouse';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/components/context/useContext';
import { Drawer, Select, Table, Tooltip } from 'antd';
import { usePermissions } from '@/hooks/useAuthStore';
import { Can } from '@/permissions/Can';
import { DownloadOutlined, EditOutlined } from '@ant-design/icons';
import Button from 'antd/es/button';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import hasPermission from '@/permissions/hasPermission';
import { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { useUser } from '@/hooks/useUserStore';

enum PurposeType {
  SALE = 'SALE',
  INTERNAL_USE = 'INTERNAL_USE',
}

type INVENTORY = {
  name: string;
  sku: string;
  organizationId: number;
  categoryId: number;
  supplierId?: number;
  measurement: string;
  description?: string;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
  purpose?: PurposeType;
};

type InventoryColumn = {
  id: number;
  sku: string;
  name: string;
  categoryId?: string;
};

const InventoryCreation: React.FC = () => {
  const { t } = useTranslation();
  const allCategoriesText = t('warehouse.all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInventoryId, setEditInventoryId] = useState<number>(0);
  const userPermissions = usePermissions();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const category = searchParams.get('category') || '*';
  const search = searchParams.get('search') || '';
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const user = useUser();

  const filterParams = useMemo(
    () => ({
      organizationId: user.organizationId,
      category,
      search,
    }),
    [user, category, search]
  );

  const swrKey = useMemo(() => {
    return [
      'get-inventory',
      filterParams.organizationId,
      filterParams.category,
      filterParams.search,
      currentPage,
      pageSize,
    ];
  }, [filterParams, currentPage, pageSize]);

  const { data: inventoryData, isLoading: inventoryLoading } = useSWR(
    user.organizationId ? swrKey : null,
    () => {
      return getNomenclature(Number(user.organizationId!)!, {
        page: currentPage,
        size: pageSize,
        search: search || undefined,
      });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: inventoryCount } = useSWR(
    user.organizationId
      ? [`get-nomenclature-count`, user.organizationId, search]
      : null,
    () => {
      return getNomenclatureCount(Number(user.organizationId!)!, {
        search: search || undefined,
      });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: categoryData } = useSWR([`get-category`], () => getCategory(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const { data: supplierData } = useSWR(
    [`get-supplier`],
    () => getSupplier({}),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const inventories =
    inventoryData
      ?.map(item => item.props)
      ?.filter(
        (item: { categoryId: number }) =>
          category === '*' || item.categoryId === Number(category)
      )
      ?.map(item => item) || [];

  const categories: { name: string; value: number | string }[] =
    categoryData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const categoryAllObj = {
    name: allCategoriesText,
    value: '*',
  };

  categories.unshift(categoryAllObj);

  const inventoriesDisplay = inventories.map(item => ({
    id: item.id,
    sku: item.sku,
    name: item.name,
    categoryId: categories.find(cat => cat.value === item.categoryId)?.name,
  }));

  const suppliers: { name: string; value: number }[] =
    supplierData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const defaultValues: INVENTORY = {
    name: '',
    sku: '',
    organizationId: 0,
    categoryId: 0,
    supplierId: undefined,
    measurement: '',
    description: undefined,
    weight: undefined,
    length: undefined,
    height: undefined,
    width: undefined,
    purpose: undefined,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createInventory, isMutating } = useSWRMutation(
    ['create-inventory'],
    async (_key, { arg }: { arg: number }) =>
      createNomenclature({
        name: formData.name,
        sku: formData.sku,
        organizationId: arg,
        categoryId: formData.categoryId,
        supplierId: formData.supplierId,
        measurement: formData.measurement,
        metaData: {
          description: formData.description,
          weight: formData.weight,
          height: formData.height,
          width: formData.width,
          length: formData.length,
          purpose: formData.purpose,
        },
      })
  );

  const { trigger: updateInventory, isMutating: updatingInventory } =
    useSWRMutation(['update-inventory'], async () =>
      updateNomenclature({
        nomenclatureId: editInventoryId,
        name: formData.name,
        categoryId: formData.categoryId,
        supplierId: formData.supplierId,
        measurement: formData.measurement,
        metaData: {
          description: formData.description,
          weight: formData.weight,
          height: formData.height,
          width: formData.width,
          length: formData.length,
          purpose: formData.purpose,
        },
      })
    );

  type FieldType = keyof typeof defaultValues;

  const handleInputChange = (field: FieldType, value: string) => {
    const numericFields = [
      'organizationId',
      'categoryId',
      'supplierId',
      'weight',
      'height',
      'length',
      'width',
    ];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const handleUpdate = (id: number) => {
    setIsEditMode(true);
    setDrawerOpen(true);
    const inventoryToEdit = inventories.find(inventory => inventory.id === id);
    if (inventoryToEdit) {
      setFormData({
        name: inventoryToEdit.name,
        sku: inventoryToEdit.sku,
        organizationId: inventoryToEdit.organizationId,
        categoryId: inventoryToEdit.categoryId,
        measurement: inventoryToEdit.measurement,
        supplierId: inventoryToEdit.supplierId,
        description: inventoryToEdit.metaData
          ? inventoryToEdit.metaData.description
          : undefined,
        width: inventoryToEdit.metaData
          ? inventoryToEdit.metaData.width
          : undefined,
        length: inventoryToEdit.metaData
          ? inventoryToEdit.metaData.length
          : undefined,
        height: inventoryToEdit.metaData
          ? inventoryToEdit.metaData.height
          : undefined,
        purpose: inventoryToEdit.metaData
          ? inventoryToEdit.metaData.purpose
          : undefined,
        weight: inventoryToEdit.metaData
          ? inventoryToEdit.metaData.weight
          : undefined,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const result = await mutate(
        [`delete-nomenclature`, editInventoryId],
        () => deleteNomenclature(editInventoryId),
        false
      );

      if (result) {
        setDrawerOpen(false);
        mutate(swrKey);
      }
    } catch (error) {
      console.error('Error deleting nomenclature:', error);
      showToast(t('errors.other.errorDeletingNomenclature'), 'error');
    }
  };

  const resetForm = () => {
    setFormData(defaultValues);
    setIsEditMode(false);
    reset();
    setEditInventoryId(0);
    setDrawerOpen(false);
  };

  const onSubmit = async () => {
    try {
      if (editInventoryId) {
        const result = await updateInventory();
        if (result) {
          updateSearchParams(searchParams, setSearchParams, {
            category: result.props.categoryId,
          });
          mutate(swrKey);
          resetForm();
        } else {
          throw new Error('Invalid update data.');
        }
      } else {
        const result = await createInventory(Number(user.organizationId));
        if (result) {
          updateSearchParams(searchParams, setSearchParams, {
            category: result.props.categoryId,
          });
          mutate(swrKey);
          resetForm();
        } else {
          throw new Error('Invalid response from API');
        }
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'Warehouse' },
    { action: 'update', subject: 'Warehouse' },
  ]);

  const columnsInventory: ColumnsType<InventoryColumn> = [
    {
      title: 'Код',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Номенклатура',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Категория',
      dataIndex: 'categoryId',
      key: 'categoryId',
    },
  ];

  if (allowed) {
    columnsInventory.push({
      title: '',
      dataIndex: 'actions',
      key: 'actions',
      render: (_: unknown, record: { id: number }) => (
        <Tooltip title="Редактировать">
          <Button
            type="text"
            icon={
              <EditOutlined className="text-blue-500 hover:text-blue-700" />
            }
            onClick={() => handleUpdate(record.id)}
            style={{ height: '24px' }}
          />
        </Tooltip>
      ),
    });
  }

  const {
    checkedList,
    setCheckedList,
    options: columnOptions,
    visibleColumns,
  } = useColumnSelector(columnsInventory, 'inventory-columns');

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.nomenclature')}
          </span>
        </div>
        {allowed && (
          <div className="flex space-x-2">
            <Button
              icon={<DownloadOutlined />}
              className="btn-outline-primary"
              onClick={() => {
                navigate('/warehouse/inventory/import');
              }}
            >
              <span className="hidden sm:flex">{t('routes.import')}</span>
            </Button>
            <Button
              icon={<PlusOutlined />}
              className="btn-primary"
              onClick={() => setDrawerOpen(!drawerOpen)}
            >
              <span className="hidden sm:flex">{t('routes.add')}</span>
            </Button>
          </div>
        )}
      </div>
      <GeneralFilters count={inventoriesDisplay.length} display={['search', 'none']}>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t('warehouse.category')}
          </label>
          <Select
            showSearch
            allowClear={false}
            className="w-full sm:w-80"
            options={categories.map(item => ({
              label: item.name,
              value: String(item.value),
            }))}
            value={searchParams.get('category') || '*'}
            onChange={value =>
              updateSearchParams(searchParams, setSearchParams, {
                category: value,
              })
            }
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? '')
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </div>
      </GeneralFilters>
      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={columnOptions}
          onChange={setCheckedList}
        />
        <Table
          dataSource={inventoriesDisplay}
          columns={visibleColumns}
          loading={inventoryLoading}
          scroll={{ x: '500px' }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: inventoryCount?.count || 0,
            showSizeChanger: true,
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
        />
      </div>
      <Drawer
        title={isEditMode ? t('warehouse.edit') : t('warehouse.add')}
        placement="right"
        size="large"
        onClose={resetForm}
        open={drawerOpen}
        className="custom-drawer"
      >
        <form
          className="w-full max-w-2xl mx-auto p-4 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <span className="font-semibold text-sm text-text01">
            {t('warehouse.fields')}
          </span>
          <div className="font-semibold text-2xl mb-5 text-text01">
            {t('warehouse.basic')}
          </div>

          <Input
            title={t('profile.name')}
            label={t('warehouse.enter')}
            type={'text'}
            classname="w-80"
            value={formData.name}
            changeValue={e => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            {...register('name', {
              required: !isEditMode && t('validation.nameRequired'),
            })}
            helperText={errors.name?.message || ''}
          />
          <DropdownInput
            title={`${t('routes.suppliers')}`}
            label={
              suppliers.length === 0
                ? t('warehouse.noVal')
                : t('warehouse.notSel')
            }
            options={suppliers}
            classname="w-64"
            {...register('supplierId')}
            value={formData.supplierId}
            onChange={value => handleInputChange('supplierId', value)}
          />
          <DropdownInput
            title={`${t('warehouse.category')} *`}
            label={
              categories.length === 0
                ? t('warehouse.noVal')
                : t('warehouse.notSel')
            }
            options={categories}
            classname="w-64"
            {...register('categoryId', {
              required: !isEditMode && t('validation.categoryIdRequired'),
              validate: value => value !== 0 || t('validation.categoryIdRequired'),
            })}
            value={formData.categoryId}
            onChange={value => handleInputChange('categoryId', value)}
            error={!!errors.categoryId}
            helperText={errors.categoryId?.message}
          />
          <DropdownInput
            title={`${t('warehouse.unit')} *`}
            label={t('warehouse.notSel')}
            options={[
              { name: t('tables.PIECE'), value: 'PIECE' },
              { name: t('tables.KILOGRAM'), value: 'KILOGRAM' },
              { name: t('tables.LITER'), value: 'LITER' },
              { name: t('tables.METER'), value: 'METER' },
            ]}
            classname="w-64"
            {...register('measurement', {
              required: !isEditMode && t('validation.measurementRequired'),
            })}
            value={formData.measurement}
            onChange={value => handleInputChange('measurement', value)}
            error={!!errors.measurement}
            helperText={errors.measurement?.message}
          />
          <Input
            title={`${t('warehouse.article')} *`}
            label={isEditMode ? '' : t('warehouse.enterItem')}
            type={'text'}
            classname="w-80"
            value={formData.sku}
            changeValue={e => handleInputChange('sku', e.target.value)}
            error={!!errors.sku}
            {...register('sku', {
              required: !isEditMode && t('validation.skuRequired'),
            })}
            helperText={errors.sku?.message || ''}
            disabled={isEditMode}
          />
          <MultilineInput
            title={t('warehouse.desc')}
            label={t('warehouse.about')}
            classname="w-80"
            inputType="secondary"
            value={formData.description}
            changeValue={e => handleInputChange('description', e.target.value)}
            {...register('description')}
          />
          <div className="font-semibold text-2xl mb-5 text-text01">
            {t('warehouse.product')}
          </div>
          <Input
            title={t('warehouse.weight')}
            label={t('warehouse.enterWgt')}
            type={'number'}
            classname="w-80"
            value={formData.weight}
            changeValue={e => handleInputChange('weight', e.target.value)}
            {...register('weight')}
          />
          <Input
            title={t('warehouse.sizeW')}
            label={t('warehouse.centimeters')}
            type={'number'}
            classname="w-40"
            value={formData.width}
            changeValue={e => handleInputChange('width', e.target.value)}
            {...register('width')}
          />
          <Input
            title={t('warehouse.sizeG')}
            label={t('warehouse.centimeters')}
            type={'number'}
            classname="w-40"
            value={formData.length}
            changeValue={e => handleInputChange('length', e.target.value)}
            {...register('length')}
          />
          <Input
            title={t('warehouse.sizeB')}
            label={t('warehouse.centimeters')}
            type={'number'}
            classname="w-40"
            value={formData.height}
            changeValue={e => handleInputChange('height', e.target.value)}
            {...register('height')}
          />
          <div className="font-semibold text-2xl mb-5 text-text01">
            {t('warehouse.purpose')}
          </div>
          <div className="flex">
            <div className="flex-1 flex flex-col">
              <div className="flex">
                <input
                  type="radio"
                  value={PurposeType.SALE}
                  checked={formData.purpose === PurposeType.SALE}
                  {...register('purpose')}
                  onChange={e => {
                    handleInputChange('purpose', e.target.value);
                  }}
                />
                <div className="text-text02 ml-2">{t('warehouse.sale')}</div>
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex">
                <input
                  type="radio"
                  value={PurposeType.INTERNAL_USE}
                  checked={formData.purpose === PurposeType.INTERNAL_USE}
                  {...register('purpose')}
                  onChange={e => {
                    handleInputChange('purpose', e.target.value);
                  }}
                />
                <div className="text-text02 ml-2">{t('warehouse.write')}</div>
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={() => {
                resetForm();
              }}
            >
              {t('organizations.cancel')}
            </Button>
            <Can
              requiredPermissions={[
                { action: 'manage', subject: 'Warehouse' },
                { action: 'delete', subject: 'Warehouse' },
              ]}
              userPermissions={userPermissions}
            >
              {allowed =>
                allowed &&
                isEditMode && (
                  <Button
                    onClick={handleDelete}
                    className="bg-errorFill text-text04 hover:bg-red-300"
                  >
                    {t('warehouse.deletePos')}
                  </Button>
                )
              }
            </Can>
            <Button
              htmlType={'submit'}
              type="primary"
              loading={isEditMode ? updatingInventory : isMutating}
            >
              {t('organizations.save')}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default InventoryCreation;
