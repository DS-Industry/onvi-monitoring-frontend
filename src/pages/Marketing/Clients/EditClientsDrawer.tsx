import { useToast } from '@/components/context/useContext';
import { useUser } from '@/hooks/useUserStore';

import {
  ClientRequestBody,
  ClientUpdate,
  createClient,
  getCards,
  GetCardsPayload,
  getClientById,
  updateClient,
} from '@/services/api/marketing';
import {
  ContractType,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { Button, DatePicker, Drawer, Form, Input, message, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { useForm, Controller } from 'react-hook-form';

type ClientDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
};

const { Option } = Select;

const EditClientsDrawer: React.FC<ClientDrawerProps> = ({
  isOpen,
  onClose,
  clientId,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const user = useUser();

  const defaultValues: ClientRequestBody = useMemo(
    () => ({
      contractType: ContractType.INDIVIDUAL,
      name: '',
      birthday: undefined,
      phone: '',
      email: undefined,
      comment: '',
      gender: undefined,
      inn: undefined,
      placementId: undefined,
      devNumber: undefined,
      number: undefined,
      monthlyLimit: undefined,
      cardId: undefined,
    }),
    []
  );

  const [searchParams] = useSearchParams();
  const placementIdParam = searchParams.get('city') || undefined;
  const typeParam =
    (searchParams.get('contractType') as ContractType) || undefined;
  const tagIdsParam = searchParams.get('tagIds') || undefined;
  const phoneParam = searchParams.get('phone') || undefined;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientRequestBody>({ defaultValues });

  useEffect(() => {
    if (!isOpen) {
      reset(defaultValues);
    }
  }, [isOpen]);

  const cardParams: GetCardsPayload = useMemo(
    () => ({
      organizationId: user.organizationId,
      unnasigned: true,
    }),
    [user.organizationId]
  );

  const { data: cards } = useSWR(['get-cards', cardParams], ([, params]) =>
    getCards(params)
  );

  const { trigger: createClientTrigger, isMutating: creatingClient } =
    useSWRMutation('create-client', (_, { arg }: { arg: ClientRequestBody }) =>
      createClient(arg)
    );

  const { trigger: updateClientTrigger, isMutating: updatingClient } =
    useSWRMutation('update-client', (_, { arg }: { arg: ClientUpdate }) =>
      updateClient(arg)
    );

  const { data: clientDataById, isValidating: loadingClient } = useSWR(
    clientId ? ['get-client-by-id', clientId] : null,
    () => getClientById(Number(clientId))
  );

  useEffect(() => {
    if (isOpen) {
      if (!clientId) {
        reset(defaultValues);
      } else if (clientDataById) {
        reset({
          contractType: clientDataById.contractType,
          name: clientDataById.name,
          phone: clientDataById.phone,
          comment: clientDataById.comment,
          placementId: clientDataById.placementId,
          birthday: clientDataById.birthday
            ? dayjs(clientDataById.birthday).toDate()
            : undefined,
          email: clientDataById.email,
          inn: clientDataById.inn,
          gender: clientDataById.gender,
          devNumber: clientDataById.card?.devNumber,
          number: clientDataById.card?.number,
          monthlyLimit: clientDataById.card?.monthlyLimit,
          cardId: clientDataById.card?.id,
        });
      }
    } else {
      reset(defaultValues);
    }
  }, [isOpen, clientId, clientDataById, reset, defaultValues]);

  const onSubmit = async (values: ClientRequestBody) => {
    try {
      const result = clientId
        ? await updateClientTrigger({ clientId, ...values })
        : await createClientTrigger(values);
      
      if (result) {
        message.success(t('routes.savedSuccessfully'));

        mutate([
          'get-clients',
          currentPage,
          pageSize,
          placementIdParam,
          typeParam,
          tagIdsParam,
          phoneParam,
        ]);
        reset(defaultValues);
        onClose();
      } else {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    } catch (error) {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const allCards = useMemo(() => {
    if (!clientDataById?.card) return cards || [];
    const exists = (cards || []).some(c => c.id === clientDataById.card?.id);
    return exists ? cards || [] : [...(cards || []), clientDataById.card];
  }, [cards, clientDataById]);

  const genderOptions = useMemo(
    () => [
      { value: 'MALE', label: t('marketing.man') },
      { value: 'FEMALE', label: t('marketing.woman') },
    ],
    [t]
  );

  return (
    <Drawer
      title={clientId ? t('marketing.editClient') : t('marketing.new')}
      placement="right"
      size="large"
      onClose={onClose}
      open={isOpen}
      className="custom-drawer"
      zIndex={9999}
    >
      {loadingClient ? (
        <div className="flex justify-center items-center h-full">
          <Spin size="large" />
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <span className="font-semibold text-sm text-text01">
            {t('routine.fields')}
          </span>
          <span className="text-errorFill">*</span>
          <span className="font-semibold text-sm text-text01">
            {t('routine.are')}
          </span>
          <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">
            {t('warehouse.basic')}
          </div>

          <Form.Item
            label={t('marketing.type')}
            help={errors.contractType?.message}
            validateStatus={errors.contractType ? 'error' : undefined}
            labelCol={{ span: 24 }}
            className="w-86"
          >
            <Controller
              name="contractType"
              control={control}
              rules={{
                required: t('validation.contractTypeRequired') as string,
              }}
              render={({ field }) => (
                <Select {...field} className="w-86" size="large">
                  <Option value={ContractType.INDIVIDUAL}>
                    {t('marketing.physical')}
                  </Option>
                  <Option value={ContractType.CORPORATE}>
                    {t('marketing.legal')}
                  </Option>
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label={t('marketing.name')}
            labelCol={{ span: 24 }}
            help={errors.name?.message}
            validateStatus={errors.name ? 'error' : undefined}
          >
            <Controller
              name="name"
              control={control}
              rules={{
                required: t('validation.nameRequired') as string,
              }}
              render={({ field }) => (
                <Input
                  placeholder={t('marketing.enterName')}
                  className="w-86"
                  {...field}
                  size="large"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={t('marketing.phone') || 'Phone Number'}
            labelCol={{ span: 24 }}
            help={errors.phone?.message}
            validateStatus={errors.phone ? 'error' : undefined}
          >
            <Controller
              name="phone"
              control={control}
              rules={{
                required: t('validation.phoneRequired') as string,
                pattern: {
                  value: /^\+?79\d{9}$/,
                  message: t('validation.phoneValidFormat'),
                },
              }}
              render={({ field }) => (
                <Input className="w-86" {...field} size="large" />
              )}
            />
          </Form.Item>

          <Form.Item
            label={t('marketing.birth') || 'Birthday'}
            labelCol={{ span: 24 }}
          >
            <Controller
              name="birthday"
              control={control}
              render={({ field }) => (
                <DatePicker
                  className="w-86"
                  value={field.value ? dayjs(field.value) : undefined}
                  onChange={d => field.onChange(d ? d.toDate() : undefined)}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            className="w-86"
            label={t('marketing.floor')}
            labelCol={{ span: 24 }}
          >
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-86"
                  placeholder={t('warehouse.notSel')}
                  options={genderOptions}
                />
              )}
            />
          </Form.Item>

          <Form.Item label={t('marketing.enterEmail')} labelCol={{ span: 24 }}>
            <Controller
              name="email"
              control={control}
              rules={{
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('validation.invalidEmailFormat'),
                },
              }}
              render={({ field }) => (
                <Input
                  className="w-86"
                  placeholder={t('marketing.enterEmail')}
                  {...field}
                  size="large"
                />
              )}
            />
          </Form.Item>

          <Form.Item label={t('marketing.about')} labelCol={{ span: 24 }}>
            <Controller
              name="comment"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  className="w-86"
                  placeholder={t('marketing.about')}
                  {...field}
                  size="large"
                  rows={3}
                />
              )}
            />
          </Form.Item>

          <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">
            {t('marketing.loyalty')}
          </div>
          <Form.Item
            className="w-86"
            label={t('marketing.card')}
            labelCol={{ span: 24 }}
          >
            <Controller
              name="cardId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-86"
                  placeholder={t('marketing.selectCard')}
                  value={field.value ? String(field.value) : undefined}
                  onChange={val => field.onChange(Number(val))}
                >
                  {allCards.map(card => (
                    <Option key={String(card.id)} value={String(card.id)}>
                      {card.number}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Button
            htmlType="submit"
            className="btn-primary"
            loading={clientId ? updatingClient : creatingClient}
          >
            {t('organizations.save')}
          </Button>
        </form>
      )}
    </Drawer>
  );
};

export default EditClientsDrawer;
