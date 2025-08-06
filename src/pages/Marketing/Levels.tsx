import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Profile from '@icons/ProfileIcon.svg?react';
import ExpandedCard from '@ui/Card/ExpandedCard';
import Input from '@/components/ui/Input/Input';
// import PercentageIcon from "@icons/Percentage.svg?react";
// import DiamondIcon from "@icons/Diamond.svg?react";
import { useLocation } from 'react-router-dom';
import useFormHook from '@/hooks/useFormHook';
import {
  createTier,
  getBenefits,
  getTierById,
  getTiers,
  updateTier,
} from '@/services/api/marketing';
import useSWRMutation from 'swr/mutation';
import Button from '@/components/ui/Button/Button';
import MultilineInput from '@/components/ui/Input/MultilineInput';
import useSWR, { mutate } from 'swr';
import Modal from '@/components/ui/Modal/Modal';
import Close from '@icons/close.svg?react';
import { Transfer, List, Typography, Tag, Skeleton, message } from 'antd';
import { GiftOutlined, PlusOutlined } from '@ant-design/icons';
import { useToast } from '@/components/context/useContext';

const { Text } = Typography;

type Tier = {
  name: string;
  description?: string;
  loyaltyProgramId: number;
  limitBenefit: number;
};

type TierUpdate = {
  loyaltyTierId: number;
  description?: string;
  benefitIds: number[];
};

type TierType = {
  id: number;
  name: string;
  description?: string;
  loyaltyProgramId: number;
  limitBenefit: number;
  benefitIds: number[];
};

type Props = {
  prevStep?: () => void;
};

