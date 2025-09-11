import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/context/useContext';
import {
  addRole,
  getOrganization,
  getRoles,
} from '@/services/api/organization';
import dayjs from 'dayjs';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import useSWR, { mutate } from 'swr';
import { Form, Input, Modal, Select, DatePicker } from 'antd';
import { useUser } from '@/hooks/useUserStore';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/utils/constants';

type EmployeeCreationModalProps = {
  open: boolean;
  onClose: () => void;
};

const EmployeeCreationModal: React.FC<EmployeeCreationModalProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const user = useUser();
  const [searchParams] = useSearchParams();
  const roleId = Number(searchParams.get('roleId')) || undefined;
  const status = searchParams.get('status') || undefined;
  const name = searchParams.get('search') || undefined;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const defaultValues = {
    name: '',
    surname: '',
    middlename: '',
    birthday: dayjs().toDate(),
    phone: '',
    email: '',
    organizationId: user.organizationId || '',
    roleId: '',
    position: '',
  };

  const [formData, setFormData] = useState(defaultValues);
  const { showToast } = useToast();

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: addUserRole, isMutating: loadingRole } = useSWRMutation(
    ['add-role'],
    async () =>
      addRole({
        name: formData.name,
        middlename: formData.middlename,
        surname: formData.surname,
        birthday: formData.birthday,
        phone: formData.phone,
        email: formData.email,
        organizationId: Number(formData.organizationId),
        roleId: Number(formData.roleId),
        position: formData.position,
      })
  );

  type FieldType = keyof typeof defaultValues;

  const handleInputChange = (field: FieldType, value: string | number) => {
    const numericFields = ['organizationId', 'categoryId', 'supplierId'];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
    onClose();
  };

  const onSubmit = async () => {
    try {
      const result = await addUserRole();
      if (result) {
        showToast(t('organizations.token'), 'success');
        mutate([
          'get-worker',
          user.organizationId,
          currentPage,
          pageSize,
          roleId,
          status,
          name,
        ]);
        resetForm();
      }
    } catch (error) {
      console.error('Register error:', error);
      showToast(t('errors.other.registerError'), 'error');
    }
  };

  const { data: rolesData } = useSWR([`get-role`], () => getRoles(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const { data: organizationData } = useSWR([`get-org`], () =>
    getOrganization({})
  );

  return (
    <Modal
      open={open}
      closable={true}
      onCancel={resetForm}
      onOk={handleSubmit(onSubmit)}
      okButtonProps={{
        loading: loadingRole,
      }}
      okText={t('organizations.save')}
      cancelText={t('organizations.cancel')}
      className="sm:w-[552px] max-h-[90vh] overflow-auto"
    >
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text01">
          {t('roles.create')}
        </h2>
      </div>
      <form className="space-y-4">
        <div className="mb-5 flex">
          <span className="font-semibold text-sm text-text01">
            {t('routine.fields')}
          </span>
          <span className="text-errorFill">*</span>
          <span className="font-semibold text-sm text-text01">
            {t('routine.are')}
          </span>
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">{t('roles.name')}</div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            help={errors.name?.message}
            validateStatus={errors.name ? 'error' : undefined}
          >
            <Input
              placeholder={t('profile.namePlaceholder')}
              className="w-80 sm:max-w-96"
              {...register('name', {
                required: t('validation.nameRequired'),
              })}
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              status={errors.name ? 'error' : ''}
            />
          </Form.Item>
        </div>
        <div>
          <div className="text-text02 text-sm">{t('profile.surname')}</div>
          <Input
            placeholder={t('profile.surnamePlaceholder')}
            className="w-80 sm:max-w-96"
            {...register('surname')}
            value={formData.surname}
            onChange={e => handleInputChange('surname', e.target.value)}
          />
        </div>
        <div>
          <div className="text-text02 text-sm">{t('profile.middlename')}</div>
          <Input
            placeholder={t('profile.middlenamePlaceholder')}
            className="w-80 sm:w-96"
            {...register('middlename')}
            value={formData.middlename}
            onChange={e => handleInputChange('middlename', e.target.value)}
          />
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">{t('register.date')}</div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            help={errors.birthday?.message}
            validateStatus={errors.birthday ? 'error' : undefined}
          >
            <DatePicker
              className="w-40"
              {...register('birthday', {
                required: t('validation.birthdayRequired'),
              })}
              value={formData.birthday ? dayjs(formData.birthday) : undefined}
              onChange={date =>
                handleInputChange(
                  'birthday',
                  date ? dayjs(date).format('YYYY-MM-DD') : ''
                )
              }
            />
          </Form.Item>
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">{t('register.phone')}</div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            help={errors.phone?.message}
            validateStatus={errors.phone ? 'error' : undefined}
          >
            <Input
              placeholder={t('profile.telephonePlaceholder')}
              className="w-80 sm:w-96"
              {...register('phone', {
                required: t('validation.phoneRequired'),
                pattern: {
                  value: /^\+79\d{9}$/,
                  message: t('validation.phoneValidFormat'),
                },
              })}
              value={formData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              status={errors.phone ? 'error' : ''}
            />
          </Form.Item>
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">Email</div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            help={errors.email?.message}
            validateStatus={errors.email ? 'error' : undefined}
          >
            <Input
              placeholder={t('profile.emailPlaceholder')}
              className="w-80 sm:w-96"
              {...register('email', {
                required: t('validation.emailRequired'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format',
                },
              })}
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              status={errors.email ? 'error' : ''}
            />
          </Form.Item>
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">
              {t('warehouse.organization')}
            </div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            help={errors.organizationId?.message}
            validateStatus={errors.organizationId ? 'error' : undefined}
          >
            <Select
              placeholder={t('warehouse.notSel')}
              options={organizationData?.map(item => ({
                value: item.id,
                label: item.name,
              }))}
              className="w-80 sm:max-w-96"
              {...register('organizationId', {
                required: t('validation.organizationRequired'),
              })}
              value={formData.organizationId}
              onChange={value => handleInputChange('organizationId', value)}
              status={errors.organizationId ? 'error' : ''}
            />
          </Form.Item>
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">{t('roles.rol')}</div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            help={errors.roleId?.message}
            validateStatus={errors.roleId ? 'error' : undefined}
          >
            <Select
              placeholder={t('warehouse.notSel')}
              options={rolesData?.map(item => ({
                value: item.id,
                label: item.name,
              }))}
              className="w-80 sm:max-w-96"
              {...register('roleId', {
                required: t('validation.roleRequired'),
              })}
              value={formData.roleId}
              onChange={value => handleInputChange('roleId', value)}
              status={errors.roleId ? 'error' : ''}
            />
          </Form.Item>
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">{t('roles.position')}</div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            help={errors.position?.message}
            validateStatus={errors.position ? 'error' : undefined}
          >
            <Select
              options={[{ label: 'Оператор', value: 'Operator' }]}
              className="w-80 sm:max-w-96"
              {...register('position', {
                required: t('validation.positionRequired'),
              })}
              value={formData.position}
              onChange={value => handleInputChange('position', value)}
              status={errors.position ? 'error' : ''}
            />
          </Form.Item>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeCreationModal;
