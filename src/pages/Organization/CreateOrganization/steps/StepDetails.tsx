import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import useFormHook from '@/hooks/useFormHook';
import { formatPhoneByCountry } from '@/utils/tableUnits';
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
    canCreateOrganization,
  } = useCreateOrganizationContext();

  const [phoneCountryCode, setPhoneCountryCode] = useState('+7');

  const defaultValues: DetailsFormData = {
    fullName: '',
    shortName: '',
    organizationType: '',
    addressRegistration: '',
    additionalAddress: '',
    phone: '',
    email: '',
    inn: '',
    kpp: '',
    ogrn: '',
    bank: '',
    bik: '',
    settlementAccount: '',
    correspondentAccount: '',
    addressBank: '',
    rateVat: '',
    okpo: '',
  };

  const [formData, setFormData] = useState<DetailsFormData>(
    formDefaultValues ?? defaultValues
  );

  const { register, handleSubmit, errors, setValue } = useFormHook(formData);

  useEffect(() => {
    if (formDefaultValues) {
      setFormData(formDefaultValues);

      Object.entries(formDefaultValues).forEach(([key, value]) => {
        setValue(key as DetailsFormFieldType, value);
      });
    }
  }, [formDefaultValues, setValue]);

  const handleInputChange = (field: DetailsFormFieldType, value: string) => {
    setFormData((prev: DetailsFormData) => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    let digits = input.replace(/\D/g, '');

    if (phoneCountryCode === '+7') {
      if (digits.startsWith('8')) digits = digits.slice(1);
      if (digits.startsWith('7')) digits = digits.slice(1);
      digits = digits.slice(0, 10);
      handleInputChange('phone', digits ? `+7${digits}` : '');
      return;
    }

    if (phoneCountryCode === '+91') {
      if (digits.startsWith('91')) digits = digits.slice(2);
      digits = digits.slice(0, 10);
      handleInputChange('phone', digits ? `+91${digits}` : '');
      return;
    }

    if (phoneCountryCode === '+998') {
      if (digits.startsWith('998')) digits = digits.slice(3);
      digits = digits.slice(0, 9);
      handleInputChange('phone', digits ? `+998${digits}` : '');
      return;
    }

    handleInputChange('phone', digits ? `${phoneCountryCode}${digits}` : '');
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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-0">
      {!isVerificateStatus &&
        !canCreateOrganization &&
        existingOrganization?.organizationStatus !== 'BLOCKED' && (
          <p className="mb-4 text-sm text-[#F97316]">
            {t('createOrganization.organizationApprovedRelogin')}
          </p>
        )}
      {existingOrganization?.organizationStatus === 'BLOCKED' && (
        <p className="mb-4 text-sm text-[#F97316]">
          {t('createOrganization.organizationBlocked')}
        </p>
      )}
      <div className="rounded-2xl bg-gradient-to-b from-[#0f0f10] to-[#070708] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.55)] p-4 sm:p-5 lg:p-7">
        <div className="mb-5">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#BFFA00] mb-2">
            {t('createOrganization.stepLabel1')}
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-white mb-2">
            {t('createOrganization.step1')}
          </h1>
          <p className="text-[#a3a3a3] text-sm leading-relaxed">
            {t('createOrganization.cardHeading')}
          </p>
        </div>

        <form
          className={`${disabled ? '[&_input:disabled]:!text-white [&_.ant-select-disabled_.ant-select-selection-item]:!text-white' : ''}`}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-12 gap-x-4 gap-y-4 sm:gap-x-5 sm:gap-y-5 lg:gap-x-6 lg:gap-y-6 [&_input]:max-w-none [&_.ant-select]:max-w-none">
            <div className="col-span-12">
              <p className="text-sm font-semibold text-white/90">
                {t('createOrganization.sections.general')}
              </p>
              <div className="mt-2.5 h-px w-full bg-white/10" />
            </div>

            <div className="col-span-12 md:col-span-4">
              <DropdownInput
                title={t('createOrganization.details.organizationType')}
                options={ORGANIZATION_TYPE_OPTIONS}
                classname="!w-full"
                {...register('organizationType', {
                  required: t('createOrganization.validation.required'),
                })}
                value={formData.organizationType}
                onChange={value => handleInputChange('organizationType', value)}
                error={!!errors.organizationType}
                helperText={
                  errors.organizationType?.message as string | undefined
                }
                isDisabled={disabled}
              />
            </div>

            <div className="col-span-12 md:col-span-8">
              <Input
                type="text"
                title={t('createOrganization.details.fullName')}
                value={formData.fullName}
                changeValue={e => handleInputChange('fullName', e.target.value)}
                error={!!errors.fullName}
                disabled={disabled}
                {...register('fullName', {
                  required: t('createOrganization.validation.required'),
                })}
                helperText={(errors.fullName?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={t('createOrganization.details.shortName')}
                value={formData.shortName}
                changeValue={e => handleInputChange('shortName', e.target.value)}
                error={!!errors.shortName}
                disabled={disabled}
                {...register('shortName', {
                  required: t('createOrganization.validation.required'),
                })}
                helperText={(errors.shortName?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={t('createOrganization.details.addressRegistration')}
                value={formData.addressRegistration}
                changeValue={e =>
                  handleInputChange('addressRegistration', e.target.value)
                }
                error={!!errors.addressRegistration}
                disabled={disabled}
                {...register('addressRegistration', {
                  required: t('createOrganization.validation.required'),
                })}
                helperText={(errors.addressRegistration?.message as string) || ''}
              />
            </div>

            <div className="col-span-12">
              <Input
                type="text"
                title={t('createOrganization.details.additionalAddress')}
                value={formData.additionalAddress}
                changeValue={e =>
                  handleInputChange('additionalAddress', e.target.value)
                }
                error={!!errors.additionalAddress}
                disabled={disabled}
                {...register('additionalAddress')}
                helperText={(errors.additionalAddress?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 mt-1">
              <p className="text-sm font-semibold text-white/90">
                {t('createOrganization.sections.contacts')}
              </p>
              <div className="mt-2.5 h-px w-full bg-white/10" />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={t('createOrganization.details.phone')}
                isPhone={true}
                countryCode={phoneCountryCode}
                onCountryChange={code => {
                  setPhoneCountryCode(code);
                  handleInputChange('phone', '');
                }}
                value={formatPhoneByCountry(formData.phone, phoneCountryCode)}
                changeValue={handlePhoneChange}
                error={!!errors.phone}
                disabled={disabled}
                {...register('phone', {
                  required: t('createOrganization.validation.required'),
                  validate: value => {
                    const digits = (value ?? '').toString().replace(/\D/g, '');
                    if (phoneCountryCode === '+7') {
                      return (
                        (digits.startsWith('7') && digits.length === 11) ||
                        (t('validation.phoneValidFormat') as string)
                      );
                    }
                    if (phoneCountryCode === '+91') {
                      return (
                        (digits.startsWith('91') && digits.length === 12) ||
                        (t('validation.phoneValidFormat') as string)
                      );
                    }
                    if (phoneCountryCode === '+998') {
                      return (
                        (digits.startsWith('998') && digits.length === 12) ||
                        (t('validation.phoneValidFormat') as string)
                      );
                    }
                    return true;
                  },
                })}
                helperText={(errors.phone?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={t('createOrganization.details.email')}
                value={formData.email}
                changeValue={e => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                disabled={disabled}
                {...register('email', {
                  required: t('createOrganization.validation.required'),
                })}
                helperText={(errors.email?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 mt-1">
              <p className="text-sm font-semibold text-white/90">
                {t('createOrganization.sections.requisites')}
              </p>
              <div className="mt-2.5 h-px w-full bg-white/10" />
            </div>

            <div className="col-span-12 md:col-span-4">
              <Input
                type="text"
                title={t('createOrganization.details.inn')}
                value={formData.inn}
                changeValue={e => handleInputChange('inn', e.target.value)}
                error={!!errors.inn}
                disabled={disabled}
                {...register('inn', {
                  required: t('createOrganization.validation.required'),
                })}
                helperText={(errors.inn?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <Input
                type="text"
                title={t('createOrganization.details.kpp')}
                value={formData.kpp}
                changeValue={e => handleInputChange('kpp', e.target.value)}
                error={!!errors.kpp}
                disabled={disabled}
                {...register('kpp', {
                  validate: v => {
                    if (formData.organizationType !== 'LegalEntity') return true;
                    return v?.trim()
                      ? true
                      : (t('createOrganization.validation.required') as string);
                  },
                })}
                helperText={(errors.kpp?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <Input
                type="text"
                title={t('createOrganization.details.ogrn')}
                value={formData.ogrn}
                changeValue={e => handleInputChange('ogrn', e.target.value)}
                error={!!errors.ogrn}
                disabled={disabled}
                {...register('ogrn', {
                  validate: v => {
                    if (formData.organizationType !== 'LegalEntity') return true;
                    return v?.trim()
                      ? true
                      : (t('createOrganization.validation.required') as string);
                  },
                })}
                helperText={(errors.ogrn?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <Input
                type="text"
                title={t('createOrganization.details.okpo')}
                value={formData.okpo}
                changeValue={e => handleInputChange('okpo', e.target.value)}
                error={!!errors.okpo}
                disabled={disabled}
                {...register('okpo')}
                helperText={(errors.okpo?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <Input
                type="text"
                title={t('createOrganization.details.rateVat')}
                value={formData.rateVat}
                changeValue={e => handleInputChange('rateVat', e.target.value)}
                error={!!errors.rateVat}
                disabled={disabled}
                {...register('rateVat')}
                helperText={(errors.rateVat?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 mt-1">
              <p className="text-sm font-semibold text-white/90">
                {t('createOrganization.sections.bank')}
              </p>
              <div className="mt-2.5 h-px w-full bg-white/10" />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={t('createOrganization.details.bank')}
                value={formData.bank}
                changeValue={e => handleInputChange('bank', e.target.value)}
                error={!!errors.bank}
                disabled={disabled}
                {...register('bank')}
                helperText={(errors.bank?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={t('createOrganization.details.bik')}
                value={formData.bik}
                changeValue={e => handleInputChange('bik', e.target.value)}
                error={!!errors.bik}
                disabled={disabled}
                {...register('bik')}
                helperText={(errors.bik?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={t('createOrganization.details.settlementAccount')}
                value={formData.settlementAccount}
                changeValue={e =>
                  handleInputChange('settlementAccount', e.target.value)
                }
                error={!!errors.settlementAccount}
                disabled={disabled}
                {...register('settlementAccount')}
                helperText={(errors.settlementAccount?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={t('createOrganization.details.correspondentAccount')}
                value={formData.correspondentAccount}
                changeValue={e =>
                  handleInputChange('correspondentAccount', e.target.value)
                }
                error={!!errors.correspondentAccount}
                disabled={disabled}
                {...register('correspondentAccount')}
                helperText={
                  (errors.correspondentAccount?.message as string) || ''
                }
              />
            </div>

            <div className="col-span-12">
              <Input
                type="text"
                title={t('createOrganization.details.addressBank')}
                value={formData.addressBank}
                changeValue={e => handleInputChange('addressBank', e.target.value)}
                error={!!errors.addressBank}
                disabled={disabled}
                {...register('addressBank')}
                helperText={(errors.addressBank?.message as string) || ''}
              />
            </div>
          </div>

          <div className="pt-6 sm:pt-7 flex justify-end">
            <Button
              type="basic"
              title={t('createOrganization.createSubscriptionRequest')}
              form={true}
              classname="!bg-[#2563eb] hover:!bg-[#1d4ed8] !rounded-xl !py-4 font-semibold !px-7 shadow-[0_10px_30px_rgba(37,99,235,0.35)]"
              isLoading={isMutatingPrecreate}
              disabled={disabled}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepDetails;
