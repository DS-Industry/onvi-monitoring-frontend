import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandedCard from '@/components/ui/Card/ExpandedCard';
import PresentIcon from '@icons/Present.svg?react';
import Input from '@/components/ui/Input/Input';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import useSWR, { mutate } from 'swr';
import {
  createBenefit,
  getBenefitActions,
  getBenefitById,
  getBenefits,
  updateBenefit,
} from '@/services/api/marketing';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import Modal from '@/components/ui/Modal/Modal';
import Close from '@icons/close.svg?react';
import Button from '@/components/ui/Button/Button';
import { Descriptions, Tag, Skeleton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useToast } from '@/components/context/useContext';

enum BenefitType {
  CASHBACK = 'CASHBACK',
  DISCOUNT = 'DISCOUNT',
  GIFT_POINTS = 'GIFT_POINTS',
}

type Benefit = {
  name: string;
  type: BenefitType;
  bonus: number;
  benefitActionTypeId?: number;
};

type Benefits = {
  id: number;
  name: string;
  benefitType: BenefitType;
  bonus: number;
  benefitActionTypeId?: number;
};

type UpdateBenefit = {
  benefitId: number;
  name?: string;
  bonus?: number;
  benefitType?: BenefitType;
};

const Events: React.FC = () => {
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenUpdate, setIsModalOpenUpdate] = useState(false);
  const [benefit, setBenefit] = useState<Benefits[]>([]);
  const [benefitId, setBenefitId] = useState(0);
  const { showToast } = useToast();

  const { data: benefitsData } = useSWR([`get-benefits`], () => getBenefits(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const { data: benefitByIdData, isLoading: loadingBenefit } = useSWR(
    benefitId !== 0 ? [`get-benefit-by-id`, benefitId] : null,
    () => getBenefitById(benefitId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: benefitsActionData } = useSWR(
    [`get-benefits-actions`],
    () => getBenefitActions(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const benefitActions: { name: string; value: number }[] =
    benefitsActionData?.map(ben => ({
      name: ben.props.name,
      value: ben.props.id,
    })) || [];

  const addBenefit = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (benefitByIdData?.props.id) {
      setUpdateData({
        benefitId: benefitByIdData.props.id,
        name: benefitByIdData.props.name,
        bonus: benefitByIdData.props.bonus,
        benefitType: benefitByIdData.props.benefitType,
      });
    }
  }, [benefitByIdData]);

  useEffect(() => {
    const benefits = benefitsData?.map(ben => ben.props) || [];

    setBenefit(benefits);
  }, [benefitsData]);

  const defaultValues: Benefit = {
    name: '',
    type: '' as BenefitType,
    bonus: 0,
    benefitActionTypeId: undefined,
  };

  const updateValues: UpdateBenefit = {
    benefitId: benefitId,
    name: undefined,
    bonus: undefined,
    benefitType: undefined,
  };

  const [formData, setFormData] = useState(defaultValues);

  const [updateData, setUpdateData] = useState(updateValues);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const {
    register: updateRegister,
    handleSubmit: handleSubmitUpdate,
    setValue: setUpdate,
  } = useFormHook(updateData);

  const { trigger: createBen, isMutating } = useSWRMutation(
    ['create-benefit'],
    async () =>
      createBenefit({
        name: formData.name,
        type: formData.type,
        bonus: formData.bonus,
        benefitActionTypeId: formData.benefitActionTypeId,
      })
  );

  const { trigger: updateBen, isMutating: updatingBenefit } = useSWRMutation(
    ['update-benefit'],
    async () =>
      updateBenefit({
        benefitId: updateData.benefitId,
        name: updateData.name,
        bonus: updateData.bonus,
        benefitType: updateData.benefitType,
      })
  );

  type FieldType = 'name' | 'type' | 'bonus' | 'benefitActionTypeId';

  const handleInputChange = (field: FieldType, value: string) => {
    const numericFields = ['bonus', 'benefitActionTypeId'];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  type Field = 'name' | 'bonus' | 'benefitId' | 'benefitType';

  const handleUpdateChange = (field: Field, value: string) => {
    const numericFields = ['limitBenefit'];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setUpdateData(prev => ({ ...prev, [field]: updatedValue }));
    setUpdate(field, value);
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
  };

  const onSubmit = async () => {
    try {
      const result = await createBen();
      if (result) {
        mutate([`get-benefits`]);
        resetForm();
        setIsModalOpen(false);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const onSubmitUpdate = async () => {
    try {
      const result = await updateBen();
      if (result) {
        mutate([`get-benefits`]);
        resetForm();
        setIsModalOpenUpdate(false);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  return (
    <div>
      <Modal isOpen={isModalOpen}>
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">
            {t('marketing.addBen')}
          </h2>
          <Close
            onClick={() => {
              resetForm();
              setIsModalOpen(false);
            }}
            className="cursor-pointer text-text01"
          />
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 text-text02"
        >
          <div className="grid grid-cols-1 gap-4">
            <Input
              title={t('equipment.name')}
              classname="w-80"
              inputType="secondary"
              value={formData.name}
              changeValue={e => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              {...register('name', { required: 'Name is required' })}
              helperText={errors.name?.message || ''}
            />
            <DropdownInput
              title={`${t('marketing.ty')} *`}
              label={t('warehouse.notSel')}
              options={[
                { name: t('marketing.CASHBACK'), value: 'CASHBACK' },
                { name: t('marketing.DISCOUNT'), value: 'DISCOUNT' },
                { name: t('marketing.GIFT_POINTS'), value: 'GIFT_POINTS' },
              ]}
              classname="w-80"
              {...register('type', {
                required: 'Type is required',
              })}
              value={formData.type}
              onChange={value => handleInputChange('type', value)}
              error={!!errors.type}
              helperText={errors.type?.message}
            />
            <Input
              type="number"
              title={t('marketing.bonu')}
              label={t('marketing.enter')}
              inputType="secondary"
              classname="w-80"
              value={formData.bonus}
              changeValue={e => handleInputChange('bonus', e.target.value)}
              error={!!errors.bonus}
              {...register('bonus', { required: 'bonus is required' })}
              helperText={errors.bonus?.message || ''}
              showIcon={true}
              IconComponent={<div className="text-text02 text-lg">₽</div>}
            />
            <DropdownInput
              title={`${t('marketing.ty')}`}
              label={t('warehouse.notSel')}
              options={benefitActions}
              classname="w-80"
              {...register('benefitActionTypeId')}
              value={formData.benefitActionTypeId}
              onChange={value =>
                handleInputChange('benefitActionTypeId', value)
              }
            />
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <Button
              title={'Сбросить'}
              handleClick={() => {
                resetForm();
                setIsModalOpen(false);
              }}
              type="outline"
            />
            <Button title={'Сохранить'} form={true} isLoading={isMutating} />
          </div>
        </form>
      </Modal>
      <Modal isOpen={isModalOpenUpdate}>
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">
            {benefit.find(item => item.id === benefitId)?.name || ''}
          </h2>
          <Close
            onClick={() => {
              setIsModalOpenUpdate(false);
            }}
            className="cursor-pointer text-text01"
          />
        </div>
        {loadingBenefit ? (
          <div className="w-80 space-y-4">
            <Skeleton.Input active style={{ width: 320 }} size="default" />
            <Skeleton.Input active style={{ width: 320 }} size="default" />
            <Skeleton.Input active style={{ width: 320 }} size="default" />
            <div className="flex gap-3 mt-5">
              <Skeleton.Button active />
              <Skeleton.Button active />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitUpdate(onSubmitUpdate)}>
            <div className="grid grid-cols-1 gap-4">
              <Input
                title={t('equipment.name')}
                classname="w-80"
                inputType="secondary"
                value={updateData.name}
                changeValue={e => handleUpdateChange('name', e.target.value)}
                {...updateRegister('name')}
              />
              <Input
                type="number"
                title={t('marketing.bonu')}
                classname="w-80"
                inputType="secondary"
                value={updateData.bonus}
                changeValue={e => handleUpdateChange('bonus', e.target.value)}
                {...updateRegister('bonus')}
              />
              <DropdownInput
                title={`${t('marketing.ty')}`}
                label={t('warehouse.notSel')}
                options={[
                  { name: t('marketing.CASHBACK'), value: 'CASHBACK' },
                  { name: t('marketing.DISCOUNT'), value: 'DISCOUNT' },
                  { name: t('marketing.GIFT_POINTS'), value: 'GIFT_POINTS' },
                ]}
                classname="w-80"
                {...updateRegister('benefitType')}
                value={updateData.benefitType}
                onChange={value => handleUpdateChange('benefitType', value)}
              />
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <Button
                title={'Сбросить'}
                handleClick={() => {
                  setIsModalOpenUpdate(false);
                }}
                type="outline"
              />
              <Button
                title={'Сохранить'}
                form={true}
                isLoading={updatingBenefit}
              />
            </div>
          </form>
        )}
      </Modal>
      <div className="space-y-3">
        <div className="text-text02">
          <div>{t('marketing.setUp')}</div>
          <div>{t('marketing.if')}</div>
        </div>
        {benefit
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(ben => (
            <ExpandedCard
              firstText={ben.name}
              secondText={t(`marketing.${ben.benefitType}`)}
              Component={PresentIcon}
              handleClick={() => {
                setIsModalOpenUpdate(true);
                setBenefitId(ben.id);
              }}
              buttonText={t('marketing.updateBen')}
            >
              <div className="pl-0 sm:pl-14 space-y-6">
                <Descriptions
                  column={1}
                  size="small"
                  labelStyle={{ fontWeight: 500, color: '#595959' }}
                  contentStyle={{ color: '#1F1F1F' }}
                >
                  <Descriptions.Item label={t('marketing.ty')}>
                    <Tag color="blue">{t(`marketing.${ben.benefitType}`)}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={t('marketing.bonu')}>
                    <Tag color="gold">{`${ben.bonus} ${ben.benefitType !== 'DISCOUNT' ? '' : '%'}`}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </ExpandedCard>
          ))}
        <div
          className="flex space-x-2 items-center text-primary02 cursor-pointer"
          onClick={addBenefit}
        >
          <PlusOutlined />
          <div>{t('marketing.addBen')}</div>
        </div>
      </div>
    </div>
  );
};

export default Events;