const Levels: React.FC<Props> = ({ prevStep }) => {
  const { t } = useTranslation();

  // const [isDiscount, setIsDiscount] = useState(false);
  // const [isBonus, setIsBonus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenUpdate, setIsModalOpenUpdate] = useState(false);
  const [tiers, setTiers] = useState<TierType[]>([]);
  const [tierId, setTierId] = useState(0);
  const location = useLocation();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { showToast } = useToast();

  const addTier = () => {
    setIsModalOpen(true);
  };

  const {
    data: tiersData,
    isLoading,
    isValidating,
  } = useSWR(
    [`get-tiers`, location.state.ownerId],
    () =>
      getTiers({
        programId: location.state.ownerId,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      onSuccess: () => {
        setIsInitialLoading(false);
      },
    }
  );

  const loadingTiers = isLoading || isValidating || isInitialLoading;

  const { data: tierByIdData, isLoading: loadingTier } = useSWR(
    tierId !== 0 ? [`get-tier-by-id`, tierId] : null,
    () => getTierById(tierId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: benefitsData } = useSWR([`get-benefits`], () => getBenefits(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const benefits =
    benefitsData?.map(ben => ({
      key: String(ben.props.id),
      title: ben.props.name,
      value: ben.props.id,
    })) || [];

  const benefitsDisplay: {
    name: string;
    benefitType: string;
    value: number;
  }[] =
    benefitsData?.map(ben => ({
      name: ben.props.name,
      benefitType: ben.props.benefitType,
      value: ben.props.id,
    })) || [];

  useEffect(() => {
    if (tierByIdData?.id) {
      setUpdateData({
        loyaltyTierId: tierByIdData.id,
        description: tierByIdData.description,
        benefitIds: tierByIdData.benefitIds,
      });
    }
  }, [tierByIdData]);

  useEffect(() => {
    const tiersArray = tiersData || [];
    if (tiersArray.length > 0) {
      const tiers: TierType[] = tiersArray.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        loyaltyProgramId: item.loyaltyProgramId,
        limitBenefit: item.limitBenefit,
        benefitIds: item.benefitIds,
      }));
      setTiers(tiers);
    }
  }, [t, tiersData]);

  // const [selectedOption, setSelectedOption] = useState<string>("percent");

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //     setSelectedOption(event.target.value);
  // };

  const defaultValues: Tier = {
    name: '',
    description: undefined,
    loyaltyProgramId: location.state.ownerId,
    limitBenefit: 0,
  };

  const updateValues: TierUpdate = {
    loyaltyTierId: tierId,
    description: '',
    benefitIds: [],
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

  const { trigger: createTi, isMutating } = useSWRMutation(
    ['create-loyalty-tier'],
    async () =>
      createTier({
        name: formData.name,
        description: formData.description,
        loyaltyProgramId: formData.loyaltyProgramId,
        limitBenefit: formData.limitBenefit,
      })
  );

  const { trigger: updateTi, isMutating: updatingTier } = useSWRMutation(
    ['update-loyalty-tier'],
    async () =>
      updateTier({
        loyaltyTierId: updateData.loyaltyTierId,
        description: updateData.description,
        benefitIds: updateData.benefitIds,
      })
  );

  type FieldType = 'name' | 'description' | 'loyaltyProgramId' | 'limitBenefit';

  const handleInputChange = (field: FieldType, value: string) => {
    const numericFields = ['limitBenefit'];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  type Field =
    | 'description'
    | 'loyaltyTierId'
    | 'benefitIds'
    | `benefitIds.${number}`;

  const handleUpdateChange = (field: Field, value: string) => {
    const numericFields = ['limitBenefit'];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setUpdateData(prev => ({ ...prev, [field]: updatedValue }));
    setUpdate(field, value);
  };

  const handleTransfer = (nextTargetKeys: (string | number | bigint)[]) => {
    const numericKeys = nextTargetKeys.map(key => Number(key));

    if (tierByIdData && numericKeys.length > tierByIdData.limitBenefit) {
      message.error(
        `You can only select up to ${tierByIdData.limitBenefit} benefits.`
      );
      return;
    }

    setUpdateData(prev => ({ ...prev, benefitIds: numericKeys }));
    setUpdate('benefitIds', numericKeys);
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
  };

  const onSubmit = async () => {
    try {
      const result = await createTi();
      if (result) {
        mutate([`get-tiers`, location.state.ownerId]);
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
      const result = await updateTi();
      if (result) {
        mutate([`get-tiers`, location.state.ownerId]);
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
            {t('marketing.addLevel')}
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
            <MultilineInput
              title={t('warehouse.desc')}
              classname="w-80"
              inputType="secondary"
              value={formData.description}
              changeValue={e =>
                handleInputChange('description', e.target.value)
              }
              {...register('description')}
            />
            <Input
              type="number"
              title={t('marketing.maxNo')}
              label={t('marketing.enter')}
              inputType="secondary"
              classname="w-80"
              value={formData.limitBenefit}
              changeValue={e =>
                handleInputChange('limitBenefit', e.target.value)
              }
              error={!!errors.limitBenefit}
              {...register('limitBenefit', {
                required: 'limitBenefit is required',
              })}
              helperText={errors.limitBenefit?.message || ''}
              showIcon={true}
              IconComponent={<div className="text-text02 text-lg">₽</div>}
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
            {tiers.find(item => item.id === tierId)?.name || ''}
          </h2>
          <Close
            onClick={() => {
              setIsModalOpenUpdate(false);
            }}
            className="cursor-pointer text-text01"
          />
        </div>
        {loadingTier ? (
          <div className="w-full max-w-[540px] space-y-4 flex flex-col">
            <Skeleton.Input active style={{ width: '100%', height: 120 }} />
            <Skeleton.Input active style={{ width: '100%', height: 300 }} />
            <div className="flex gap-3 mt-5">
              <Skeleton.Button active />
              <Skeleton.Button active />
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmitUpdate(onSubmitUpdate)}
            className="space-y-4 text-text02"
          >
            <div className="w-full max-w-[540px] space-y-4">
              <div className="w-full">
                <MultilineInput
                  title={t('warehouse.desc')}
                  classname="w-full"
                  inputType="secondary"
                  value={updateData.description}
                  changeValue={e =>
                    handleUpdateChange('description', e.target.value)
                  }
                  {...updateRegister('description')}
                />
              </div>

              <Transfer
                dataSource={benefits}
                targetKeys={updateData.benefitIds.map(String)}
                onChange={handleTransfer}
                render={item => item.title}
                showSearch
                listStyle={{
                  width: 'calc(50% - 8px)',
                  height: 300,
                }}
                style={{ width: '100%' }}
              />
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <Button
                title={'Сбросить'}
                handleClick={() => setIsModalOpenUpdate(false)}
                type="outline"
              />
              <Button
                title={'Сохранить'}
                form={true}
                isLoading={updatingTier}
              />
            </div>
          </form>
        )}
      </Modal>
      <div className="space-y-3">
        <div className="text-text02">
          <div>{t('marketing.create')}</div>
          <div>{t('marketing.toMan')}</div>
        </div>
        {loadingTiers ? (
          <div className="flex flex-col space-y-4">
            <Skeleton.Input active style={{ height: 150, width: '100%' }} />
          </div>
        ) : (
          tiers
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(tier => (
              <ExpandedCard
                key={tier.id}
                firstText={tier.name}
                secondText={tier.description || ''}
                Component={Profile}
                handleClick={() => {
                  setIsModalOpenUpdate(true);
                  setTierId(tier.id);
                }}
                buttonText={t('marketing.updateLevel')}
              >
                <div className="pl-0 sm:pl-14 space-y-6">
                  <div className="flex items-center justify-start gap-3">
                    <span className="text-base font-medium text-text01">
                      {t('marketing.limitBenefit')}
                    </span>
                    <Tag color="red">{tier.limitBenefit}</Tag>
                  </div>
                  {loadingTiers ? (
                    <Skeleton
                      active
                      paragraph={{ rows: 3 }}
                      title={false}
                      className="w-full max-w-[400px]"
                    />
                  ) : (
                    <List
                      itemLayout="horizontal"
                      dataSource={tier.benefitIds
                        .map(ben =>
                          benefitsDisplay.find(item => item.value === ben)
                        )
                        .filter(
                          (
                            item
                          ): item is {
                            name: string;
                            benefitType: string;
                            value: number;
                          } => item !== undefined
                        )
                        .sort((a, b) => a.name.localeCompare(b.name))}
                      renderItem={benefitItem => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <div className="h-10 w-5 flex items-center justify-center text-primary02 text-2xl">
                                <GiftOutlined />
                              </div>
                            }
                            title={
                              <Text className="font-medium text-text01">
                                {benefitItem?.name || '—'}
                              </Text>
                            }
                            description={
                              <Text type="secondary" className="text-text02">
                                {t(`marketing.${benefitItem?.benefitType}`) ||
                                  '—'}
                              </Text>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </div>
              </ExpandedCard>
            ))
        )}

        <div className="flex flex-col md:flex-row space-x-2">
          <div
            className="flex space-x-2 items-center text-primary02 cursor-pointer"
            onClick={addTier}
          >
            <PlusOutlined />
            <div>{t('marketing.addLevel')}</div>
          </div>
        </div>
        {location.state.ownerId === 0 && (
          <Button title="Назад" handleClick={prevStep} />
        )}
      </div>
    </div>
  );
};

export default Levels;
