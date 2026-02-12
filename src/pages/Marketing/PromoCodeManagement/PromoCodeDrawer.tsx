import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Button,
  Space,
  message,
  Alert,
} from 'antd';
import dayjs from 'dayjs';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { debounce } from 'lodash';
import { useToast } from '@/components/context/useContext';
import {
  PersonalPromocodeResponse,
  PromocodeType,
  PromocodeDiscountType,
  CreatePromocodeDto,
  UpdatePromocodeDto,
  getClients,
  createPromocode,
  updatePromocode,
} from '@/services/api/marketing';

const { Option } = Select;

const RUSSIAN_PROMO_WORDS = [
  'Солнце', 'Лето', 'Зима', 'Море', 'Отдых', 'Скидка', 'Бонус', 'Подарок',
  'Удача', 'Радость', 'Праздник', 'День', 'Ночь', 'Звезда', 'Мечта', 'Счастье',
  'Весна', 'Осень', 'Дождь', 'Снег', 'Ветер', 'Река', 'Гора', 'Лес', 'Цветок',
  'Мир', 'Друг', 'Семья', 'Дом', 'Путь', 'Свет', 'Тепло', 'Красота', 'Сила',
  'Время', 'Шанс', 'Выгода', 'Супер', 'Макси', 'Топ', 'Плюс', 'Про',
];

function generateRandomRussianPromoCode(): string {
  const wordCount = 2 + Math.floor(Math.random() * 2);
  const words: string[] = [];
  const used = new Set<number>();
  while (words.length < wordCount) {
    const idx = Math.floor(Math.random() * RUSSIAN_PROMO_WORDS.length);
    if (!used.has(idx)) {
      used.add(idx);
      words.push(RUSSIAN_PROMO_WORDS[idx]);
    }
  }
  const withNumber = Math.random() > 0.5;
  const code = words.join('') + (withNumber ? String(10 + Math.floor(Math.random() * 90)) : '');
  return code;
}

interface PromoCodeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editingPromo: PersonalPromocodeResponse | null;
  organizationId: number;
  onSuccess: () => void;
}

