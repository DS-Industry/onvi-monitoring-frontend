import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '@/components/ui/Input/Input';
import useFormHook from '@/hooks/useFormHook';
import { useToast } from '@/components/context/useContext';
import useSWRMutation from 'swr/mutation';
import useSWR, { mutate } from 'swr';
import {
  createManagerPaperType,
  getAllManagerPaperTypes,
  ManagerPaperTypeClass,
  ManagerPaperTypeResponse,
  updateManagerPaperType,
} from '@/services/api/finance';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import { Drawer, Button, Switch, Table } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getStatusTagRender } from '@/utils/tableUnits';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import { useUser } from '@/hooks/useUserStore';
import { isSystemPaperType } from './paperGroupType';
import {
  getAllPaperGroupOptions,
  getPaperGroupLabel,
  ManagerPaperGroup,
} from '@/utils/constants';

type PaperTypeRecord = ManagerPaperTypeResponse['props'] & {
  typeName: string;
};

const DirectoryArticles: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPaperId, setEditPaperId] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const paperTypeKey = user.organizationId
    ? ['get-paper-type', user.organizationId]
    : null;
  const { data: paperTypeData, isLoading: loadingPaperType } = useSWR(
    paperTypeKey,
    () =>
      getAllManagerPaperTypes({
        organizationId: user.organizationId!,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );
  const { showToast } = useToast();
  const getStatusTag = getStatusTagRender(t);
  const userPermissions = usePermissions();

  const allowed = hasPermission(
    [
      { action: 'manage', subject: 'ManagerPaper' },
      { action: 'update', subject: 'ManagerPaper' }
    ],
    userPermissions
  );

  const paperTypes =
    paperTypeData?.map(type => ({
      ...type.props,
      typeName: t(`finance.${type.props.type}`),
    })) || [];
  const editingType = paperTypes.find(paper => paper.id === editPaperId);
  const systemTypeLocked =
    isEditMode &&
    !!editingType &&
    isSystemPaperType(editingType.name, editingType.type);
  const groupOptions = [
    { name: '-', value: '' },
    ...getAllPaperGroupOptions(key => t(key)).map(option => ({
      name: option.name,
      value: option.value,
    })),
  ];

  const columns: ColumnsType<PaperTypeRecord> = [
    {
      title: t('table.columns.id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('equipment.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('finance.articleType'),
      dataIndex: 'typeName',
      key: 'typeName',
      render: getStatusTag,
    },
    {
      title: t('finance.group'),
      dataIndex: 'group',
      key: 'group',
      render: (value: ManagerPaperGroup | null) =>
        value ? getPaperGroupLabel(value, key => t(key)) : '-',
    },
    {
      title: t('finance.paperTypeVisible'),
      dataIndex: 'isVisible',
      key: 'isVisible',
      render: (value: boolean) => (value ? t('common.yes') : t('common.no')),
    },
    {
      key: 'actions',
      render: (_, record) =>
        allowed && (
          <Button
            type="text"
            icon={
              <EditOutlined className="text-blue-500 hover:text-blue-700" />
            }
            onClick={() => handleUpdate(record.id)}
            style={{ height: '24px' }}
          />
        ),
    },
  ];

  const defaultValues = {
    name: '',
    type: '',
    group: '' as ManagerPaperGroup | '',
    isVisible: false,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createPap, isMutating } = useSWRMutation(
    ['create-paper'],
    async () =>
      createManagerPaperType({
        organizationId: user.organizationId!,
        name: formData.name,
        type: formData.type as ManagerPaperTypeClass,
        group: formData.group || null,
      })
  );

  const { trigger: updatePaperType, isMutating: updatingPaperType } =
    useSWRMutation(['update-paper'], async () =>
      updateManagerPaperType({
        managerPaperTypeId: editPaperId,
        name: formData.name,
        type: formData.type as ManagerPaperTypeClass,
        group: formData.group || null,
        isVisible: formData.isVisible,
      })
    );

  type FieldType = 'name' | 'type' | 'group';

  const handleInputChange = (field: FieldType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const handleUpdate = async (id: number) => {
    setEditPaperId(id);
    setIsEditMode(true);
    setDrawerOpen(true);

    const paperToEdit = paperTypes.find(paper => paper.id === id);

    if (paperToEdit) {
      setFormData({
        name: paperToEdit.name,
        type: paperToEdit.type as ManagerPaperTypeClass,
        group: (paperToEdit.group as ManagerPaperGroup) || '',
        isVisible: paperToEdit.isVisible,
      });
    }
  };

  const resetForm = () => {
    setFormData(defaultValues);
    setIsEditMode(false);
    reset();
    setEditPaperId(0);
    setDrawerOpen(false);
  };

  const onSubmit = async () => {
    try {
      if (editPaperId) {
        const result = await updatePaperType();
        if (result) {
          mutate(paperTypeKey);
          resetForm();
        } else {
          throw new Error('Invalid response from API');
        }
      } else {
        const result = await createPap();
        if (result) {
          mutate(paperTypeKey);
          resetForm();
        } else {
          throw new Error('Invalid response from API');
        }
      }
    } catch (error) {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      console.error('Error during form submission: ', error);
    }
  };

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.direct')}
          </span>
        </div>
        {allowed && (
          <Button
            icon={<PlusOutlined />}
            className="btn-primary"
            onClick={() => {
              if (!user.organizationId) {
                return;
              }
              setDrawerOpen(true);
            }}
          >
            <span className="hidden sm:flex">{t('routes.add')}</span>
          </Button>
        )}
      </div>

      <div className="mt-8">
        <Table
          columns={columns}
          dataSource={paperTypes}
          loading={loadingPaperType}
          rowKey="id"
        />
      </div>

      <Drawer
        title={t('finance.articleType')}
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
            {...register('name', {
              required: !isEditMode && 'Name is required',
            })}
            helperText={errors.name?.message || ''}
            disabled={systemTypeLocked}
          />
          <DropdownInput
            title={`${t('finance.article')}*`}
            label={t('finance.articleType')}
            classname="w-80"
            options={Object.values(ManagerPaperTypeClass).map(type => ({
              name: t(`finance.${type}`),
              value: type as ManagerPaperTypeClass,
            }))}
            {...register('type', {
              required: !isEditMode && 'Type is required',
            })}
            value={formData.type}
            onChange={value => handleInputChange('type', value)}
            error={!!errors.type}
            helperText={errors.type?.message || ''}
            isDisabled={systemTypeLocked}
          />
          <DropdownInput
            title={t('finance.group')}
            label="-"
            classname="w-80"
            options={groupOptions}
            value={formData.group}
            onChange={value => handleInputChange('group', value)}
            isDisabled={systemTypeLocked}
          />
          {isEditMode && (
            <div>
              <div className="text-sm text-text02 mb-1">
                {t('finance.paperTypeVisible')}
              </div>
              <Switch
                checked={formData.isVisible}
                onChange={checked =>
                  setFormData(prev => ({ ...prev, isVisible: checked }))
                }
              />
            </div>
          )}
          <div className="flex space-x-4">
            <Button
              onClick={() => {
                setDrawerOpen(false);
                resetForm();
              }}
            >
              {t('organizations.cancel')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isEditMode ? updatingPaperType : isMutating}
            >
              {t('organizations.save')}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default DirectoryArticles;
