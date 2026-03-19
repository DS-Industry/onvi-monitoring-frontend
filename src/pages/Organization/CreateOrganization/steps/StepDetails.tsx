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

  const phoneCountryCode = '+7';

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

    if (digits.startsWith('8')) digits = digits.slice(1);
    if (digits.startsWith('7')) digits = digits.slice(1);
    digits = digits.slice(0, 10);
    handleInputChange('phone', digits ? `+7${digits}` : '');
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

  const requiredMessage = t('createOrganization.validation.required');
  const requiredTitle = (key: string) => `${t(key)}*`;
  const vatOptions = [
    { value: 'WithoutVAT', name: t('organizations.withoutVat') },
    { value: 'Vat10', name: '10%' },
    { value: 'Vat18', name: '18%' },
    { value: 'Vat20', name: '20%' },
  ];

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
      {existingOrganization?.organizationStatus === "PENDING" || existingOrganization?.organizationStatus === "VERIFICATE" && (
        <p className="mb-4 text-sm text-[#F97316]">
          {t('createOrganization.organizationPending')}
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
                title={requiredTitle('createOrganization.details.organizationType')}
                options={ORGANIZATION_TYPE_OPTIONS}
                classname="!w-full"
                {...register('organizationType', {
                  required: requiredMessage,
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
                title={requiredTitle('createOrganization.details.fullName')}
                value={formData.fullName}
                changeValue={e => handleInputChange('fullName', e.target.value)}
                error={!!errors.fullName}
                disabled={disabled}
                {...register('fullName', {
                  required: requiredMessage,
                })}
                helperText={(errors.fullName?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={requiredTitle('createOrganization.details.shortName')}
                value={formData.shortName}
                changeValue={e => handleInputChange('shortName', e.target.value)}
                error={!!errors.shortName}
                disabled={disabled}
                {...register('shortName', {
                  required: requiredMessage,
                })}
                helperText={(errors.shortName?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={requiredTitle(
                  'createOrganization.details.addressRegistration'
                )}
                value={formData.addressRegistration}
                changeValue={e =>
                  handleInputChange('addressRegistration', e.target.value)
                }
                error={!!errors.addressRegistration}
                disabled={disabled}
                {...register('addressRegistration', {
                  required: requiredMessage,
                })}
                helperText={(errors.addressRegistration?.message as string) || ''}
              />
            </div>

            <div className="col-span-12">
              <Input
                type="text"
                title={requiredTitle('createOrganization.details.additionalAddress')}
                value={formData.additionalAddress}
                changeValue={e =>
                  handleInputChange('additionalAddress', e.target.value)
                }
                error={!!errors.additionalAddress}
                disabled={disabled}
                {...register('additionalAddress', {
                  required: requiredMessage,
                })}
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
                title={requiredTitle('createOrganization.details.phone')}
                isPhone={true}
                classname=""
                countryCode={phoneCountryCode}
                disableCountrySelect={true}
                value={formatPhoneByCountry(formData.phone, phoneCountryCode)}
                changeValue={handlePhoneChange}
                error={!!errors.phone}
                disabled={disabled}
                {...register('phone', {
                  required: requiredMessage,
                  validate: value => {
                    const digits = (value ?? '').toString().replace(/\D/g, '');
                    return (
                      (digits.startsWith('7') && digits.length === 11) ||
                      (t('validation.phoneValidFormat') as string)
                    );
                  },
                })}
                helperText={(errors.phone?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={requiredTitle('createOrganization.details.email')}
                value={formData.email}
                changeValue={e => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                disabled={disabled}
                {...register('email', {
                  required: requiredMessage,
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
                title={requiredTitle('createOrganization.details.inn')}
                value={formData.inn}
                changeValue={e => handleInputChange('inn', e.target.value)}
                error={!!errors.inn}
                disabled={disabled}
                {...register('inn', {
                  required: requiredMessage,
                })}
                helperText={(errors.inn?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <Input
                type="text"
                title={requiredTitle('createOrganization.details.kpp')}
                value={formData.kpp}
                changeValue={e => handleInputChange('kpp', e.target.value)}
                error={!!errors.kpp}
                disabled={disabled}
                {...register('kpp', {
                  required: requiredMessage,
                })}
                helperText={(errors.kpp?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <Input
                type="text"
                title={requiredTitle('createOrganization.details.ogrn')}
                value={formData.ogrn}
                changeValue={e => handleInputChange('ogrn', e.target.value)}
                error={!!errors.ogrn}
                disabled={disabled}
                {...register('ogrn', {
                  required: requiredMessage,
                })}
                helperText={(errors.ogrn?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <Input
                type="text"
                title={requiredTitle('createOrganization.details.okpo')}
                value={formData.okpo}
                changeValue={e => handleInputChange('okpo', e.target.value)}
                error={!!errors.okpo}
                disabled={disabled}
                {...register('okpo', {
                  required: requiredMessage,
                })}
                helperText={(errors.okpo?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <DropdownInput
                title={requiredTitle('createOrganization.details.rateVat')}
                options={vatOptions}
                classname="!w-full"
                {...register('rateVat', {
                  required: requiredMessage,
                })}
                value={formData.rateVat}
                onChange={value => handleInputChange('rateVat', value)}
                error={!!errors.rateVat}
                isDisabled={disabled}
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
                title={requiredTitle('createOrganization.details.bank')}
                value={formData.bank}
                changeValue={e => handleInputChange('bank', e.target.value)}
                error={!!errors.bank}
                disabled={disabled}
                {...register('bank', {
                  required: requiredMessage,
                })}
                helperText={(errors.bank?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={requiredTitle('createOrganization.details.bik')}
                value={formData.bik}
                changeValue={e => handleInputChange('bik', e.target.value)}
                error={!!errors.bik}
                disabled={disabled}
                {...register('bik', {
                  required: requiredMessage,
                })}
                helperText={(errors.bik?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={requiredTitle('createOrganization.details.settlementAccount')}
                value={formData.settlementAccount}
                changeValue={e =>
                  handleInputChange('settlementAccount', e.target.value)
                }
                error={!!errors.settlementAccount}
                disabled={disabled}
                {...register('settlementAccount', {
                  required: requiredMessage,
                })}
                helperText={(errors.settlementAccount?.message as string) || ''}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <Input
                type="text"
                title={requiredTitle(
                  'createOrganization.details.correspondentAccount'
                )}
                value={formData.correspondentAccount}
                changeValue={e =>
                  handleInputChange('correspondentAccount', e.target.value)
                }
                error={!!errors.correspondentAccount}
                disabled={disabled}
                {...register('correspondentAccount', {
                  required: requiredMessage,
                })}
                helperText={
                  (errors.correspondentAccount?.message as string) || ''
                }
              />
            </div>

            <div className="col-span-12">
              <Input
                type="text"
                title={requiredTitle('createOrganization.details.addressBank')}
                value={formData.addressBank}
                changeValue={e => handleInputChange('addressBank', e.target.value)}
                error={!!errors.addressBank}
                disabled={disabled}
                {...register('addressBank', {
                  required: requiredMessage,
                })}
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
