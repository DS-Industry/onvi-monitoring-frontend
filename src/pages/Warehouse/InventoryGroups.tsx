import NoDataUI from '@/components/ui/NoDataUI';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InventoryEmpty from '@/assets/NoInventory.png';
import Input from '@/components/ui/Input/Input';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import MultilineInput from '@/components/ui/Input/MultilineInput';
import Button from '@/components/ui/Button/Button';
import useSWR, { mutate } from 'swr';
import {
  createCategory,
  getCategory,
  updateCategory,
} from '@/services/api/warehouse';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/components/context/useContext';
import TableSkeleton from '@/components/ui/Table/TableSkeleton';
import Table, { ColumnsType } from 'antd/es/table';
import { usePermissions } from '@/hooks/useAuthStore';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Can } from '@/permissions/Can';
import {
  Drawer,
  Tooltip,
  Input as AntInput,
  Button as AntButton,
  Popconfirm,
} from 'antd';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import { PlusOutlined } from '@ant-design/icons';
import hasPermission from '@/permissions/hasPermission';

type TreeData = {
  id: number;
  name: string;
  description?: string;
  children?: TreeData[];
  isExpanded?: boolean;
  [key: string]: unknown;
};

type CATEGORY = {
  name: string;
  description?: string;
  ownerCategoryId?: number;
};

const buildTree = (data: unknown[]): TreeData[] => {
  const map: Record<number, TreeData> = {};
  const roots: TreeData[] = [];

  data.forEach(item => {
    const typedItem = item as TreeData;
    map[typedItem.id] = { ...typedItem, children: [] };
  });

  data.forEach(item => {
    const typedItem = item as TreeData;
    if (
      typedItem.ownerCategoryId === null ||
      typeof typedItem.ownerCategoryId !== 'number'
    ) {
      roots.push(map[typedItem.id]);
    } else if (
      typeof typedItem.ownerCategoryId === 'number' &&
      map[typedItem.ownerCategoryId]
    ) {
      map[typedItem.ownerCategoryId]?.children?.push(map[typedItem.id]);
    }
  });

  return roots;
};

