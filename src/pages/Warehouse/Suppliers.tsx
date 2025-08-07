import NoDataUI from '@/components/ui/NoDataUI';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InventoryEmpty from '@/assets/NoInventory.png';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import useFormHook from '@/hooks/useFormHook';
import { useToast } from '@/components/context/useContext';
import useSWRMutation from 'swr/mutation';
import { createSupplier, getSupplier } from '@/services/api/warehouse';
import useSWR, { mutate } from 'swr';
import TableSkeleton from '@/components/ui/Table/TableSkeleton';
import { Drawer, Table } from 'antd';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { ColumnsType } from 'antd/es/table';

type Supplier = {
  id: number;
  name: string;
  contact: string;
};

const Suppliers: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { showToast } = useToast();

  const { data: supplierData, isLoading: loadingSupplier } = useSWR(
    [`get-supplier`],
    () => getSupplier(),
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
      title: 'Ниименование',
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

  return (
    <>
      <div className="absolute top-6 right-6 z-50">
        <Button
          title={t('routes.create')}
          iconPlus={true}
          handleClick={() => setDrawerOpen(true)}
          classname="shadow-lg"
        />
      </div>
      {loadingSupplier ? (
        <TableSkeleton columnCount={columnsSupplier.length} />
      ) : supplier.length > 0 ? (
        <div className="mt-8">
          <ColumnSelector
            checkedList={checkedList}
            options={options}
            onChange={setCheckedList}
          />
          <Table
            dataSource={supplier}
            columns={visibleColumns}
            pagination={false}
          />
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center">
          <NoDataUI title={t('warehouse.noSupply')} description={''}>
            <img
              src={InventoryEmpty}
              className="mx-auto"
              loading="lazy"
              alt="Suppliers"
            />
          </NoDataUI>
        </div>
      )}
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
            {...register('name', { required: 'Name is required' })}
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
            {...register('contact', { required: 'Contact is required' })}
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
