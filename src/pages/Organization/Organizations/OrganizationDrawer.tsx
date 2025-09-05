import { useToast } from '@/components/context/useContext';
import useFormHook from '@/hooks/useFormHook';
import {
  createUserOrganization,
  Organization,
  OrganizationBody,
  OrganizationOtherDetailsResponse,
  postUpdateOrganization,
} from '@/services/api/organization';
import { Drawer, Form } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { Select, Input, Button } from 'antd';

type OrganizationDrawerProps = {
  orgToEdit: Organization | null;
  orgDocuments: OrganizationOtherDetailsResponse | null;
  onEdit: () => void;
  isOpen: boolean;
  onClose: () => void;
};

const OrganizationDrawer: React.FC<OrganizationDrawerProps> = ({
  orgToEdit,
  orgDocuments,
  onEdit,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const city = searchParams.get('city') || '*';

  const initialValues: OrganizationBody = {
    fullName: '',
    organizationType: '',
    rateVat: '',
    inn: '',
    okpo: '',
    kpp: undefined,
    addressRegistration: '',
    ogrn: '',
    bik: '',
    correspondentAccount: '',
    bank: '',
    settlementAccount: '',
    addressBank: '',
    certificateNumber: '',
  };

  const [formData, setFormData] = useState(initialValues);

  useEffect(() => {
    if (orgToEdit) {
      setFormData({
        fullName: orgToEdit.name,
        organizationType:
          legalOptions.find(leg => leg.label === orgToEdit.organizationType)
            ?.value || '',
        rateVat: orgDocuments?.rateVat ? orgDocuments.rateVat : '',
        inn: orgDocuments?.inn ? orgDocuments.inn : '',
        okpo: orgDocuments?.okpo ? orgDocuments.okpo : '',
        kpp: orgDocuments?.kpp ? orgDocuments.kpp : undefined,
        addressRegistration: orgToEdit.address,
        ogrn: orgDocuments?.ogrn ? orgDocuments.ogrn : '',
        bik: orgDocuments?.bik ? orgDocuments.bik : '',
        correspondentAccount: orgDocuments?.correspondentAccount
          ? orgDocuments.correspondentAccount
          : '',
        bank: orgDocuments?.bank ? orgDocuments.bank : '',
        settlementAccount: orgDocuments?.settlementAccount
          ? orgDocuments.settlementAccount
          : '',
        addressBank: orgDocuments?.addressBank ? orgDocuments.addressBank : '',
        certificateNumber: orgDocuments?.certificateNumber
          ? orgDocuments.certificateNumber
          : '',
      });
    }
  }, [orgToEdit, orgDocuments]);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createOrganization, isMutating } = useSWRMutation(
    [`create-organization`],
    async () =>
      createUserOrganization({
        fullName: formData.fullName,
        organizationType: formData.organizationType,
        rateVat: formData.rateVat,
        inn: formData.inn,
        okpo: formData.okpo,
        kpp: formData.kpp,
        addressRegistration: formData.addressRegistration,
        ogrn: formData.ogrn,
        bik: formData.bik,
        correspondentAccount: formData.correspondentAccount,
        bank: formData.bank,
        settlementAccount: formData.settlementAccount,
        addressBank: formData.addressBank,
      })
  );

  const { trigger: updateOrganization, isMutating: updatingOrganization } =
    useSWRMutation([`update-organization`], async () =>
      postUpdateOrganization({
        organizationId: orgToEdit?.id ?? 0,
        fullName: formData.fullName,
        rateVat: formData.rateVat,
        inn: formData.inn,
        okpo: formData.okpo,
        kpp: formData.kpp,
        addressRegistration: formData.addressRegistration,
        ogrn: formData.ogrn,
        bik: formData.bik,
        correspondentAccount: formData.correspondentAccount,
        bank: formData.bank,
        settlementAccount: formData.settlementAccount,
        addressBank: formData.addressBank,
      })
    );

  type FieldType = keyof typeof initialValues;

  const handleInputChange = (
    field: FieldType,
    value: string | Date | undefined
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const { showToast } = useToast();

  const resetForm = () => {
    setFormData(initialValues);
    reset();
    onEdit();
    onClose();
  };

  const onSubmit = async () => {
    try {
      const result = orgToEdit
        ? await updateOrganization()
        : await createOrganization();
      if (result) {
        mutate([`get-org`, city]);
        showToast(t('success.recordCreated'), 'success');
        resetForm();
      } else {
        showToast(t('errors.other.passwordChangeError'), 'error');
      }
    } catch (error) {
      console.error('Password change error: ', error);
      showToast(t('errors.other.passwordChangeError'), 'error');
    }
  };

  const legalOptions = [
    { label: t('organizations.legalEntity'), value: 'LegalEntity' },
    { label: t('organizations.ip'), value: 'IndividualEntrepreneur' },
  ];

  const vatOptions = [
    { label: t('organizations.withoutVat'), value: 'WithoutVAT' },
    { label: '10%', value: 'Vat10' },
    { label: '18%', value: 'Vat18' },
    { label: '20%', value: 'Vat20' },
  ];

  return (
    <Drawer open={isOpen} width={620} closable={false} onClose={resetForm}>
      <form
        className="space-y-6 w-full max-w-2xl mx-auto p-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <span className="font-semibold text-xl md:text-3xl mb-5 text-text01">
          {orgToEdit !== null
            ? t('organizations.update')
            : t('organizations.new')}
        </span>
        <div className="mb-5 flex">
          <span className="font-semibold text-sm text-text01">
            {t('routine.fields')}
          </span>
          <span className="text-errorFill">*</span>
          <span className="font-semibold text-sm text-text01">
            {t('routine.are')}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">
                {t('organizations.typeLegal')}
              </div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.organizationType?.message}
              validateStatus={errors.organizationType ? 'error' : undefined}
            >
              <Select
                options={legalOptions}
                className="!w-80 !sm:w-96"
                {...register('organizationType', {
                  required:
                    orgToEdit === null &&
                    t('validation.organizationTypeRequired'),
                })}
                value={formData.organizationType}
                onChange={value => handleInputChange('organizationType', value)}
                status={errors.organizationType ? 'error' : ''}
              />
            </Form.Item>
          </div>
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">
                {t('organizations.vatRate')}
              </div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.rateVat?.message}
              validateStatus={errors.rateVat ? 'error' : undefined}
            >
              <Select
                placeholder={t('organizations.selectBet')}
                options={vatOptions}
                className="!w-80 !sm:w-96"
                {...register('rateVat', {
                  required: orgToEdit === null && t('validation.vatRequired'),
                })}
                value={formData.rateVat}
                onChange={value => handleInputChange('rateVat', value)}
                status={errors.rateVat ? 'error' : ''}
              />
            </Form.Item>
          </div>
        </div>
        <div className="text-sm text-text01 font-normal mb-4 uppercase">
          {t('organizations.legalDetails')}
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">
                {t('organizations.tin')}
              </div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.inn?.message}
              validateStatus={errors.inn ? 'error' : undefined}
            >
              <Input
                className="w-80 sm:w-96"
                {...register('inn', {
                  required: orgToEdit === null && t('validation.innRequired'),
                })}
                value={formData.inn}
                onChange={e => handleInputChange('inn', e.target.value)}
                status={errors.inn ? 'error' : ''}
              />
            </Form.Item>
          </div>
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">
                {t('organizations.fullName')}
              </div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.fullName?.message}
              validateStatus={errors.fullName ? 'error' : undefined}
            >
              <Input
                className="w-80 sm:w-96"
                {...register('fullName', {
                  required: orgToEdit === null && t('validation.nameRequired'),
                })}
                value={formData.fullName}
                onChange={e => handleInputChange('fullName', e.target.value)}
                status={errors.fullName ? 'error' : ''}
              />
            </Form.Item>
          </div>
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">
                {t('organizations.okpo')}
              </div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.okpo?.message}
              validateStatus={errors.okpo ? 'error' : undefined}
            >
              <Input
                className="w-80 sm:w-96"
                {...register('okpo', {
                  required: orgToEdit === null && t('validation.okpoRequired'),
                })}
                value={formData.okpo}
                onChange={e => handleInputChange('okpo', e.target.value)}
                status={errors.okpo ? 'error' : ''}
              />
            </Form.Item>
          </div>
          <div>
            <div className="text-text02 text-sm">{t('organizations.kpp')}</div>
            <Input
              className="w-80 sm:w-96"
              {...register('kpp')}
              value={formData.kpp}
              onChange={e => handleInputChange('kpp', e.target.value)}
              size="large"
            />
          </div>
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">
              {t('organizations.address')}
            </div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            help={errors.addressRegistration?.message}
            validateStatus={errors.addressRegistration ? 'error' : undefined}
          >
            <Input.TextArea
              className="w-80 sm:w-96"
              {...register('addressRegistration', {
                required:
                  orgToEdit === null &&
                  t('validation.addressRegistrationRequired'),
              })}
              value={formData.addressRegistration}
              onChange={e =>
                handleInputChange('addressRegistration', e.target.value)
              }
              status={errors.addressRegistration ? 'error' : ''}
              size="large"
            />
          </Form.Item>
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">{t('organizations.ogrn')}</div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            help={errors.ogrn?.message}
            validateStatus={errors.ogrn ? 'error' : undefined}
          >
            <Input
              className="w-80 sm:w-96"
              {...register('ogrn', {
                required: orgToEdit === null && t('validation.ogrnRequired'),
              })}
              value={formData.ogrn}
              onChange={e => handleInputChange('ogrn', e.target.value)}
              status={errors.ogrn ? 'error' : ''}
              size="large"
            />
          </Form.Item>
        </div>
        <div className="text-sm text-text01 font-normal mb-4 uppercase">
          {t('organizations.bankDetails')}
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">
                {t('organizations.bik')}
              </div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.bik?.message}
              validateStatus={errors.bik ? 'error' : undefined}
            >
              <Input
                className="w-80 sm:w-96"
                {...register('bik', {
                  required: orgToEdit === null && t('validation.bikRequired'),
                })}
                value={formData.bik}
                onChange={e => handleInputChange('bik', e.target.value)}
                status={errors.bik ? 'error' : ''}
              />
            </Form.Item>
          </div>

          <div>
            <div className="flex">
              <div className="text-text02 text-sm">
                {t('organizations.corres')}
              </div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.correspondentAccount?.message}
              validateStatus={errors.correspondentAccount ? 'error' : undefined}
            >
              <Input
                className="w-80 sm:w-96"
                {...register('correspondentAccount', {
                  required:
                    orgToEdit === null &&
                    t('validation.correspondentAccountRequired'),
                })}
                value={formData.correspondentAccount}
                onChange={e =>
                  handleInputChange('correspondentAccount', e.target.value)
                }
                status={errors.correspondentAccount ? 'error' : ''}
              />
            </Form.Item>
          </div>

          <div>
            <div className="flex">
              <div className="text-text02 text-sm">
                {t('organizations.bank')}
              </div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.bank?.message}
              validateStatus={errors.bank ? 'error' : undefined}
            >
              <Input
                className="w-80 sm:w-96"
                {...register('bank', {
                  required: orgToEdit === null && t('validation.bankRequired'),
                })}
                value={formData.bank}
                onChange={e => handleInputChange('bank', e.target.value)}
                status={errors.bank ? 'error' : ''}
              />
            </Form.Item>
          </div>

          <div>
            <div className="flex">
              <div className="text-text02 text-sm">
                {t('organizations.current')}
              </div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.settlementAccount?.message}
              validateStatus={errors.settlementAccount ? 'error' : undefined}
            >
              <Input
                className="w-80 sm:w-96"
                {...register('settlementAccount', {
                  required:
                    orgToEdit === null &&
                    t('validation.settlementAccountRequired'),
                })}
                value={formData.settlementAccount}
                onChange={e =>
                  handleInputChange('settlementAccount', e.target.value)
                }
                status={errors.settlementAccount ? 'error' : ''}
              />
            </Form.Item>
          </div>
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">{t('organizations.add')}</div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            help={errors.addressBank?.message}
            validateStatus={errors.addressBank ? 'error' : undefined}
          >
            <Input.TextArea
              className="w-80 sm:w-96"
              {...register('addressBank', {
                required:
                  orgToEdit === null && t('validation.bankAddressRequired'),
              })}
              value={formData.addressBank}
              onChange={e => handleInputChange('addressBank', e.target.value)}
              status={errors.addressBank ? 'error' : ''}
              size="large"
            />
          </Form.Item>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
          <Button onClick={() => resetForm()} className="btn-outline-primary">
            {t('organizations.cancel')}
          </Button>
          <Button
            htmlType="submit"
            loading={orgToEdit === null ? isMutating : updatingOrganization}
            className="btn-primary"
          >
            {t('organizations.save')}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};

export default OrganizationDrawer;
