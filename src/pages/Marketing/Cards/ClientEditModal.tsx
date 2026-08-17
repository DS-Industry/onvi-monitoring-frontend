import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
} from 'antd';
import { Controller, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import {
  getClientById,
  updateClient,
} from '@/services/api/marketing';
import { ContractType } from '@/utils/constants';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUserStore';

const { TextArea } = Input;
const { Option } = Select;

type ClientDetail = Awaited<ReturnType<typeof getClientById>>;

type ClientFormData = {
  contractType: ContractType;
  name: string;
  birthday?: Date;
  phone: string;
  email?: string;
  gender?: string;
  comment?: string;
  placementId?: number;
};

type ClientEditModalProps = {
  open: boolean;
  onClose: () => void;
  clientId: number;
  cardId?: number;
  initial?: ClientDetail;
};

const ClientEditModal: React.FC<ClientEditModalProps> = ({
  open,
  onClose,
  clientId,
  cardId,
  initial,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const user = useUser();
  const [saving, setSaving] = React.useState(false);

  const defaultValues: ClientFormData = useMemo(
    () => ({
      contractType: initial?.contractType || ContractType.INDIVIDUAL,
      name: initial?.name || '',
      birthday: initial?.birthday ? new Date(initial.birthday) : undefined,
      phone: initial?.phone || '',
      email: initial?.email || '',
      gender: initial?.gender || '',
      comment: initial?.comment || '',
      placementId: initial?.placementId,
    }),
    [initial]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({ defaultValues });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const genderOptions = useMemo(
    () => [
      { value: 'MALE', label: t('marketing.man') },
      { value: 'FEMALE', label: t('marketing.woman') },
    ],
    [t]
  );

  const onSubmit = async (values: ClientFormData) => {
    setSaving(true);
    try {
      const updateData = {
        clientId,
        name: values.name,
        contractType: values.contractType,
        comment: values.comment,
        email: values.email,
        placementId: values.placementId,
        gender: values.gender,
        birthday: values.birthday,
        phone: values.phone,
      };

      // Extra fields (contractType, gender, birthday, phone) mirror BasicInformation
      await updateClient(updateData as Parameters<typeof updateClient>[0]);

      showToast(t('routes.savedSuccessfully'), 'success');

      await mutate(['get-client-by-id', clientId]);
      if (user.organizationId) {
        await mutate(
          key =>
            Array.isArray(key) &&
            key[0] === 'user-key-stats' &&
            key[1] === user.organizationId &&
            (key[2] === clientId || key[2] === String(clientId)),
          undefined,
          { revalidate: true }
        );
      }
      await mutate(
        key =>
          Array.isArray(key) &&
          key[0] === 'get-client-loyalty-stats' &&
          (key[1] === clientId || key[1] === String(clientId)),
        undefined,
        { revalidate: true }
      );
      if (cardId) {
        await mutate(['get-card-by-id', cardId]);
      }

      onClose();
    } catch (error) {
      console.error('Update failed:', error);
      showToast(
        t('marketing.cardUpdateError') || 'Failed to update client',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t('actions.edit')}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      width={520}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-2">
        <Form.Item
          label={t('marketing.type')}
          labelCol={{ span: 24 }}
          validateStatus={errors.contractType ? 'error' : undefined}
          help={errors.contractType?.message}
        >
          <Controller
            name="contractType"
            control={control}
            rules={{
              required: t('validation.contractTypeRequired') as string,
            }}
            render={({ field }) => (
              <Select {...field} className="w-full" placeholder={t('warehouse.notSel')}>
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
          validateStatus={errors.name ? 'error' : undefined}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: t('validation.required') as string }}
            render={({ field }) => (
              <Input
                {...field}
                className="w-full"
                placeholder={t('marketing.enterName')}
              />
            )}
          />
        </Form.Item>

        <Form.Item label={t('marketing.floor')} labelCol={{ span: 24 }}>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                className="w-full"
                allowClear
                placeholder={t('warehouse.notSel')}
                options={genderOptions}
              />
            )}
          />
        </Form.Item>

        <Form.Item label={t('register.date')} labelCol={{ span: 24 }}>
          <Controller
            name="birthday"
            control={control}
            render={({ field }) => (
              <DatePicker
                className="w-full"
                placeholder={t('finance.sel')}
                value={field.value ? dayjs(field.value) : undefined}
                onChange={d => field.onChange(d ? d.toDate() : undefined)}
              />
            )}
          />
        </Form.Item>

        <Form.Item label={t('profile.telephone')} labelCol={{ span: 24 }}>
          <Input value={defaultValues.phone} disabled className="w-full" />
        </Form.Item>

        <Form.Item
          label="E-mail"
          labelCol={{ span: 24 }}
          validateStatus={errors.email ? 'error' : undefined}
          help={errors.email?.message}
        >
          <Controller
            name="email"
            control={control}
            rules={{
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t('validation.invalidEmailFormat') as string,
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                className="w-full"
                placeholder={t('marketing.enterEmail')}
              />
            )}
          />
        </Form.Item>

        <Form.Item label={t('equipment.comment')} labelCol={{ span: 24 }}>
          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                rows={3}
                className="w-full"
                placeholder={t('marketing.about')}
              />
            )}
          />
        </Form.Item>

        <Space className="w-full justify-end pt-2">
          <Button onClick={onClose} disabled={saving}>
            {t('actions.cancel')}
          </Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            {t('actions.save')}
          </Button>
        </Space>
      </form>
    </Modal>
  );
};

export default ClientEditModal;
