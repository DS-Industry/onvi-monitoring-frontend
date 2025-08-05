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
import { Select, Input, Button, DatePicker } from 'antd';
import dayjs from 'dayjs';

type OrganizationDrawerProps = {
  orgToEdit: Organization;
  orgToEditOtherDetails: OrganizationOtherDetailsResponse;
  orgId: number;
  onEdit: () => void;
  isOpen: boolean;
  onClose: () => void;
};

const OrganizationDrawer: React.FC<OrganizationDrawerProps> = ({
  orgToEdit,
  orgToEditOtherDetails,
  orgId,
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
    dateCertificate: undefined,
  };

  const [formData, setFormData] = useState(initialValues);

  useEffect(() => {
    if (orgToEdit) {
      setFormData({
        fullName: orgToEdit.name,
        organizationType:
          legalOptions.find(leg => leg.label === orgToEdit.organizationType)
            ?.value || '',
        rateVat: orgToEditOtherDetails?.rateVat
          ? orgToEditOtherDetails.rateVat
          : '',
        inn: orgToEditOtherDetails?.inn ? orgToEditOtherDetails.inn : '',
        okpo: orgToEditOtherDetails?.okpo ? orgToEditOtherDetails.okpo : '',
        kpp: orgToEditOtherDetails?.kpp ? orgToEditOtherDetails.kpp : undefined,
        addressRegistration: orgToEdit.address,
        ogrn: orgToEditOtherDetails?.ogrn ? orgToEditOtherDetails.ogrn : '',
        bik: orgToEditOtherDetails?.bik ? orgToEditOtherDetails.bik : '',
        correspondentAccount: orgToEditOtherDetails?.correspondentAccount
          ? orgToEditOtherDetails.correspondentAccount
          : '',
        bank: orgToEditOtherDetails?.bank ? orgToEditOtherDetails.bank : '',
        settlementAccount: orgToEditOtherDetails?.settlementAccount
          ? orgToEditOtherDetails.settlementAccount
          : '',
        addressBank: orgToEditOtherDetails?.addressBank
          ? orgToEditOtherDetails.addressBank
          : '',
        certificateNumber: orgToEditOtherDetails?.certificateNumber
          ? orgToEditOtherDetails.certificateNumber
          : '',
        dateCertificate: orgToEditOtherDetails?.dateCertificate
          ? dayjs(orgToEditOtherDetails.dateCertificate).toDate()
          : undefined,
      });
    }
  }, [orgToEdit, orgToEditOtherDetails]);

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
        dateCertificate: formData.dateCertificate,
      })
  );

  const { trigger: updateOrganization, isMutating: updatingOrganization } =
    useSWRMutation([`update-organization`], async () =>
      postUpdateOrganization({
        organizationId: orgId,
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
        dateCertificate: formData.dateCertificate,
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
      if (orgId) {
        const result = await updateOrganization();
        if (result) {
          mutate([`get-org`, city]);
          resetForm();
        } else {
          showToast(t('errors.other.passwordChangeError'), 'error');
        }
      } else {
        const result = await createOrganization();
        if (result) {
          mutate([`get-org`, city]);
        } else {
          showToast(t('errors.other.passwordChangeError'), 'error');
        }
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
    <div>
      <Drawer open={isOpen} width={620} closable={false} onClose={resetForm}>
        <form
          className="space-y-6 w-full max-w-2xl mx-auto p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <span className="font-semibold text-xl md:text-3xl mb-5 text-text01">
            {orgId !== 0 ? t('organizations.update') : t('organizations.new')}
          </span>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-text02 text-sm">
                {t('organizations.typeLegal')}
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
                      orgId === 0 && t('validation.organizationTypeRequired'),
                  })}
                  value={formData.organizationType}
                  onChange={value =>
                    handleInputChange('organizationType', value)
                  }
                  status={errors.organizationType ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">
                {t('organizations.vatRate')}
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
                    required: orgId === 0 && t('validation.vatRequired'),
                  })}
                  value={formData.rateVat}
                  onChange={value => handleInputChange('rateVat', value)}
                  status={errors.rateVat ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
          </div>

          <div className="text-sm text-text01 font-normal mb-4 uppercase">
            {t('organizations.legalDetails')}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-text02 text-sm">
                {t('organizations.tin')}
              </div>
              <Form.Item
                help={errors.inn?.message}
                validateStatus={errors.inn ? 'error' : undefined}
              >
                <Input
                  className="w-80 sm:w-96"
                  {...register('inn', {
                    required: orgId === 0 && t('validation.innRequired'),
                  })}
                  value={formData.inn}
                  onChange={e => handleInputChange('inn', e.target.value)}
                  status={errors.inn ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">
                {t('organizations.fullName')}
              </div>
              <Form.Item
                help={errors.fullName?.message}
                validateStatus={errors.fullName ? 'error' : undefined}
              >
                <Input
                  className="w-80 sm:w-96"
                  {...register('fullName', {
                    required: orgId === 0 && t('validation.nameRequired'),
                  })}
                  value={formData.fullName}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  status={errors.fullName ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">
                {t('organizations.okpo')}
              </div>
              <Form.Item
                help={errors.okpo?.message}
                validateStatus={errors.okpo ? 'error' : undefined}
              >
                <Input
                  className="w-80 sm:w-96"
                  {...register('okpo', {
                    required: orgId === 0 && t('validation.okpoRequired'),
                  })}
                  value={formData.okpo}
                  onChange={e => handleInputChange('okpo', e.target.value)}
                  status={errors.okpo ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">
                {t('organizations.kpp')}
              </div>
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
            <div className="text-text02 text-sm">
              {t('organizations.address')}
            </div>
            <Form.Item
              help={errors.addressRegistration?.message}
              validateStatus={errors.addressRegistration ? 'error' : undefined}
            >
              <Input.TextArea
                className="w-80 sm:w-96"
                {...register('addressRegistration', {
                  required:
                    orgId === 0 && t('validation.addressRegistrationRequired'),
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
            <div className="text-text02 text-sm">{t('organizations.ogrn')}</div>
            <Form.Item
              help={errors.ogrn?.message}
              validateStatus={errors.ogrn ? 'error' : undefined}
            >
              <Input
                className="w-80 sm:w-96"
                {...register('ogrn', {
                  required: orgId === 0 && t('validation.ogrnRequired'),
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
              <div className="text-text02 text-sm">
                {t('organizations.bik')}
              </div>
              <Form.Item
                help={errors.bik?.message}
                validateStatus={errors.bik ? 'error' : undefined}
              >
                <Input
                  className="w-80 sm:w-96"
                  {...register('bik', {
                    required: orgId === 0 && t('validation.bikRequired'),
                  })}
                  value={formData.bik}
                  onChange={e => handleInputChange('bik', e.target.value)}
                  status={errors.bik ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>

            <div>
              <div className="text-text02 text-sm">
                {t('organizations.corres')}
              </div>
              <Form.Item
                help={errors.correspondentAccount?.message}
                validateStatus={
                  errors.correspondentAccount ? 'error' : undefined
                }
              >
                <Input
                  className="w-80 sm:w-96"
                  {...register('correspondentAccount', {
                    required:
                      orgId === 0 &&
                      t('validation.correspondentAccountRequired'),
                  })}
                  value={formData.correspondentAccount}
                  onChange={e =>
                    handleInputChange('correspondentAccount', e.target.value)
                  }
                  status={errors.correspondentAccount ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>

            <div>
              <div className="text-text02 text-sm">
                {t('organizations.bank')}
              </div>
              <Form.Item
                help={errors.bank?.message}
                validateStatus={errors.bank ? 'error' : undefined}
              >
                <Input
                  className="w-80 sm:w-96"
                  {...register('bank', {
                    required: orgId === 0 && t('validation.bankRequired'),
                  })}
                  value={formData.bank}
                  onChange={e => handleInputChange('bank', e.target.value)}
                  status={errors.bank ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>

            <div>
              <div className="text-text02 text-sm">
                {t('organizations.current')}
              </div>
              <Form.Item
                help={errors.settlementAccount?.message}
                validateStatus={errors.settlementAccount ? 'error' : undefined}
              >
                <Input
                  className="w-80 sm:w-96"
                  {...register('settlementAccount', {
                    required:
                      orgId === 0 && t('validation.settlementAccountRequired'),
                  })}
                  value={formData.settlementAccount}
                  onChange={e =>
                    handleInputChange('settlementAccount', e.target.value)
                  }
                  status={errors.settlementAccount ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
          </div>
          <div>
            <div className="text-text02 text-sm">{t('organizations.add')}</div>
            <Form.Item
              help={errors.addressBank?.message}
              validateStatus={errors.addressBank ? 'error' : undefined}
            >
              <Input.TextArea
                className="w-80 sm:w-96"
                {...register('addressBank', {
                  required: orgId === 0 && t('validation.bankAddressRequired'),
                })}
                value={formData.addressBank}
                onChange={e => handleInputChange('addressBank', e.target.value)}
                status={errors.addressBank ? 'error' : ''}
                size="large"
              />
            </Form.Item>
          </div>
          <div>
            <div className="text-text02 text-sm">{t('finance.dat')}</div>
            <DatePicker
              className="w-40"
              {...register('dateCertificate')}
              value={
                formData.dateCertificate
                  ? dayjs(formData.dateCertificate)
                  : undefined
              }
              onChange={date =>
                handleInputChange(
                  'dateCertificate',
                  date ? dayjs(date).format('YYYY-MM-DD') : undefined
                )
              }
              size="large"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <Button onClick={() => resetForm()} className="btn-outline-primary">
              {t('organizations.cancel')}
            </Button>
            <Button
              htmlType="submit"
              loading={orgId === 0 ? isMutating : updatingOrganization}
              className="btn-primary"
            >
              {t('organizations.save')}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default OrganizationDrawer;
