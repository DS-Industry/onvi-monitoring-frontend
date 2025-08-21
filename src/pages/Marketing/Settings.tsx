import React, { useEffect, useState } from 'react';
import BonusImage from '@icons/BasicBonus.svg?react';
import { useTranslation } from 'react-i18next';
import DropdownInput from '@ui/Input/DropdownInput';
import ExpandedCard from '@ui/Card/ExpandedCard';
import DiamondImage from '@icons/DiamondIcon.svg?react';
import Input from '@/components/ui/Input/Input';
import Alert from '@icons/AlertTriangle.svg?react';
import DiamondOne from '@/assets/DiamondOne.png';
import TwoArrow from '@/assets/TwoArrow.png';
import { Select, Skeleton } from 'antd';
import useSWR, { mutate } from 'swr';
import { getPlacement } from '@/services/api/device';
import { getOrganization } from '@/services/api/organization';
import useFormHook from '@/hooks/useFormHook';
import Button from '@/components/ui/Button/Button';
import useSWRMutation from 'swr/mutation';
import {
  createLoyaltyProgram,
  getLoyaltyProgramById,
  updateLoyaltyProgram,
} from '@/services/api/marketing';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/context/useContext';
import { updateSearchParams } from '@/utils/searchParamsUtils';

const { Option } = Select;

type LoyaltyPrograms = {
  name: string;
  organizationIds: number[];
  lifetimeDays?: number;
};

type UpdateLoyalty = {
  loyaltyProgramId: number;
  name?: string;
  organizationIds?: number[];
};

type Props = {
  nextStep?: () => void;
};

