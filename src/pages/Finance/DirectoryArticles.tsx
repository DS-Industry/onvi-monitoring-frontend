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
import { Drawer, Button, Table } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getStatusTagRender } from '@/utils/tableUnits';

type PaperTypeRecord = ManagerPaperTypeResponse['props'] & {
  typeName: string;
};

const DirectoryArticles: React.FC = () => {
  const { t } = useTranslation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPaperId, setEditPaperId] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: paperTypeData, isLoading: loadingPaperType } = useSWR(
    [`get-manager-paper-type`],
    () => getAllManagerPaperTypes(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );
  const { showToast } = useToast();
  const getStatusTag = getStatusTagRender(t);

  const paperTypes =
    paperTypeData?.map(type => ({
      ...type.props,
      typeName: t(`finance.${type.props.type}`),
    })) || [];

  const columns: ColumnsType<PaperTypeRecord> = [
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
      title: 'Тип статьи',
      dataIndex: 'typeName',
      key: 'typeName',
      render: getStatusTag,
    },
    {
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined className="text-blue-500 hover:text-blue-700" />}
          onClick={() => handleUpdate(record.id)}
          style={{ height: '24px' }}
        />
      ),
    },
  ];

  const defaultValues = {
    name: '',
    type: '',
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createPap, isMutating } = useSWRMutation(
    ['create-paper'],
    async () =>
      createManagerPaperType({
        name: formData.name,
        type: formData.type as ManagerPaperTypeClass,
      })
  );

  const { trigger: updatePaperType, isMutating: updatingPaperType } =
    useSWRMutation(['update-paper'], async () =>
      updateManagerPaperType({
        id: editPaperId,
        name: formData.name,
        type: formData.type as ManagerPaperTypeClass,
      })
    );

  type FieldType = 'name' | 'type';

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
          mutate([`get-manager-paper-type`]);
          resetForm();
        } else {
          throw new Error('Invalid response from API');
        }
      } else {
        const result = await createPap();
        if (result) {
          mutate([`get-manager-paper-type`]);
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
        <Button
          icon={<PlusOutlined />}
          className="btn-primary"
          onClick={() => setDrawerOpen(true)}
        >
          <span className='hidden sm:flex'>{t('routes.add')}</span>
        </Button>
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
          />
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
