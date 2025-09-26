import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BasicBouns from '@icons/BasicBonus.svg?react';
import useSWR from 'swr';
import { getPoses } from '@/services/api/equipment';
import {
  Select,
  Row,
  Col,
  Tag,
  Card,
  Input,
  Radio,
  RadioChangeEvent,
  Button,
  Form,
  message,
  Spin,
} from 'antd';
import Percentage from '@icons/Percentage.svg?react';
import DiamondIcon from '@icons/DiamondIcon.svg?react';
import { useUser } from '@/hooks/useUserStore';
import {
  getLoyaltyPrograms,
  getMarketingCampaignById,
  LoyaltyProgramsResponse,
  MarketingCampaignRequest,
  MarketingCampaignResponse,
  MarketingCampaignType,
  MarketingDiscountType,
  updateMarketingCampaign,
  UpdateMarketingCampaignRequest,
} from '@/services/api/marketing';
import useSWRMutation from 'swr/mutation';
import { createMarketingCampaign } from '@/services/api/marketing';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LaunchModal from './LaunchModal';
import { MarketingCampaignStatus } from '@/utils/constants';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const marketingCampaignId = searchParams.get('marketingCampaignId');

  const { control, handleSubmit, setValue, reset, watch } =
    useForm<MarketingCampaignRequest>({
      defaultValues: {
        name: '',
        ltyProgramId: undefined,
        posIds: [],
        type: MarketingCampaignType.DISCOUNT,
        discountType: MarketingDiscountType.PERCENTAGE,
        discountValue: 0,
        promocode: '',
        launchDate: undefined,
        endDate: undefined,
        status: MarketingCampaignStatus.DRAFT,
        ltyProgramParticipantId: undefined,
      },
    });

  const user = useUser();

  const { data: loyaltyProgramsData } = useSWR<LoyaltyProgramsResponse[]>(
    user.organizationId ? ['get-loyalty-programs', user.organizationId] : null,
    () => getLoyaltyPrograms(user.organizationId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: posData } = useSWR(
    user.organizationId ? [`get-pos`, user.organizationId] : null,
    () =>
      getPoses({
        organizationId: user.organizationId,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const { data: marketCampaignByIdData, isLoading: loadingMarketingCampaign, isValidating } = useSWR(
    marketingCampaignId
      ? [`get-market-campaign-by-id`, marketingCampaignId]
      : null,
    () => getMarketingCampaignById(Number(marketingCampaignId)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  useEffect(() => {
    if (marketCampaignByIdData) {
      reset({
        name: marketCampaignByIdData.name,
        ltyProgramId: marketCampaignByIdData.ltyProgramId,
        posIds: marketCampaignByIdData.posIds,
        type: marketCampaignByIdData.type as MarketingCampaignType,
        discountType:
          marketCampaignByIdData.discountType && marketCampaignByIdData.discountType === MarketingDiscountType.PERCENTAGE
            ? MarketingDiscountType.PERCENTAGE
            : MarketingDiscountType.FIXED,
        discountValue: marketCampaignByIdData.discountValue,
        promocode: marketCampaignByIdData.promocode ?? '',
        launchDate: marketCampaignByIdData.launchDate
          ? dayjs(marketCampaignByIdData.launchDate).toDate()
          : undefined,
        endDate: marketCampaignByIdData.endDate
          ? dayjs(marketCampaignByIdData.endDate).toDate()
          : undefined,
        status: MarketingCampaignStatus.DRAFT
      });
      
      if (marketCampaignByIdData.ltyProgramId) {
        const selectedProgram = loyaltyProgramsData?.find(item => item.props.id === marketCampaignByIdData.ltyProgramId);
        if (selectedProgram) {
          setValue('ltyProgramParticipantId', selectedProgram.props.participantId);
        }
      }
    }
  }, [marketCampaignByIdData, reset, loyaltyProgramsData, setValue]);

  const { trigger, isMutating } = useSWRMutation<
    MarketingCampaignResponse,
    Error,
    string,
    MarketingCampaignRequest
  >('user/loyalty/marketing-campaigns', async (_url, { arg }) =>
    createMarketingCampaign(arg)
  );

  const { trigger: triggerUpdate, isMutating: isMutatingUpdate } =
    useSWRMutation<
      MarketingCampaignResponse,
      Error,
      [string, number],
      UpdateMarketingCampaignRequest
    >(
      ['user/loyalty/marketing-campaigns', Number(marketingCampaignId)],
      async ([, id], { arg }) => updateMarketingCampaign(id, arg)
    );

  const posIds = Array.isArray(watch('posIds')) ? watch('posIds') : [];

  const handleSelectBranch = (value: number | undefined) => {
    if (typeof value === 'number' && !posIds.includes(value)) {
      setValue('posIds', [...posIds, value]);
    }
  };

  const handleDeselectBranch = (removed: number) => {
    setValue('posIds', posIds.filter(val => val !== removed));
  };

  const onSubmit = async (data: MarketingCampaignRequest) => {
    try {
      const req = {
        ...data,
        posIds: data.posIds,
        ltyProgramId: data.ltyProgramId,

        type: data.type,
        discountType: data.discountType || MarketingDiscountType.PERCENTAGE,
        discountValue:
          data.type === MarketingCampaignType.DISCOUNT
            ? Number(data.discountValue)
            : data.discountType === MarketingDiscountType.PERCENTAGE
              ? Number(data.discountValue)
              : Number(data.discountValue),
        promocode:
          data.type === MarketingCampaignType.PROMOCODE
            ? data.promocode
            : undefined,
        launchDate: data.launchDate,
        ltyProgramParticipantId: data.ltyProgramParticipantId,
      };

      let result;
      if (marketingCampaignId) {
        result = await triggerUpdate(req);
      } else {
        result = await trigger(req);
      }

      if (result) {
        navigate(-1);
      }
    } catch (e) {
      message.error(t("marketing.errorCampaign"));
    }
  };

  if (loadingMarketingCampaign || isValidating) {
    return (
      <div className="h-[600px] w-full flex justify-center items-center">
        <Spin />
      </div>
    );
  }


  return (
    <Card
      className="rounded-2xl shadow-card w-full md:max-w-[1400px]"
      styles={{
        body: {
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row align="middle" justify="space-between" gutter={[16, 16]} wrap>
          <Col flex="none">
            <BasicBouns className="w-10 h-10" />
          </Col>
          <Col flex="auto">
            <div className={`text-lg font-semibold`}>
              {t('marketing.basic')}
            </div>
            <div className="text-text02">{t('marketing.setup')}</div>
          </Col>
        </Row>
        <div className="ml-14">
          <div className="text-text01 font-semibold text-2xl">
            {t('marketing.branch')}
          </div>
          <div className="text-text02">{t('marketing.setUpBranch')}</div>
          <div className="text-text02">{t('marketing.branchCan')}</div>
          <div className="mt-10">
            <div className="text-text02 text-sm">{t('roles.name')}</div>
            <Controller
              name="name"
              control={control}
              rules={{ required: t('validation.nameRequired') }}
              render={({ field, fieldState }) => (
                <Form.Item
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                  style={{ marginBottom: 16 }}
                >
                  <Input
                    {...field}
                    placeholder={t('roles.name')}
                    className="w-80"
                  />
                </Form.Item>
              )}
            />
          </div>
          <Row style={{ marginTop: 30 }}>
            <Col xs={24} sm={9}>
              <div className="text-text02 text-sm">
                {t('marketing.loyalty')}
              </div>
              <Controller
                name="ltyProgramId"
                control={control}
                rules={{ required: t('validation.loyaltyProgramRequired') }}
                render={({ field, fieldState }) => (
                  <Form.Item
                    validateStatus={fieldState.error ? 'error' : ''}
                    help={fieldState.error?.message}
                    style={{ marginBottom: 16 }}
                  >
                    <Select
                      {...field}
                      placeholder={t('marketing.selectLoyaltyProgram')}
                      options={loyaltyProgramsData?.map(item => ({
                        label: item.props.name,
                        value: item.props.id,
                      }))}
                      allowClear
                      className="w-full sm:max-w-80"
                      onChange={(value) => {
                        field.onChange(value);
                        const selectedProgram = loyaltyProgramsData?.find(item => item.props.id === value);
                        if (selectedProgram) {
                          setValue('ltyProgramParticipantId', selectedProgram.props.participantId);
                        } else {
                          setValue('ltyProgramParticipantId', undefined as any);
                        }
                      }}
                    />
                  </Form.Item>
                )}
              />
            </Col>
            <Col xs={24} sm={15}>
              <div className="text-text02 text-sm">
                {t('marketing.carWash')}
              </div>
              <Controller
                name="posIds"
                control={control}
                rules={{ required: t('validation.posRequired') }}
                render={({ field, fieldState }) => (
                  <Form.Item
                    validateStatus={fieldState.error ? 'error' : ''}
                    help={fieldState.error?.message}
                    style={{ marginBottom: 16 }}
                  >
                    <Select
                      {...field}
                      placeholder={t('marketing.selectBranch')}
                      value={undefined}
                      onSelect={handleSelectBranch}
                      options={posData
                        ?.filter(
                          option => !posIds.includes(option.id)
                        )
                        .map(item => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      popupRender={menu => <div>{menu}</div>}
                      className="w-full sm:max-w-80"
                      allowClear
                    />
                  </Form.Item>
                )}
              />
              <div style={{ marginTop: 10 }}>
                {posIds.map(branch => (
                  <Tag
                    key={branch}
                    closable
                    onClose={() => handleDeselectBranch(branch)}
                    style={{
                      fontWeight: 500,
                      fontSize: 15,
                      marginBottom: 8,
                      padding: '4px 12px',
                    }}
                  >
                    {posData?.find(item => item.id === branch)?.name}
                  </Tag>
                ))}
              </div>
            </Col>
          </Row>
          <Row className="flex flex-col sm:flex-row gap-8 mt-10">
            <Col xs={24} sm={9}>
              <Card
                styles={{ body: { padding: 0 } }}
                className={`flex-1 rounded-3xl ${watch('type') === MarketingCampaignType.DISCOUNT ? 'bg-white border-2 border-primary02' : 'bg-[#F6F8FB]'} flex flex-col items-center justify-center cursor-pointer transition-shadow hover:shadow-md h-28 w-80`}
                onClick={() => {
                  setValue('type', MarketingCampaignType.DISCOUNT);
                }}
              >
                <div className="py-10 flex flex-col items-center justify-center">
                  <div
                    className={`flex items-center space-x-2 ${watch('type') === MarketingCampaignType.DISCOUNT ? 'text-primary02' : 'text-text01'}`}
                  >
                    <Percentage className="w-6 h-6" />
                    <div className={`font-semibold text-lg`}>
                      {t('marketing.dis')}
                    </div>
                  </div>
                  <div
                    className={`mt-2  ${watch('type') === MarketingCampaignType.DISCOUNT ? 'text-text01' : 'text-text02'} font-normal`}
                  >
                    {t('marketing.give')}
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card
                styles={{ body: { padding: 0 } }}
                className={`flex-1 rounded-3xl ${watch('type') === MarketingCampaignType.PROMOCODE ? 'bg-white border-2 border-primary02' : 'bg-[#F6F8FB]'} flex flex-col items-center justify-center cursor-pointer transition-shadow hover:shadow-md h-28 w-80`}
                onClick={() => {
                  setValue('type', MarketingCampaignType.PROMOCODE);
                }}
              >
                <div className="py-10 flex flex-col items-center justify-center">
                  <div
                    className={`flex items-center space-x-2 ${watch('type') === MarketingCampaignType.PROMOCODE ? 'text-primary02' : 'text-text01'}`}
                  >
                    <DiamondIcon className="w-6 h-6" />
                    <div className="font-semibold text-lg">
                      {t('subscriptions.promo')}
                    </div>
                  </div>
                  <div
                    className={`mt-2  ${watch('type') === MarketingCampaignType.PROMOCODE ? 'text-text01' : 'text-text02'} font-normal`}
                  >
                    {t('marketing.createPromotionalCode')}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
          {watch('type') === MarketingCampaignType.DISCOUNT && (
            <div className="mt-10">
              <Controller
                name="discountValue"
                control={control}
                rules={{ required: t('validation.discountValueRequired'), validate: (value) => value > 0 || t('validation.discountValuePositive') }}
                render={({ field, fieldState }) => (
                  <Form.Item
                    validateStatus={fieldState.error ? 'error' : ''}
                    help={fieldState.error?.message}
                    style={{ marginBottom: 16 }}
                  >
                  <Input
                    {...field}
                    placeholder={t('marketing.enterDisc')}
                    type="number"
                    className="w-80"
                    suffix={<div>%</div>}
                  />
                  </Form.Item>
                )}
              />
            </div>
          )}
          {watch('type') === MarketingCampaignType.PROMOCODE && (
            <div className="mt-10 space-y-6">
              <div className="font-semibold text-2xl">
                {t('subscriptions.promo')}
              </div>
              <Controller
                name="promocode"
                control={control}
                rules={{ required: t('marketing.promoRequired') }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={t('marketing.enterNamePromo')}
                    className="w-80"
                  />
                )}
              />
              <Radio.Group
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
                onChange={(e: RadioChangeEvent) => {
                  setValue('discountType', e.target.value);
                }}
                value={watch('discountType')}
                options={[
                  {
                    value: MarketingDiscountType.PERCENTAGE,
                    label: t('marketing.per'),
                  },
                  {
                    value: MarketingDiscountType.FIXED,
                    label: t('marketing.fix'),
                  },
                ]}
              />
              <Controller
                name="discountValue"
                control={control}
                rules={{ required: t('marketing.amountRequired') }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={
                      watch('discountType') === MarketingDiscountType.PERCENTAGE
                        ? t('marketing.enterPer')
                        : t('marketing.enterBon')
                    }
                    type="number"
                    className="w-80"
                    suffix={
                      watch('discountType') ===
                      MarketingDiscountType.PERCENTAGE ? (
                        <div>%</div>
                      ) : (
                        <div>₽</div>
                      )
                    }
                  />
                )}
              />
            </div>
          )}
        </div>
        <Row gutter={[16, 16]} justify="start" className="pl-0 sm:pl-14 mt-5">
          <Col>
            <Button type="primary" onClick={() => setModalOpen(true)}>
              {t('organizations.save')}
            </Button>
          </Col>
          <Col>
            <Button type="default" onClick={() => navigate(-1)}>
              {t('marketing.close')}
            </Button>
          </Col>
        </Row>
        <LaunchModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          loading={isMutating || isMutatingUpdate}
          onLaunchNow={() => {
            setValue('launchDate', dayjs().toDate());
            setValue('status', MarketingCampaignStatus.ACTIVE);
            handleSubmit(onSubmit)();
          }}
          onLaunch={() => {
            handleSubmit(onSubmit)();
          }}
          control={control}
        />
      </form>
    </Card>
  );
};

export default Settings;
