import { useToast } from '@/components/context/useContext';
import useFormHook from '@/hooks/useFormHook';
import { useUser } from '@/hooks/useUserStore';
import { getPlacement } from '@/services/api/device';
import {
  ClientRequestBody,
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
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  Radio,
  Select,
  Spin,
} from 'antd';
import { Option } from 'antd/es/mentions';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

type ClientDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
};

const EditClientsDrawer: React.FC<ClientDrawerProps> = ({
  isOpen,
  onClose,
  clientId,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const defaultValues: ClientRequestBody = {
    contractType: '' as ContractType,
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
  };

  const [formData, setFormData] = useState<ClientRequestBody>(defaultValues);

  const [cardMode, setCardMode] = useState<'select' | 'custom'>('select');

  const [searchParams] = useSearchParams();
  const placementIdParam = searchParams.get('city') || undefined;
  const typeParam =
    (searchParams.get('contractType') as ContractType) || undefined;
  const tagIdsParam = searchParams.get('tagIds') || undefined;
  const phoneParam = searchParams.get('phone') || undefined;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { data: cityData } = useSWR('get-city', getPlacement, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const user = useUser();

  const params: GetCardsPayload = { organizationId: user.organizationId };

  const { data: cards } = useSWR(
    ['get-cards', params],
    (keyTuple: [string, GetCardsPayload]) => getCards(keyTuple[1]),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { trigger: createClientTrigger, isMutating } = useSWRMutation(
    'create-client',
    async () => createClient(formData)
  );

  const { trigger: updateClientTrigger, isMutating: updatingClient } =
    useSWRMutation('update-client', async () =>
      updateClient({ clientId: Number(clientId), ...formData })
    );

  const { data: clientDataById, isValidating: loadingClient } = useSWR(
    clientId ? ['get-client-by-id', clientId] : null,
    () => getClientById(Number(clientId)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    if (clientDataById) {
      setFormData({
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
      });
    }
  }, [clientDataById]);

  const handleInputChange = (field: keyof ClientRequestBody, value: any) => {
    const numericFields: (keyof ClientRequestBody)[] = [
      'number',
      'devNumber',
      'placementId',
      'monthlyLimit',
    ];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
    onClose();
  };

  const onSubmit = async () => {
    try {
      const result = clientId
        ? await updateClientTrigger()
        : await createClientTrigger();
      if (result) {
        mutate([
          `get-clients`,
          currentPage,
          pageSize,
          placementIdParam,
          typeParam,
          tagIdsParam,
          phoneParam,
        ]);
        resetForm();
      } else {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    } catch (error) {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  return (
    <Drawer
      title={clientId ? t('marketing.editClient') : t('marketing.new')}
      placement="right"
      size="large"
      onClose={resetForm}
      open={isOpen}
      className="custom-drawer"
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
          <div>
            <div className="text-text02 text-sm">{t('marketing.type')}</div>
            <Form.Item
              help={errors.type?.message}
              validateStatus={errors.type ? 'error' : undefined}
            >
              <Select
                placeholder={t('marketing.phys')}
                className="!w-96"
                options={[
                  { label: t('marketing.physical'), value: 'INDIVIDUAL' },
                  { label: t('marketing.legal'), value: 'CORPORATE' },
                ]}
                value={formData.contractType || undefined}
                onChange={value => {
                  setValue('contractType', value, { shouldValidate: true });
                  handleInputChange('contractType', value);
                }}
                size="large"
              />
            </Form.Item>
          </div>
          <div>
            <div className="text-text02 text-sm">{t('marketing.name')}</div>
            <Form.Item
              help={errors.name?.message}
              validateStatus={errors.name ? 'error' : undefined}
            >
              <Input
                placeholder={t('marketing.enterName')}
                className="w-96"
                value={formData.name}
                {...register('name', {
                  required:
                    clientId === undefined && t('validation.nameRequired'),
                })}
                onChange={e => handleInputChange('name', e.target.value)}
                size="large"
              />
            </Form.Item>
          </div>
          <div>
            <div className="text-text02 text-sm">{t('marketing.floor')}</div>
            <Select
              placeholder={t('warehouse.notSel')}
              className="w-80"
              value={formData.gender}
              options={[
                { label: t('marketing.man'), value: 'Man' },
                { label: t('marketing.woman'), value: 'Woman' },
              ]}
              {...register('gender')}
              onChange={value => handleInputChange('gender', value)}
              size="large"
            />
          </div>
          <div>
            <div className="text-text02 text-sm">{t('register.date')}</div>
            <DatePicker
              className="w-40"
              {...register('birthday')}
              value={formData.birthday ? dayjs(formData.birthday) : undefined}
              onChange={date =>
                handleInputChange(
                  'birthday',
                  date ? dayjs(date).format('YYYY-MM-DD') : undefined
                )
              }
              size="large"
            />
          </div>
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">{t('register.phone')}</div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.phone?.message}
              validateStatus={errors.phone ? 'error' : undefined}
            >
              <Input
                className="w-80 sm:w-96"
                {...register('phone', {
                  required: t('validation.phoneRequired'),
                  pattern: {
                    value: /^\+79\d{9}$/,
                    message: t('validation.phoneValidFormat'),
                  },
                })}
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                size="large"
              />
            </Form.Item>
          </div>
          <div>
            <div className="text-text02 text-sm">{'E-mail'}</div>
            <Input
              placeholder={t('marketing.enterEmail')}
              className="w-96"
              value={formData.email}
              {...register('email')}
              onChange={e => handleInputChange('email', e.target.value)}
              size="large"
            />
          </div>
          <div>
            <div className="text-text02 text-sm">{t('pos.city')}</div>
            <Select
              placeholder={t('warehouse.notSel')}
              className="w-80"
              value={formData.placementId}
              options={cityData?.map(item => ({
                label: item.region,
                value: item.id,
              }))}
              {...register('placementId')}
              onChange={value => handleInputChange('placementId', value)}
              size="large"
            />
          </div>
          <div>
            <div className="text-text02 text-sm">{t('equipment.comment')}</div>
            <Input.TextArea
              placeholder={t('marketing.about')}
              className="w-96"
              value={formData.comment}
              {...register('comment')}
              onChange={e => handleInputChange('comment', e.target.value)}
              size="large"
            />
          </div>
          {formData.contractType === ContractType.CORPORATE && (
            <div>
              <div className="text-text02 text-sm">{t('marketing.inn')}</div>
              <Input
                className="w-96"
                value={formData.inn}
                {...register('inn')}
                onChange={e => handleInputChange('inn', e.target.value)}
                size="large"
              />
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-4">
              <Radio.Group
                value={cardMode}
                onChange={e => setCardMode(e.target.value)}
              >
                <Radio value="select">{t('marketing.useExistingCard')}</Radio>
                <Radio value="custom">{t('marketing.enterCustomCard')}</Radio>
              </Radio.Group>

              <div>
                {cardMode === 'select' && (
                  <Select
                    className="w-80"
                    placeholder={t('marketing.selectCard')}
                    onChange={value =>
                      handleInputChange('cardId', Number(value))
                    }
                    value={formData.cardId}
                  >
                    {cards?.map(card => (
                      <Option key={String(card.id)} value={String(card.id)}>
                        {card.number}
                      </Option>
                    ))}
                  </Select>
                )}

                {cardMode === 'custom' && (
                  <>
                    <div>
                      <div className="text-text02 text-sm">
                        {t('marketing.card')}
                      </div>
                      <Input
                        type="number"
                        className="w-80"
                        value={formData.number}
                        {...register('number')}
                        onChange={e =>
                          handleInputChange('number', e.target.value)
                        }
                        size="large"
                      />
                    </div>
                    <div>
                      <div className="text-text02 text-sm">
                        {t('marketing.un')}
                      </div>
                      <Input
                        type="number"
                        className="w-80"
                        value={formData.devNumber}
                        {...register('devNumber')}
                        onChange={e =>
                          handleInputChange('devNumber', e.target.value)
                        }
                        size="large"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            {formData.contractType === ContractType.CORPORATE && (
              <div>
                <div className="text-text02 text-sm">
                  {t('marketing.limit')}
                </div>
                <Input
                  type="number"
                  className="w-80"
                  value={formData.monthlyLimit}
                  {...register('monthlyLimit')}
                  onChange={e =>
                    handleInputChange('monthlyLimit', e.target.value)
                  }
                  size="large"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <Button className="btn-outline-primary" onClick={resetForm}>
              {t('organizations.cancel')}
            </Button>
            <Button className={`btn-primary !bg-red-600 !hover:bg-red-300`}>
              {t('marketing.delete')}
            </Button>
            <Button
              htmlType="submit"
              className="btn-primary"
              loading={clientId ? updatingClient : isMutating}
            >
              {t('organizations.save')}
            </Button>
          </div>
        </form>
      )}
    </Drawer>
  );
};

export default EditClientsDrawer;
