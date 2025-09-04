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
  Modal,
  DatePicker,
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
} from '@/services/api/marketing';
import useSWRMutation from 'swr/mutation';
import { createMarketingCampaign } from '@/services/api/marketing';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [selectedCard, setSelectedCard] = useState<MarketingCampaignType>(
    MarketingCampaignType.DISCOUNT
  );
  const [radioValue, setRadioValue] = useState<MarketingDiscountType>(
    MarketingDiscountType.PERCENTAGE
  );
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const marketingCampaignId = searchParams.get('marketingCampaignId');

  const { control, handleSubmit, setValue, reset } = useForm<MarketingCampaignRequest>(
    {
      defaultValues: {
        name: '',
        ltyProgramId: undefined,
        posIds: [],
        type: selectedCard,
        discountType: radioValue,
        discountValue: 0,
        promocode: '',
        launchDate: undefined,
      },
    }
  );

  const user = useUser();

  const { data: loyaltyProgramsData } = useSWR<LoyaltyProgramsResponse[]>(
    'get-loyalty-programs',
    () => getLoyaltyPrograms(user.organizationId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: posData } = useSWR(
    [`get-pos`],
    () =>
      getPoses({
        organizationId: user.organizationId,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: marketCampaignByIdData } = useSWR(
    marketingCampaignId
      ? [`get-market-campaign-by-id`, marketingCampaignId]
      : null,
    () => getMarketingCampaignById(Number(marketingCampaignId)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  useEffect(() => {
  if (marketCampaignByIdData) {
    reset({
      name: marketCampaignByIdData.name,
      ltyProgramId: marketCampaignByIdData.ltyProgramId,
      posIds: [], 
      type: marketCampaignByIdData.type as MarketingCampaignType, 
      discountType: marketCampaignByIdData.discountType as MarketingDiscountType,
      discountValue: marketCampaignByIdData.discountValue,
      promocode: marketCampaignByIdData.promocode ?? '',
      launchDate: marketCampaignByIdData.launchDate ? dayjs(marketCampaignByIdData.launchDate).toDate() : undefined,
    });
    setSelectedCard(marketCampaignByIdData.type as MarketingCampaignType);
    setRadioValue(marketCampaignByIdData.discountType as MarketingDiscountType);
  }
}, [marketCampaignByIdData, reset]);


  const { trigger, isMutating } = useSWRMutation<
    MarketingCampaignResponse,
    Error,
    string,
    MarketingCampaignRequest
  >('user/loyalty/marketing-campaigns', async (_url, { arg }) =>
    createMarketingCampaign(arg)
  );

  const handleSelectBranch = (value: number | undefined) => {
    if (typeof value === 'number' && !selectedBranches.includes(value)) {
      setSelectedBranches([...selectedBranches, value]);
    }
  };

  const handleDeselectBranch = (removed: number) => {
    setSelectedBranches(selectedBranches.filter(val => val !== removed));
  };

  const onSubmit = async (data: MarketingCampaignRequest) => {
    try {
      const req = {
        ...data,
        posIds: selectedBranches,
        ltyProgramId: data.ltyProgramId,
        type: data.type,
        discountType: data.discountType,
        discountValue:
          selectedCard === MarketingCampaignType.DISCOUNT
            ? Number(data.discountValue)
            : data.discountType === MarketingDiscountType.PERCENTAGE
              ? Number(data.discountValue)
              : Number(data.discountValue),
        promocode:
          selectedCard === MarketingCampaignType.PROMOCODE
            ? data.promocode
            : undefined,
        launchDate: data.launchDate,
      };
      const result = await trigger(req);

      if (result) {
        navigate(-1);
      }
    } catch (e) {
      // Handle error (show error message)
    }
  };

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
                          option => !selectedBranches.includes(option.id)
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
                {selectedBranches.map(branch => (
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
                    {posData?.find(item => item.id === branch)?.name || branch}
                  </Tag>
                ))}
              </div>
            </Col>
          </Row>
          <Row className="flex flex-col sm:flex-row gap-8 mt-10">
            <Col xs={24} sm={9}>
              <Card
                styles={{ body: { padding: 0 } }}
                className={`flex-1 rounded-3xl ${selectedCard === MarketingCampaignType.DISCOUNT ? 'bg-white border-2 border-primary02' : 'bg-[#F6F8FB]'} flex flex-col items-center justify-center cursor-pointer transition-shadow hover:shadow-md h-28 w-80`}
                onClick={() => {
                  setSelectedCard(MarketingCampaignType.DISCOUNT);
                  setValue('type', MarketingCampaignType.DISCOUNT);
                }}
              >
                <div className="py-10 flex flex-col items-center justify-center">
                  <div
                    className={`flex items-center space-x-2 ${selectedCard === MarketingCampaignType.DISCOUNT ? 'text-primary02' : 'text-text01'}`}
                  >
                    <Percentage className="w-6 h-6" />
                    <div className={`font-semibold text-lg`}>
                      {t('marketing.dis')}
                    </div>
                  </div>
                  <div
                    className={`mt-2  ${selectedCard === MarketingCampaignType.DISCOUNT ? 'text-text01' : 'text-text02'} font-normal`}
                  >
                    {t('marketing.give')}
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card
                styles={{ body: { padding: 0 } }}
                className={`flex-1 rounded-3xl ${selectedCard === MarketingCampaignType.PROMOCODE ? 'bg-white border-2 border-primary02' : 'bg-[#F6F8FB]'} flex flex-col items-center justify-center cursor-pointer transition-shadow hover:shadow-md h-28 w-80`}
                onClick={() => {
                  setSelectedCard(MarketingCampaignType.PROMOCODE);
                  setValue('type', MarketingCampaignType.PROMOCODE);
                }}
              >
                <div className="py-10 flex flex-col items-center justify-center">
                  <div
                    className={`flex items-center space-x-2 ${selectedCard === MarketingCampaignType.PROMOCODE ? 'text-primary02' : 'text-text01'}`}
                  >
                    <DiamondIcon className="w-6 h-6" />
                    <div className="font-semibold text-lg">
                      {t('subscriptions.promo')}
                    </div>
                  </div>
                  <div
                    className={`mt-2  ${selectedCard === MarketingCampaignType.PROMOCODE ? 'text-text01' : 'text-text02'} font-normal`}
                  >
                    {t('marketing.createPromotionalCode')}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
          {selectedCard === MarketingCampaignType.DISCOUNT && (
            <div className="mt-10">
              <Controller
                name="discountValue"
                control={control}
                rules={{ required: t('marketing.discRequired') }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={t('marketing.enterDisc')}
                    type="number"
                    className="w-80"
                    suffix={<div>%</div>}
                  />
                )}
              />
            </div>
          )}
          {selectedCard === MarketingCampaignType.PROMOCODE && (
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
                  setRadioValue(e.target.value);
                }}
                value={radioValue}
                options={[
                  { value: 'percentage', label: t('marketing.per') },
                  { value: 'fix', label: t('marketing.fix') },
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
                      radioValue === MarketingDiscountType.PERCENTAGE
                        ? t('marketing.enterPer')
                        : t('marketing.enterBon')
                    }
                    type="number"
                    className="w-80"
                    suffix={
                      radioValue === MarketingDiscountType.PERCENTAGE ? (
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
            <Button type="default">{t('marketing.close')}</Button>
          </Col>
        </Row>
        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          closeIcon={true}
          width={700}
          styles={{ mask: { background: 'rgba(0,0,0,0.05)' } }}
          maskClosable={true}
          className="custom-top-right-modal"
        >
          <div className="relative">
            <div className="px-8 py-7">
              <h2 className="font-bold text-2xl mb-2">
                {t('marketing.launchControl')}
              </h2>
              <div className="mb-6 text-base text-text01">
                {t('marketing.launchControlDesc')}
              </div>
              <div className="flex mb-6 gap-2">
                <Button
                  type="primary"
                  className="flex items-center font-semibold text-base"
                  loading={isMutating}
                  onClick={() => {
                    setValue('launchDate', dayjs().toDate());
                    handleSubmit(onSubmit)();
                  }}
                >
                  <span className="mr-2">▶</span>
                  {t('marketing.launchNow')}
                </Button>
                <span className="ml-2 text-text01 text-sm">
                  {t('marketing.launchNowDesc')}
                </span>
              </div>
              <hr className="border-[#EEE]" />
              <div className="mt-6">
                <div className="text-xl font-semibold mb-4">
                  {t('marketing.delayedStart')}
                </div>
                <div className="flex gap-3 items-end">
                  <div>
                    <div className="text-base mb-1">{t('marketing.date')}</div>
                    <Controller
                      name="launchDate"
                      control={control}
                      rules={{ required: t('validation.launchDateRequired') }}
                      render={({ field, fieldState }) => (
                        <Form.Item
                          validateStatus={fieldState.error ? 'error' : ''}
                          help={fieldState.error?.message}
                          className="!mb-0"
                        >
                          <DatePicker
                            {...field}
                            format="DD.MM.YYYY"
                            className="w-40 h-10"
                            placeholder={t('marketing.date')}
                            value={field.value ? dayjs(field.value) : undefined}
                            onChange={date =>
                              field.onChange(date ? date.toDate() : undefined)
                            }
                            disabledDate={current =>
                              current && current < dayjs().startOf('day')
                            }
                          />
                        </Form.Item>
                      )}
                    />
                  </div>
                  <Button
                    type="primary"
                    loading={isMutating}
                    onClick={handleSubmit(onSubmit)}
                    className="h-10 px-8 font-semibold text-base"
                  >
                    {t('marketing.schedule')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <style>
          {`
.custom-top-right-modal .ant-modal-content {
  margin: 0 !important; 
  position: fixed !important;
  top: 1.25rem !important; /* adjust vertical offset */
  right: 1.5rem !important; /* adjust horizontal offset */
  max-width: 700px;
  border-radius: 1.5rem;
}

`}
        </style>
      </form>
    </Card>
  );
};

export default Settings;