const Settings: React.FC<Props> = ({ nextStep }) => {
  const { t } = useTranslation();
  const [isEditMode, setIsEditMode] = useState(false);
  const { showToast } = useToast();

  const [selectedOption, setSelectedOption] = useState<string>('never');

  const { data: cityData } = useSWR([`get-city`], () => getPlacement(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const cities: { name: string; value: number | string }[] = [
    { name: t('analysis.all'), value: '*' },
    ...(cityData?.map(item => ({ name: item.region, value: item.id })) || []),
  ];

  const { data: organizationData } = useSWR(
    [`get-organization`],
    () => getOrganization({ noLoyaltyProgram: true }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const organizations: { label: string; value: number | string }[] =
    organizationData?.map(item => ({ label: item.name, value: item.id })) || [];
  const [searchParams, setSearchParams] = useSearchParams();

  const placementId = searchParams.get('city');
  const loyaltyId = Number(searchParams.get('loyaltyId')) || undefined;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  const { data: loyaltyData, isValidating: loadingPrograms } = useSWR(
    loyaltyId ? [`get-loyalty-program-by-id`] : null,
    () => getLoyaltyProgramById(loyaltyId ? loyaltyId : 0),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const loyaltyById = loyaltyData;
  const defaultValues: LoyaltyPrograms = {
    name: '',
    organizationIds: [],
    lifetimeDays: undefined,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createLoyalty, isMutating } = useSWRMutation(
    ['create-loyalty-program'],
    async () =>
      createLoyaltyProgram({
        name: formData.name,
        organizationIds: formData.organizationIds,
        lifetimeDays: formData.lifetimeDays,
      })
  );

  const payload: UpdateLoyalty = {
    loyaltyProgramId: loyaltyId ? loyaltyId : 0,
    name: formData.name,
  };

  if (formData.organizationIds !== loyaltyById?.organizationIds) {
    payload.organizationIds = formData.organizationIds;
  }

  const { trigger: updateLoyalty } = useSWRMutation(
    ['update-loyalty-program'],
    async () => updateLoyaltyProgram(payload)
  );

  type FieldType =
    | 'name'
    | 'organizationIds'
    | 'lifetimeDays'
    | `organizationIds.${number}`;

  const handleInputChange = (field: FieldType, value: string) => {
    const numericFields = ['lifetimeDays'];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const handleChangeTags = (values: number[]) => {
    setFormData(prev => ({ ...prev, ['organizationIds']: values }));
    setValue('organizationIds', values);
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
  };

  const onSubmit = async () => {
    try {
      const result = await createLoyalty();
      if (result) {
        updateSearchParams(searchParams, setSearchParams, {
          loyaltyId: result.props.id,
        });
        nextStep;
        resetForm();
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  useEffect(() => {
    if (loyaltyById?.id) {
      setIsEditMode(true);
      setFormData({
        name: loyaltyById.name,
        organizationIds: loyaltyById.organizationIds,
        lifetimeDays: loyaltyById.lifetimeDays,
      });
      if (loyaltyById.lifetimeDays !== undefined) setSelectedOption('fromThe');
    }
  }, [loyaltyById]);

  const handleUpdate = async () => {
    try {
      const result = await updateLoyalty();
      if (result) {
        mutate([`get-loyalty-program-by-id`]);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <ExpandedCard
        firstText={t('marketing.basic')}
        secondText={t('marketing.setup')}
        Component={BonusImage}
        handleClick={loyaltyId ? handleUpdate : undefined}
      >
        <div className="pl-14 mt-5">
          {loadingPrograms ? (
            <div className="space-y-6">
              <Skeleton active paragraph={{ rows: 3 }} />
              <Skeleton.Input active size="large" style={{ width: 320 }} />
              <div className="flex flex-col sm:flex-row gap-4 mt-5">
                <Skeleton.Input active size="large" style={{ width: 320 }} />
                <Skeleton.Input active size="large" style={{ width: 320 }} />
              </div>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-semibold text-text01">
                {t('marketing.branch')}
              </div>
              <div className="text-text02">
                <div>{t('marketing.setUpBranch')}</div>
                <div>{t('marketing.branchCan')}</div>
              </div>
              <Input
                title={t('equipment.name')}
                classname="w-80"
                inputType="secondary"
                value={formData.name}
                changeValue={e => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                {...register('name', {
                  required: !isEditMode && 'Name is required',
                })}
                helperText={errors.name?.message || ''}
              />
              <div className="flex flex-col sm:flex-row gap-4 mt-5">
                <DropdownInput
                  title={t('marketing.cities')}
                  value={placementId}
                  options={cities}
                  classname="w-64"
                  inputType="secondary"
                  onChange={value =>
                    updateSearchParams(searchParams, setSearchParams, {
                      city: value,
                    })
                  }
                />
                <div>
                  <div className="text-sm text-text02">
                    {t('warehouse.organization')}
                  </div>
                  <Select
                    mode="tags"
                    allowClear
                    placeholder="Select organizations"
                    dropdownStyle={{ zIndex: 9999 }}
                    style={{ width: '320px' }}
                    status={errors.organizationIds ? 'error' : undefined}
                    {...register('organizationIds', {
                      required: !isEditMode && 'Organizations is required',
                    })}
                    onChange={handleChangeTags}
                    value={formData.organizationIds}
                    size="large"
                  >
                    {organizations.map(tag => (
                      <Option key={tag.value} value={tag.value}>
                        {tag.label}
                      </Option>
                    ))}
                  </Select>
                  {!!errors.organizationIds && (
                    <div
                      className={`text-[11px] font-normal ${errors.organizationIds ? 'text-errorFill' : 'text-text02'}`}
                    >
                      {errors.organizationIds.message || ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </ExpandedCard>
      <ExpandedCard
        firstText={t('marketing.bonus')}
        secondText={t('marketing.setUpAcc')}
        Component={DiamondImage}
      >
        <div className="px-4 sm:px-8 lg:pl-14 space-y-6">
          <div className="text-2xl text-text01 font-semibold mb-4">
            {t('marketing.write')}
          </div>

          <div className="bg-Bonus-Image bg-blend-multiply h-auto min-h-40 rounded-lg w-full sm:w-96 bg-[#0a0a0b]/70 px-4 py-6 space-y-6">
            <div className="text-background02 font-semibold text-2xl sm:text-3xl">
              {t('marketing.ex')}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex justify-center sm:justify-start">
                <img src={DiamondOne} />
              </div>

              <div className="flex justify-center sm:justify-start">
                <img src={TwoArrow} />
              </div>

              <Input
                label={t('marketing.1')}
                inputType="primary"
                showIcon={true}
                classname="w-full sm:w-48"
                IconComponent={
                  <div className="text-3xl font-semibold text-text01">₽</div>
                }
              />
            </div>
          </div>
          <div className="max-w-full lg:max-w-[560px]">
            <div className="text-2xl text-text01 font-semibold">
              {t('marketing.burni')}
            </div>
            <div className="text-text02">{t('marketing.bonusesCan')}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['never', 'fromThe'].map(option => (
              <div
                key={option}
                className={`flex items-center gap-2 ${selectedOption === option ? 'bg-background06' : 'bg-disabledFill'} rounded-md px-5 py-4`}
              >
                <input
                  type="radio"
                  name="marketing"
                  value={option}
                  checked={selectedOption === option}
                  onChange={handleChange}
                  disabled={!!loyaltyId}
                />
                <div
                  className={
                    selectedOption === option ? 'text-primary02' : 'text-text01'
                  }
                >
                  {t(`marketing.${option}`)}
                </div>
              </div>
            ))}
          </div>

          {selectedOption !== 'never' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-disabledFill rounded-lg px-5 py-4">
                <Alert />
                <div className="text-text02">{t('marketing.after')}</div>
              </div>
              <Input
                type="number"
                inputType="secondary"
                value={formData.lifetimeDays}
                title={t('marketing.burnout')}
                classname="w-full sm:w-40"
                changeValue={e =>
                  handleInputChange('lifetimeDays', e.target.value)
                }
                {...register('lifetimeDays')}
                disabled={!!loyaltyId}
              />
            </div>
          )}
        </div>
      </ExpandedCard>
      {loyaltyId === undefined && (
        <div className="flex space-x-4">
          <Button
            title={t('organizations.cancel')}
            type="outline"
            handleClick={() => {
              resetForm();
            }}
          />
          <Button
            title={t('organizations.save')}
            form={true}
            isLoading={isMutating}
            handleClick={() => {}}
          />
        </div>
      )}
    </form>
  );
};

export default Settings;