const PromoCodeDrawer: React.FC<PromoCodeDrawerProps> = ({
  isOpen,
  onClose,
  editingPromo,
  organizationId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [form] = Form.useForm();
  const [promocodeType, setPromocodeType] = useState<PromocodeType | undefined>(undefined);
  const [clientSearch, setClientSearch] = useState<string>('');

  const { trigger: createPromoMutation, isMutating: isCreatingPromo } =
    useSWRMutation(
      ['create-promocode'],
      async (_, { arg }: { arg: CreatePromocodeDto }) => {
        return createPromocode(arg);
      }
    );

  const { trigger: updatePromoMutation, isMutating: isUpdatingPromo } =
    useSWRMutation(
      ['update-promocode'],
      async (_, { arg }: { arg: { id: number; data: UpdatePromocodeDto } }) => {
        return updatePromocode(arg.id, arg.data);
      }
    );

  const { data: clientsData, isLoading: clientsLoading } = useSWR(
    promocodeType === PromocodeType.PERSONAL && isOpen
      ? ['get-clients-for-promocode', organizationId, clientSearch]
      : null,
    async () => {
      const response = await getClients({
        placementId: '*',
        contractType: '*',
        page: 1,
        size: 10,
        organizationId: organizationId,
        search: clientSearch || undefined,
      });
      return response.data;
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setClientSearch(searchValue);
    }, 300),
    []
  );

  const handleClientSearch = (value: string) => {
    debouncedSearch(value);
  };

  useEffect(() => {
    if (isOpen) {
      if (editingPromo) {
        const initialPromocodeType = editingPromo.promocodeType as PromocodeType;
        setPromocodeType(initialPromocodeType);
        form.setFieldsValue({
          code: editingPromo.code,
          promocodeType: initialPromocodeType,
          personalUserId: editingPromo.personalUserId || undefined,
          discountType: editingPromo.discountType,
          discountValue: editingPromo.discountValue,
          minOrderAmount: editingPromo.minOrderAmount,
          maxDiscountAmount: editingPromo.maxDiscountAmount,
          maxUsage: editingPromo.maxUsage,
          maxUsagePerUser: editingPromo.maxUsagePerUser,
          validFrom: editingPromo.validFrom ? dayjs(editingPromo.validFrom) : null,
          validUntil: editingPromo.validUntil ? dayjs(editingPromo.validUntil) : null,
          isActive: editingPromo.isActive,
          createdReason: editingPromo.createdReason,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          isActive: true,
        });
        setPromocodeType(undefined);
      }
    } else {
      setPromocodeType(undefined);
      setClientSearch('');
    }
  }, [isOpen, editingPromo, form]);

  const formPromocodeType = Form.useWatch('promocodeType', form);
  useEffect(() => {
    if (formPromocodeType) {
      setPromocodeType(formPromocodeType as PromocodeType);
    }
  }, [formPromocodeType]);

  const isCampaignPromocode = editingPromo?.promocodeType === PromocodeType.CAMPAIGN;

  const handleSubmit = async () => {
    if (isCampaignPromocode) {
      message.warning(t('marketingCampaigns.campaignPromocodeEditWarning'));
      return;
    }

    try {
      const values = await form.validateFields();
      const promoData: CreatePromocodeDto | UpdatePromocodeDto = {
        code: values.code,
        promocodeType: values.promocodeType,
        personalUserId: values.promocodeType === PromocodeType.PERSONAL
          ? (values.personalUserId || null)
          : undefined,
        discountType: values.discountType,
        discountValue: values.discountValue ? Number(values.discountValue) : undefined,
        minOrderAmount: values.minOrderAmount ? Number(values.minOrderAmount) : undefined,
        maxDiscountAmount: values.maxDiscountAmount ? Number(values.maxDiscountAmount) : undefined,
        maxUsage: values.maxUsage ? Number(values.maxUsage) : undefined,
        maxUsagePerUser: values.maxUsagePerUser ? Number(values.maxUsagePerUser) : undefined,
        validFrom: values.validFrom
          ? dayjs(values.validFrom).toISOString()
          : undefined,
        validUntil: values.validUntil
          ? dayjs(values.validUntil).toISOString()
          : undefined,
        isActive: values.isActive ?? true,
        createdReason: values.createdReason,
        organizationId: organizationId,
      };

      if (editingPromo) {
        await updatePromoMutation({ id: editingPromo.id, data: promoData });
        showToast(t('success.recordUpdated'), 'success');
      } else {
        await createPromoMutation(promoData as CreatePromocodeDto);
        showToast(t('success.recordCreated'), 'success');
      }

      form.resetFields();
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(t('common.somethingWentWrong'));
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={
        editingPromo
          ? t('constants.edit') + ' ' + t('marketing.promoCode')
          : t('routes.add') + ' ' + t('marketing.promoCode')
      }
      placement="right"
      width={600}
      onClose={handleClose}
      open={isOpen}
      footer={
        <Space>
          <Button onClick={handleClose}>
            {t('constants.cancel')}
          </Button>
          <Button
            type="primary"
            loading={isCreatingPromo || isUpdatingPromo}
            onClick={handleSubmit}
            disabled={isCampaignPromocode}
          >
            {t('common.save')}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        {isCampaignPromocode && (
          <Alert
            message={t('marketingCampaigns.campaignPromocodeEditWarning')}
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form.Item
          label={t('marketing.promoCode')}
          required
        >
          <Space.Compact style={{ width: '100%', maxWidth: 400 }}>
            <Form.Item
              name="code"
              noStyle
              rules={[
                { required: true, message: t('validation.required') },
              ]}
            >
              <Input
                placeholder={t('marketing.enterPromoCode')}
                disabled={isCampaignPromocode}
                style={{ minWidth: 200 }}
              />
            </Form.Item>
            <Button
              type="default"
              disabled={isCampaignPromocode}
              onClick={() => form.setFieldValue('code', generateRandomRussianPromoCode())}
            >
              {t('marketing.generateRandomPromoCode')}
            </Button>
          </Space.Compact>
        </Form.Item>

        <Form.Item
          name="promocodeType"
          label={t('constants.type')}
          rules={[
            { required: true, message: t('validation.required') },
          ]}
          className="w-80"
        >
          <Select
            placeholder={t('constants.selectType')}
            disabled={isCampaignPromocode}
            className="w-80"
            onChange={(value: PromocodeType) => {
              setPromocodeType(value);
              if (value !== PromocodeType.PERSONAL) {
                form.setFieldsValue({ personalUserId: undefined });
              }
            }}
          >
            <Option value={PromocodeType.STANDALONE}>
              {t(`tables.${PromocodeType.STANDALONE}`)}
            </Option>
            <Option value={PromocodeType.PERSONAL}>
              {t(`tables.${PromocodeType.PERSONAL}`)}
            </Option>
          </Select>
        </Form.Item>

        {promocodeType === PromocodeType.PERSONAL && (
          <Form.Item
            name="personalUserId"
            label={t('marketing.personalUser')}
            tooltip={t('marketing.personalUserTooltip')}
            className="w-80"
          >
            <Select
              placeholder={t('marketingCampaigns.selectClient')}
              allowClear
              className="w-80"
              showSearch
              disabled={isCampaignPromocode}
              loading={clientsLoading}
              onSearch={handleClientSearch}
              filterOption={false}
              notFoundContent={clientsLoading ? null : (clientSearch ? (t('table.noData')) : (t('marketing.typeToSearch')))}
              options={clientsData?.map((client) => ({
                value: client.id,
                label: `${client.name} (${client.phone})`,
              }))}
            />
          </Form.Item>
        )}

        <Form.Item
          name="discountType"
          label={t('marketing.discountType')}
          className="w-80"
        >
          <Select
            placeholder={t('constants.selectType')}
            disabled={isCampaignPromocode}
          >
            <Option value={PromocodeDiscountType.PERCENTAGE}>
              {t('marketingCampaigns.percentage')}
            </Option>
            <Option value={PromocodeDiscountType.FIXED_AMOUNT}>
              {t('marketingCampaigns.fixedAmount')}
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="discountValue"
          label={t('marketing.discountValue')}
          className="w-80"
        >
          <Input
            type="number"
            placeholder={t('marketing.enterDiscountValue')}
            disabled={isCampaignPromocode}
          />
        </Form.Item>

        <Form.Item
          name="minOrderAmount"
          label={t('marketing.minOrderAmount')}
          className="w-80"
        >
          <Input
            type="number"
            placeholder={t('marketing.enterMinOrderAmount')}
            disabled={isCampaignPromocode}
          />
        </Form.Item>

        <Form.Item
          name="maxDiscountAmount"
          label={t('marketing.maxDiscountAmount')}
          className="w-80"
        >
          <Input
            type="number"
            placeholder={t('marketing.enterMaxDiscountAmount')}
            disabled={isCampaignPromocode}
          />
        </Form.Item>

        <Form.Item
          name="maxUsage"
          label={t('marketing.maxUsage')}
          className="w-80"
        >
          <Input
            type="number"
            placeholder={t('marketing.enterMaxUsage')}
            disabled={isCampaignPromocode}
          />
        </Form.Item>

        <Form.Item
          name="maxUsagePerUser"
          label={t('marketing.maxUsagePerUser')}
          className="w-80"
        >
          <Input
            type="number"
            placeholder={t('marketing.enterMaxUsagePerUser')}
            disabled={isCampaignPromocode}
          />
        </Form.Item>

        <Form.Item
          name="validFrom"
          label={t('marketing.validFrom')}
          className="w-80"
        >
          <DatePicker
            showTime
            style={{ width: '100%' }}
            format="YYYY-MM-DD HH:mm"
            disabled={isCampaignPromocode}
          />
        </Form.Item>

        <Form.Item
          name="validUntil"
          label={t('marketing.validUntil')}
          className="w-80"
        >
          <DatePicker
            showTime
            style={{ width: '100%' }}
            format="YYYY-MM-DD HH:mm"
            disabled={isCampaignPromocode}
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label={t('constants.status')}
          valuePropName="checked"
          initialValue={true}
          className="w-80"
        >
          <Switch
            checkedChildren={t('constants.active')}
            unCheckedChildren={t('constants.inactive')}
            disabled={isCampaignPromocode}
          />
        </Form.Item>

        <Form.Item
          name="createdReason"
          label={t('marketing.reason')}
        >
          <Input.TextArea
            rows={3}
            placeholder={t('marketing.enterReason')}
            disabled={isCampaignPromocode}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default PromoCodeDrawer;
