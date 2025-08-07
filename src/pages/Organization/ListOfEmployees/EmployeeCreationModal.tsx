import Button from '@/components/ui/Button/Button';
import DateInput from '@/components/ui/Input/DateInput';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import Input from '@/components/ui/Input/Input';
import Modal from '@/components/ui/Modal/Modal';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Close from '@icons/close.svg?react';
import { useToast } from '@/components/context/useContext';
import {
  addRole,
  getOrganization,
  getRoles,
  RoleRequestBody,
} from '@/services/api/organization';
import dayjs from 'dayjs';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import useSWR from 'swr';

type EmployeeCreationModalProps = {
  open: boolean;
  onClose: () => void;
};

const EmployeeCreationModal: React.FC<EmployeeCreationModalProps> = ({
  open,
  onClose
}) => {
  const { t } = useTranslation();

  const defaultValues: RoleRequestBody = {
    name: '',
    surname: '',
    middlename: '',
    birthday: dayjs().toDate(),
    phone: '',
    email: '',
    organizationId: 0,
    roleId: 0,
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
        organizationId: formData.organizationId,
        roleId: formData.roleId,
        position: formData.position,
      })
  );

  type FieldType =
    | 'name'
    | 'surname'
    | 'middlename'
    | 'birthday'
    | 'phone'
    | 'email'
    | 'organizationId'
    | 'roleId'
    | 'position';

  const handleInputChange = (field: FieldType, value: string) => {
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

  const organizations: { name: string; value: number }[] =
    organizationData?.map(item => ({ name: item.name, value: item.id })) || [];

  const roles: { name: string; value: number }[] =
    rolesData?.map(item => ({
      name: item.name,
      value: item.id,
      render: (
        <div>
          <div>{item.name}</div>
          <div className="text-text02">
            Lorem ipsum dolor, sit amet consectetur
          </div>
        </div>
      ),
    })) || [];

  return (
    <div>
      <Modal isOpen={open} classname="sm:w-[552px]">
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text01">
            {t('roles.create')}
          </h2>
          <Close
            onClick={() => {
              onClose();
            }}
            className="cursor-pointer text-text01"
          />
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5 flex">
            <span className="font-semibold text-sm text-text01">
              {t('routine.fields')}
            </span>
            <span className="text-errorFill">*</span>
            <span className="font-semibold text-sm text-text01">
              {t('routine.are')}
            </span>
          </div>
          <Input
            type="text"
            title={t('roles.name')}
            classname="w-80 sm:w-96"
            value={formData.name}
            changeValue={e => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            {...register('name', {
              required: 'Name is required',
            })}
            helperText={errors.name?.message || ''}
          />
          <Input
            type="text"
            title={t('profile.surname')}
            classname="w-80 sm:w-96"
            value={formData.surname}
            changeValue={e => handleInputChange('surname', e.target.value)}
            {...register('surname')}
          />
          <Input
            type="text"
            title={t('profile.middlename')}
            classname="w-80 sm:w-96"
            value={formData.middlename}
            changeValue={e => handleInputChange('middlename', e.target.value)}
            {...register('middlename')}
          />
          <DateInput
            title={`${t('register.date')}*`}
            classname="w-40"
            value={formData.birthday ? dayjs(formData.birthday) : null}
            changeValue={date =>
              handleInputChange(
                'birthday',
                date ? date.format('YYYY-MM-DD') : ''
              )
            }
            error={!!errors.birthday}
            {...register('birthday', {
              required: 'Birthday is required',
            })}
            helperText={errors.birthday?.message || ''}
          />
          <Input
            type="text"
            title={`${t('register.phone')}*`}
            classname="w-80 sm:w-96"
            value={formData.phone}
            changeValue={e => handleInputChange('phone', e.target.value)}
            error={!!errors.phone}
            {...register('phone', {
              required: 'Phone is required',
              pattern: {
                value: /^\+79\d{9}$/,
                message:
                  'Phone number must start with +79 and be 11 digits long',
              },
            })}
            helperText={errors.phone?.message || ''}
          />
          <Input
            type="text"
            title={'Email*'}
            classname="w-80 sm:w-96"
            value={formData.email}
            changeValue={e => handleInputChange('email', e.target.value)}
            error={!!errors.email}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format',
              },
            })}
            helperText={errors.email?.message || ''}
          />
          <DropdownInput
            title={`${t('warehouse.organization')}*`}
            label={t('warehouse.notSel')}
            options={organizations}
            classname="w-80 sm:w-96"
            {...register('organizationId', {
              required: 'Organization Id is required',
              validate: value => value !== 0 || 'Category ID is required',
            })}
            value={formData.organizationId}
            onChange={value => handleInputChange('organizationId', value)}
            error={!!errors.organizationId}
            helperText={errors.organizationId?.message}
          />
          <DropdownInput
            title={`${t('roles.rol')}*`}
            label={t('warehouse.notSel')}
            options={roles}
            classname="w-80 sm:w-96"
            {...register('roleId', {
              required: 'Role Id is required',
              validate: value => value !== 0 || 'Category ID is required',
            })}
            value={formData.roleId}
            onChange={value => handleInputChange('roleId', value)}
            error={!!errors.roleId}
            helperText={errors.roleId?.message}
          />
          <DropdownInput
            title={`${t('roles.position')}*`}
            options={[{ name: 'Оператор', value: 'Operator' }]}
            classname="w-80 sm:w-96"
            error={!!errors.position}
            {...register('position', {
              required: 'Position is required',
            })}
            value={formData.position}
            onChange={value => handleInputChange('position', value)}
            helperText={errors.position?.message || ''}
          />
          <div className="flex space-x-4">
            <Button
              title={t('organizations.cancel')}
              type="outline"
              handleClick={() => {
                resetForm();
              }}
            />
            <Button
              title={t('roles.create')}
              form={true}
              isLoading={loadingRole}
              handleClick={() => {}}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeCreationModal;
