import React, { useMemo, useState } from 'react';
import { Button, Input, Modal, Select, Steps, Transfer } from 'antd';
import useSWR, { mutate } from 'swr';
import { createBenefit, createTier, getBenefits, getTierById, updateTier } from '@/services/api/marketing';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/context/useContext';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  loyaltyProgramId: number;
  tierId?: number;
};

const LevelsBonusesModal: React.FC<Props> = ({ open, onClose, loyaltyProgramId, tierId }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [current, setCurrent] = useState(0);
  const [createdLevelId, setCreatedLevelId] = useState<number | null>(null);
  const [selectedBenefitKeys, setSelectedBenefitKeys] = useState<string[]>([]);
  const isEdit = !!tierId;

  const [searchParams] = useSearchParams();

  const ltyProgramId = searchParams.get("loyaltyProgramId")

  const levelDefaults = { name: '', description: '', limitBenefit: 0, promotionSpendAmount: 0 };
  const [levelForm, setLevelForm] = useState(levelDefaults);
  const { handleSubmit: handleSubmitLevel, errors: levelErrors, setValue: setLevelValue, reset: resetLevel } =
    useFormHook(levelForm);
  const handleLevelChange = (field: keyof typeof levelDefaults, value: string | number) => {
    setLevelForm(prev => ({ ...prev, [field]: value }));
    setLevelValue(field, value as any);
  };

  const { trigger: doCreateTier, isMutating: creatingTier } = useSWRMutation(
    ['create-loyalty-tier'],
    async () =>
      createTier({
        name: levelForm.name,
        description: levelForm.description || undefined,
        loyaltyProgramId,
        limitBenefit: Number(levelForm.limitBenefit) || 0,
      })
  );

  const { data: benefitsData } = useSWR([`get-benefits`], () => getBenefits(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });
  const benefitOptions = useMemo(
    () => (benefitsData || []).map(b => ({ key: String(b.props.id), title: b.props.name, id: b.props.id })),
    [benefitsData]
  );

  const benefitDefaults = { name: '', type: '', bonus: 0, benefitActionTypeId: undefined as number | undefined };
  const [benefitForm, setBenefitForm] = useState(benefitDefaults);
  const { handleSubmit: handleSubmitBenefit, errors: benefitErrors, setValue: setBenefitValue, reset: resetBenefit } =
    useFormHook(benefitForm);
  const handleBenefitChange = (field: keyof typeof benefitDefaults, value: string | number | undefined) => {
    setBenefitForm(prev => ({ ...prev, [field]: value as any }));
    setBenefitValue(field as any, value as any);
  };
  const { trigger: doCreateBenefit, isMutating: creatingBenefit } = useSWRMutation(
    ['create-benefit'],
    async () =>
      createBenefit({
        name: benefitForm.name,
        type: benefitForm.type as any,
        bonus: Number(benefitForm.bonus) || 0,
        benefitActionTypeId: benefitForm.benefitActionTypeId,
        ltyProgramId: Number(ltyProgramId) || 0
      })
  );

  useEffect(() => {
    const prefillForEdit = async () => {
      if (open && isEdit && tierId) {
        try {
          const tier = await getTierById(tierId);
          setCreatedLevelId(tier.id);
          setLevelForm({
            name: tier.name || '',
            description: tier.description || '',
            limitBenefit: tier.limitBenefit || 0,
            promotionSpendAmount: 0,
          });
          setSelectedBenefitKeys((tier.benefitIds || []).map(id => String(id)));
          // Stay on the first step; user can navigate to the next step manually
        } catch {
          showToast(t('errors.other.errorDuringFormSubmission'), 'error');
        }
      }
    };
    prefillForEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, tierId]);

  const submitCreateLevel = async () => {
    try {
      const res = await doCreateTier();
      if (res?.props?.id) {
        setCreatedLevelId(res.props.id);
        setCurrent(1);
        showToast(t('routes.savedSuccessfully'), 'success');
      }
    } catch {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const submitCreateBenefit = async () => {
    try {
      const res = await doCreateBenefit();
      if (res?.props?.id) {
        await mutate([`get-benefits`]);
        resetBenefit(benefitDefaults);
        showToast(t('routes.savedSuccessfully'), 'success');
      }
    } catch {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const { trigger: doUpdateTier, isMutating: updatingTier } = useSWRMutation(
    ['update-loyalty-tier'],
    async () =>
      updateTier({
        loyaltyTierId: createdLevelId!,
        description: levelForm.description || undefined,
        benefitIds: selectedBenefitKeys.map(k => Number(k)),
      })
  );

  const handleSave = async () => {
    try {
      await doUpdateTier();
      await mutate([`get-tiers`, loyaltyProgramId]);
      handleClose();
      showToast(t('routes.savedSuccessfully'), 'success');
    } catch {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const handleClose = () => {
    setCurrent(0);
    setCreatedLevelId(null);
    setSelectedBenefitKeys([]);
    resetLevel(levelDefaults);
    resetBenefit(benefitDefaults);
    onClose();
  };

  return (
    <Modal open={open} onCancel={handleClose} footer={null} width={860}>
        <div className="flex justify-center">
            <div className="w-[500px]">
                <Steps
                    size="small"
                    current={current}
                    items={[
                    { title: t('marketing.addLevel', { defaultValue: 'Добавить уровень' }) },
                    { title: t('marketing.addBen', { defaultValue: 'Добавить преимущество' }) },
                    ]}
                    style={{ marginBottom: 16 }}
                />
            </div>
        </div>

      {current === 0 && (
        <form onSubmit={handleSubmitLevel(submitCreateLevel)}>
          <div className="space-y-8">
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="font-semibold text-text01 md:col-span-1">
                  {t('marketingLoyalty.basicData', { defaultValue: 'Основные данные' })}
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-text01">
                      {t('marketing.levelName', { defaultValue: 'Название уровня' })}
                    </div>
                    <Input
                      placeholder={t('profile.namePlaceholder')}
                      value={levelForm.name}
                      onChange={e => handleLevelChange('name', e.target.value)}
                      disabled={isEdit}
                    />
                    {!!levelErrors.name && (
                      <div className="text-red-500 text-xs mt-1">{levelErrors.name.message}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text01">
                      {t('marketing.levelDescription', { defaultValue: 'Описание уровня' })}
                    </div>
                    <Input.TextArea
                      rows={4}
                      value={levelForm.description}
                      onChange={e => handleLevelChange('description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="font-semibold text-text01 md:col-span-1">
                  {t('marketing.upDown', { defaultValue: 'Повышение/понижение' })}
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-text01">
                      {t('marketing.promotionSpend', { defaultValue: 'Сумма трат для повышения уровня' })}
                    </div>
                    <Input
                      type="number"
                      suffix={<div className="text-text02">₽</div>}
                      value={levelForm.limitBenefit}
                      onChange={e => handleLevelChange('limitBenefit', Number(e.target.value))}
                      disabled={isEdit}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleClose}>{t('analysis.reset', { defaultValue: 'Сбросить' })}</Button>
            {isEdit ? (
              <Button type="primary" onClick={() => setCurrent(1)}>{t('common.next', { defaultValue: 'Далее' })}</Button>
            ) : (
              <Button htmlType="submit" type="primary" loading={creatingTier}>{t('common.next', { defaultValue: 'Далее' })}</Button>
            )}
          </div>
        </form>
      )}

      {current === 1 && (
        <div>
          <div className="w-full flex justify-center">
            <Transfer
              dataSource={benefitOptions}
              targetKeys={selectedBenefitKeys}
              onChange={keys => setSelectedBenefitKeys(keys as string[])}
              render={item => item.title as any}
              listStyle={{ width: 300, height: 280 }}
              titles={[
                t('marketing.available', { defaultValue: 'Доступные бонусы' }),
                t('marketing.selected', { defaultValue: 'Выбранные бонусы' }),
              ]}
              showSelectAll={false}
              style={{ width: 720 }}
            />
          </div>

          <div className="border-t border-gray-200 my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="font-semibold text-text01 md:col-span-1">
              {t('marketing.createNew', { defaultValue: 'Создай новый' })}
            </div>
            <div className="md:col-span-2">
              <form onSubmit={handleSubmitBenefit(submitCreateBenefit)}>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-text01">{t('equipment.name', { defaultValue: 'Название уровня' })}</div>
                    <Input value={benefitForm.name} onChange={e => handleBenefitChange('name', e.target.value)} />
                    {!!benefitErrors.name && <div className="text-red-500 text-xs mt-1">{benefitErrors.name.message}</div>}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text01">{t('marketing.ty', { defaultValue: 'Тип' })}</div>
                    <Select
                      value={benefitForm.type as any}
                      onChange={v => handleBenefitChange('type', v)}
                      options={[
                        { label: t('marketing.CASHBACK'), value: 'CASHBACK' },
                        { label: t('marketing.DISCOUNT'), value: 'DISCOUNT' },
                        { label: t('marketing.GIFT_POINTS'), value: 'GIFT_POINTS' },
                      ]}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text01">{t('marketing.value', { defaultValue: 'Значение' })}</div>
                    <Input type="number" value={benefitForm.bonus} onChange={e => handleBenefitChange('bonus', Number(e.target.value))} />
                  </div>
                  <div className="pt-2">
                    <Button htmlType="submit" type="primary" loading={creatingBenefit}>{t('marketing.create', { defaultValue: 'Создать' })}</Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="flex justify-between gap-2 mt-6">
            <div>
              <Button onClick={() => setCurrent(0)}>{t('common.back', { defaultValue: 'Назад' })}</Button>
            </div>
            <Button onClick={handleClose}>{t('analysis.reset', { defaultValue: 'Сбросить' })}</Button>
            <Button type="primary" loading={updatingTier} onClick={handleSave}>{t('routes.save', { defaultValue: 'Сохранить' })}</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LevelsBonusesModal;


