import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import useFormHook from '@/hooks/useFormHook';
import { useCreateOrganizationContext } from '../context';
import type { DetailsFormData, DetailsFormFieldType } from '../types';

const ORGANIZATION_TYPE_OPTIONS = [
  { value: 'LegalEntity', name: 'Юридическое лицо' },
  { value: 'IndividualEntrepreneur', name: 'ИП' },
];

const StepDetails: React.FC = () => {
  const { t } = useTranslation();
  const {
    formDefaultValues,
    submitOrganization,
    isMutatingPrecreate,
    existingOrganization,
    showToast,
    isVerificateStatus,
    canCreateOrganization
  } = useCreateOrganizationContext();

  const defaultValues: DetailsFormData = {
    fullName: '',
    organizationType: '',
    addressRegistration: '',
  };

  const [formData, setFormData] = useState<DetailsFormData>(
    formDefaultValues ?? defaultValues
  );

  const { register, handleSubmit, errors, setValue } = useFormHook(formData);

  useEffect(() => {
    if (formDefaultValues) {
      setFormData(formDefaultValues);
    }
  }, [formDefaultValues]);

  const handleInputChange = (field: DetailsFormFieldType, value: string) => {
    setFormData((prev: DetailsFormData) => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const onSubmit = async () => {
    try {
      await submitOrganization(formData);
      showToast(t('createOrganization.toast.organizationCreated'), 'success');
    } catch {
      showToast(t('createOrganization.toast.errorOrganization'), 'error');
    }
  };

  const disabled = !!existingOrganization;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {!isVerificateStatus && !canCreateOrganization && existingOrganization?.organizationStatus !== 'BLOCKED' && (
        <p className="mb-4 text-sm text-[#F97316]">
          {t('createOrganization.organizationApprovedRelogin')}
        </p>
      )}
      {existingOrganization?.organizationStatus === "BLOCKED" && <p className="mb-4 text-sm text-[#F97316]">
        {t('createOrganization.organizationBlocked')}
      </p>}
      <div className="mb-6">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#BFFA00] mb-2">
          {t('createOrganization.stepLabel1')}
        </span>
        <h1 className="text-lg sm:text-xl font-bold text-white mb-2">
          {t('createOrganization.step1')}
        </h1>
        <p className="text-[#737373] text-sm leading-relaxed">
          {t('createOrganization.cardHeading')}
        </p>
      </div>
      <form
        className={`space-y-5 [&_input]:max-w-[250px] [&_.ant-select]:max-w-[250px] ${disabled ? '[&_input:disabled]:!text-white [&_.ant-select-disabled_.ant-select-selection-item]:!text-white' : ''}`}
        onSubmit={handleSubmit(onSubmit)}
      >
        <DropdownInput
          title={t('register.specify')}
          options={ORGANIZATION_TYPE_OPTIONS}
          classname="!w-[250px]"
          {...register('organizationType', {
            required: 'Organization type is required',
          })}
          value={formData.organizationType}
          onChange={value => handleInputChange('organizationType', value)}
          error={!!errors.organizationType}
          helperText={errors.organizationType?.message}
          isDisabled={disabled}
        />
        <Input
          type="text"
          title={t('register.name')}
          value={formData.fullName}
          changeValue={e => handleInputChange('fullName', e.target.value)}
          error={!!errors.fullName}
          disabled={disabled}
          {...register('fullName', { required: 'Full name is required' })}
          helperText={errors.fullName?.message || ''}
        />
        <Input
          type="text"
          title={t('register.car')}
          value={formData.addressRegistration}
          changeValue={e =>
            handleInputChange('addressRegistration', e.target.value)
          }
          error={!!errors.addressRegistration}
          disabled={disabled}
          {...register('addressRegistration', {
            required: 'Address is required',
          })}
          helperText={errors.addressRegistration?.message}
        />
        <div className="pt-2">
          <Button
            type="basic"
            title={t('createOrganization.createSubscriptionRequest')}
            form={true}
            classname=" !bg-[#2563eb] hover:!bg-[#1d4ed8] !rounded-xl !py-4 font-semibold max:w-[80px]"
            isLoading={isMutatingPrecreate}
            disabled={disabled}
          />
        </div>
      </form>
    </div>
  );
};

export default StepDetails;