const InventoryGroups: React.FC = () => {
  const { t } = useTranslation();
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<{
    name: string;
    description: string;
  }>({ name: '', description: '' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { showToast } = useToast();

  const { data: categoryData, isLoading: loadingCategory } = useSWR(
    [`get-category`],
    () => getCategory(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const categories: { name: string; value: number }[] =
    categoryData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const category = categoryData?.map(cat => cat.props) || [];

  const defaultValues: CATEGORY = {
    name: '',
    description: '',
    ownerCategoryId: undefined,
  };

  const [formData, setFormData] = useState(defaultValues);
  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createCat, isMutating } = useSWRMutation(
    ['create-inventory'],
    async () =>
      createCategory({
        name: formData.name,
        description: formData.description,
        ownerCategoryId: formData.ownerCategoryId,
      })
  );

  const { trigger: updateCat } = useSWRMutation(
    ['update-inventory'],
    async (
      _,
      { arg }: { arg: { id: number; name: string; description: string } }
    ) =>
      updateCategory(
        {
          name: arg.name,
          description: arg.description,
        },
        arg.id
      )
  );

  type FieldType = 'name' | 'description' | 'ownerCategoryId';

  const handleInputChange = (field: FieldType, value: string) => {
    const numericFields = ['ownerCategoryId'];
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
      await createCat();
      mutate([`get-category`]);
      resetForm();
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const startEditing = (record: TreeData) => {
    setEditingKey(record.id);
    setEditingData({
      name: record.name,
      description: record.description || '',
    });
  };

  const cancelEditing = () => {
    setEditingKey(null);
  };

  const saveEditing = async (id: number) => {
    try {
      await updateCat({ id, ...editingData });
      mutate([`get-category`]);
      setEditingKey(null);
    } catch (error) {
      console.error('Update failed:', error);
      showToast(t('errors.updateFailed'), 'error');
    }
  };

  const treeData = buildTree(category);

  const userPermissions = usePermissions();

  const generateColumns = (): ColumnsType<TreeData> => [
    {
      title: '',
      dataIndex: 'isExpanded',
      key: 'isExpanded',
      width: 50,
    },
    {
      title: 'Название группы',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TreeData) => {
        if (editingKey === record.id) {
          return (
            <AntInput
              value={editingData.name}
              onChange={e =>
                setEditingData(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="Название группы"
            />
          );
        }
        return text;
      },
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: TreeData) => {
        if (editingKey === record.id) {
          return (
            <AntInput
              value={editingData.description}
              onChange={e =>
                setEditingData(prev => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Описание"
            />
          );
        }
        return text || '-';
      },
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      render: (_, record) => {
        if (editingKey === record.id) {
          return (
            <span>
              <AntButton
                type="text"
                icon={<CheckOutlined style={{ color: 'green' }} />}
                onClick={() => saveEditing(record.id)}
              />
              <Popconfirm
                title={t('common.discardChanges')}
                onConfirm={cancelEditing}
                okText={t('equipment.yes')}
                cancelText={t('equipment.no')}
              >
                <AntButton
                  type="text"
                  icon={<CloseOutlined style={{ color: 'red' }} />}
                />
              </Popconfirm>
            </span>
          );
        }
        return (
          <Can
            requiredPermissions={[
              { action: 'update', subject: 'Warehouse' },
              { action: 'manage', subject: 'Warehouse' },
            ]}
            userPermissions={userPermissions}
          >
            {allowed =>
              allowed && (
                <Tooltip title={t('routes.edit')}>
                  <AntButton
                    type="text"
                    icon={
                      <EditOutlined className="text-blue-500 hover:text-blue-700" />
                    }
                    onClick={() => startEditing(record)}
                  />
                </Tooltip>
              )
            }
          </Can>
        );
      },
    },
  ];

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'Warehouse' },
    { action: 'update', subject: 'Warehouse' },
  ]);

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.groups')}
          </span>
          <QuestionMarkIcon />
        </div>
        {allowed && (
          <AntButton
            icon={<PlusOutlined />}
            className="btn-primary"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            {t('routes.add')}
          </AntButton>
        )}
      </div>
      {loadingCategory ? (
        <TableSkeleton columnCount={3} />
      ) : treeData.length > 0 ? (
        <div className="mt-8">
          <Table<TreeData>
            columns={generateColumns()}
            dataSource={treeData}
            rowKey={record => record.id}
            pagination={false}
            expandable={{
              childrenColumnName: 'children',
            }}
            scroll={{ x: true }}
          />
        </div>
      ) : (
        <NoDataUI title={t('warehouse.nomenclature')} description={''}>
          <img
            src={InventoryEmpty}
            className="mx-auto"
            loading="lazy"
            alt="Inventory"
          />
        </NoDataUI>
      )}
      <Drawer
        title={t('warehouse.groupCreate')}
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
          <Input
            title={t('profile.name')}
            label={t('warehouse.enter')}
            type={'text'}
            classname="w-80"
            value={formData.name}
            changeValue={e => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            {...register('name', {
              required: 'Name is required',
            })}
            helperText={errors.name?.message || ''}
          />
          <DropdownInput
            title={`${t('warehouse.included')}`}
            options={categories}
            classname="w-64"
            {...register('ownerCategoryId')}
            value={formData.ownerCategoryId}
            onChange={value => handleInputChange('ownerCategoryId', value)}
          />
          <MultilineInput
            title={t('warehouse.desc')}
            label={t('warehouse.about')}
            classname="w-80"
            inputType="secondary"
            value={formData.description}
            changeValue={e => handleInputChange('description', e.target.value)}
          />
          <div className="flex space-x-4">
            <Button
              title={t('warehouse.reset')}
              type="outline"
              handleClick={() => {
                resetForm();
              }}
            />
            <Button
              title={t('routes.create')}
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

export default InventoryGroups;
