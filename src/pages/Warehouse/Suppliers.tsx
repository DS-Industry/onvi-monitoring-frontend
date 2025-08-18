import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import useFormHook from '@/hooks/useFormHook';
import { useToast } from '@/components/context/useContext';
import useSWRMutation from 'swr/mutation';
import { createSupplier, getSupplier } from '@/services/api/warehouse';
import useSWR, { mutate } from 'swr';
import { Drawer, Table, Button as AntDButton, Input as AntInput } from 'antd';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { ColumnsType } from 'antd/es/table';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import { PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import { useSearchParams } from 'react-router-dom';
import { ALL_PAGE_SIZES, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';

type Supplier = {
  id: number;
  name: string;
  contact: string;
};

const Suppliers: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { showToast } = useToast();
  const userPermissions = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const supplierName = searchParams.get('supplierName') || undefined;

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      supplierName: val,
      page: DEFAULT_PAGE,
    });
  };

  const resetFilter = (): void => {
    updateSearchParams(searchParams, setSearchParams, {
      supplierName: undefined,
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
    });
  }

  const filterParams = useMemo(
    () => ({
      name: supplierName,
      page: currentPage,
      size: pageSize,
    }),
    [supplierName, currentPage, pageSize]
  );

  const swrKey = `get-supplier-${filterParams.name}-${filterParams.page}-${filterParams.size}`;

  const { data: supplierData, isLoading: loadingSupplier } = useSWR(
    swrKey,
    () => getSupplier(filterParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const supplier = supplierData?.map(sup => sup.props) || [];

  const defaultValues = {
    name: '',
    contact: '',
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createSup, isMutating } = useSWRMutation(
    ['create-supplier'],
    async () =>
      createSupplier({
        name: formData.name,
        contact: formData.contact,
      })
  );

  type FieldType = 'name' | 'contact';

  const handleInputChange = (field: FieldType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
    setDrawerOpen(false);
  };

  const onSubmit = async () => {
    try {
      const result = await createSup();
      if (result) {
        mutate([`get-supplier`]);
        resetForm();
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const columnsSupplier: ColumnsType<Supplier> = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Контакт',
      dataIndex: 'contact',
      key: 'contact',
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columnsSupplier, 'suppliers-table-columns');

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'Warehouse' },
    { action: 'update', subject: 'Warehouse' },
  ]);

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.suppliers')}
          </span>
          <QuestionMarkIcon />
        </div>
        {allowed && (
          <AntDButton
            icon={<PlusOutlined />}
            className="btn-primary"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            {t('routes.add')}
          </AntDButton>
        )}
      </div>
      <GeneralFilters
        count={supplier.length}
        display={['reset']}
        onReset={resetFilter}
      >
        <div className="flex flex-col text-sm text-text02">
          <div className='mb-1'>{t('warehouse.supplierName')}</div>
          <AntInput
            className="w-full sm:w-80"
            placeholder={t('warehouse.enterSup')}
            value={supplierName}
            onChange={e => handleChange(e.target.value)}
          />
        </div>
      </GeneralFilters>
      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />
        <Table
          dataSource={supplier}
          columns={visibleColumns}
          loading={loadingSupplier}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: supplier.length,
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
        title={t('routes.suppliers')}
        placement="right"
        size="large"
        onClose={resetForm}
        open={drawerOpen}
        className="custom-drawer"
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <span className="font-semibold text-sm text-text01">
            {t('warehouse.fields')}
          </span>
          <div className="font-semibold text-2xl mb-5 text-text01">
            {t('warehouse.basic')}
          </div>
          <Input
            type={''}
            title={t('warehouse.supName')}
            label={t('warehouse.enterSup')}
            classname="w-80"
            value={formData.name}
            changeValue={e => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            {...register('name', { required: t('validation.nameRequired') })}
            helperText={errors.name?.message || ''}
          />
          <Input
            type={''}
            title={`${t('profile.telephone')}*`}
            label={t('warehouse.enterPhone')}
            classname="w-80"
            value={formData.contact}
            changeValue={e => handleInputChange('contact', e.target.value)}
            error={!!errors.contact}
            {...register('contact', { required: t('validation.phoneRequired') })}
            helperText={errors.contact?.message || ''}
          />
          <div className="flex space-x-4">
            <Button
              title={t('organizations.cancel')}
              type="outline"
              handleClick={() => {
                setDrawerOpen(false);
                resetForm();
              }}
            />
            <Button
              title={t('organizations.save')}
              form={true}
              isLoading={isMutating}
              handleClick={() => {}}
            />
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default Suppliers;
