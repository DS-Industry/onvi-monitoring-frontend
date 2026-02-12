import { useState, useEffect, useMemo } from 'react';
import { Drawer, Form, message, Input, Button, Select } from 'antd';
import useSWR from 'swr';
import { debounce } from 'lodash';
import {
  CorporateClientResponse,
  CreateCorporateClientRequest,
  UpdateCorporateClientRequest,
  createCorporateClient,
  updateCorporateClient,
  getLoyaltyProgramsPaginated,
  LoyaltyParticipantProgramsPaginatedResponse,
} from '@/services/api/marketing';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/hooks/useUserStore';

interface CorporateClientDrawerProps {
  open: boolean;
  onClose: () => void;
  client?: CorporateClientResponse | null;
  onSuccess?: () => void;
}

export default function CorporateClientDrawer({
  open,
  onClose,
  client,
  onSuccess,
}: CorporateClientDrawerProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();

  const [initialValues, setInitialValues] = useState({
    name: '',
    inn: '',
    address: '',
    ltyProgramId: undefined as number | undefined,
  });

  const user = useUser();

  const isEditMode = !!client;

  const [loyaltyProgramSearch, setLoyaltyProgramSearch] = useState('');
  const [selectedLoyaltyOptionLabel, setSelectedLoyaltyOptionLabel] = useState<
    string | null
  >(null);
  const debouncedSetLoyaltySearch = useMemo(
    () => debounce((value: string) => setLoyaltyProgramSearch(value), 300),
    []
  );

  useEffect(() => {
    return () => debouncedSetLoyaltySearch.cancel();
  }, [debouncedSetLoyaltySearch]);

  useEffect(() => {
    if (!open) {
      setLoyaltyProgramSearch('');
      setSelectedLoyaltyOptionLabel(null);
    }
  }, [open]);

  const { data: loyaltyProgramsData, isValidating: loyaltyProgramsLoading } =
    useSWR<LoyaltyParticipantProgramsPaginatedResponse>(
      open && user.organizationId
        ? [
            'corporate-drawer-loyalty-programs',
            user.organizationId,
            loyaltyProgramSearch,
          ]
        : null,
      () =>
        getLoyaltyProgramsPaginated({
          organizationId: Number(user.organizationId),
          page: 1,
          size: 15,
          search: loyaltyProgramSearch || undefined,
        }),
      { revalidateOnFocus: false, keepPreviousData: true }
    );

  const loyaltyProgramOptionsRaw =
    loyaltyProgramsData?.data?.map((item) => ({
      value: item.props.id,
      label: item.props.name,
    })) ?? [];

  const selectedLtyId = Form.useWatch('ltyProgramId', form);
  const loyaltyProgramOptions =
    selectedLtyId != null &&
    !loyaltyProgramOptionsRaw.some((o) => o.value === selectedLtyId)
      ? [
          {
            value: selectedLtyId,
            label: selectedLoyaltyOptionLabel ?? String(selectedLtyId),
          },
          ...loyaltyProgramOptionsRaw,
        ]
      : loyaltyProgramOptionsRaw;

  useEffect(() => {
    if (open && !client) {
      setInitialValues({
        name: '',
        inn: '',
        address: '',
        ltyProgramId: undefined,
      });
      form.resetFields();
    }
  }, [open, client]);

  useEffect(() => {
    if (client) {
      setInitialValues({
        name: client.name || '',
        inn: client.inn || '',
        address: client.address || '',
        ltyProgramId: undefined,
      });
      form.setFieldsValue({
        name: client.name || '',
        inn: client.inn || '',
        address: client.address || '',
        ltyProgramId: undefined,
      });
    } else {
      setInitialValues({
        name: '',
        inn: '',
        address: '',
        ltyProgramId: undefined,
      });
      form.resetFields();
    }
  }, [client, form]);

  const handleSubmit = async (values: {
    name: string;
    inn: string;
    address: string;
    ltyProgramId?: number;
  }) => {
    try {
      setLoading(true);

      if (isEditMode && client) {
        const updateRequest: UpdateCorporateClientRequest = {
          name: values.name,
          inn: values.inn,
          address: values.address,
          organizationId: Number(user.organizationId),
        };

        await updateCorporateClient(client.id, updateRequest);
        message.success(t('marketing.corporationUpdated'));
      } else {
        const createRequest: CreateCorporateClientRequest = {
          name: values.name,
          inn: values.inn,
          address: values.address,
          organizationId: Number(user.organizationId),
          ltyProgramId: values.ltyProgramId!,
        };

        await createCorporateClient(createRequest);
        message.success(t('marketing.corporationCreated'));
      }

      onSuccess?.();
      onClose();
      form.resetFields();
    } catch (error) {
      console.error('Error saving corporate client:', error);
      message.error(t('marketing.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={
        isEditMode
          ? t('marketing.editCorporation')
          : t('marketing.createCorporation')
      }
      open={open}
      onClose={handleClose}
      width={600}
      zIndex={9999}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
        className="w-full max-w-2xl mx-auto p-4 space-y-6"
      >
        {!isEditMode && (
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">
                {t('marketing.loyaltyProgram')}
              </div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              name="ltyProgramId"
              rules={[
                {
                  required: true,
                  message: t('validation.loyaltyProgramRequired'),
                },
              ]}
            >
              <Select
                placeholder={t('marketing.selectLoyaltyProgram')}
                className="w-80"
                options={loyaltyProgramOptions}
                allowClear
                showSearch
                filterOption={false}
                onSearch={debouncedSetLoyaltySearch}
                loading={loyaltyProgramsLoading}
                onSelect={(_value, option) =>
                  setSelectedLoyaltyOptionLabel(
                    (option as { label?: string })?.label ?? null
                  )
                }
              />
            </Form.Item>
          </div>
        )}
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">
              {t('marketing.corporationName')}
            </div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: t('marketing.enterCorporationName'),
              },
              { min: 2, message: t('marketing.corporationNameMin') },
            ]}
          >
            <Input
              placeholder={t('marketing.enterCorporationName')}
              className="w-80"
            />
          </Form.Item>
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">{t('marketing.inn')}</div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            name="inn"
            rules={[
              { required: true, message: t('marketing.enterInn') },
              {
                pattern: /^\d{10}$/,
                message: t('marketing.innPattern'),
              },
            ]}
          >
            <Input
              placeholder={t('marketing.enterInnPlaceholder')}
              className="w-80"
            />
          </Form.Item>
        </div>
        <div>
          <div className="flex">
            <div className="text-text02 text-sm">{t('marketing.address')}</div>
            <span className="text-errorFill">*</span>
          </div>
          <Form.Item
            name="address"
            rules={[{ required: true, message: t('marketing.enterAddress') }]}
          >
            <Input
              placeholder={t('marketing.enterAddressPlaceholder')}
              className="w-80"
            />
          </Form.Item>
        </div>
        <div className="flex space-x-4">
          <Button onClick={handleClose}>
            {t('marketing.cancel')}
          </Button>
          <Button loading={loading} type='primary' htmlType="submit">
            {isEditMode ? t('marketing.save') : t('marketing.create')}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}
