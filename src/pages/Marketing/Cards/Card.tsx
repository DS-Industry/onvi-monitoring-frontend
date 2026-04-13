import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import {
  getCardById,
  updateCard,
  getTiers,
  UpdateCardRequest,
  createEquiring,
  EquiringType,
} from '@/services/api/marketing';
import { Spin, Card as AntCard, Typography, Select, Button, message, Skeleton, Modal, Form, InputNumber, Input } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useToast } from '@/components/context/useContext';
import { Can } from '@/permissions/Can';
import useAuthStore from '@/config/store/authSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const Card: React.FC = () => {
  const { t } = useTranslation();
  const { cardId: cardIdParam } = useParams<{ cardId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const userPermissions = useAuthStore(state => state.permissions);
  const cardId = cardIdParam ? Number(cardIdParam) : undefined;
  const fromOrders = searchParams.get('from') === 'orders';

  const [selectedTierId, setSelectedTierId] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEquiringModalOpen, setIsEquiringModalOpen] = useState(false);
  const [isCreatingEquiring, setIsCreatingEquiring] = useState(false);
  const [equiringForm] = Form.useForm<{ type: EquiringType; money: number; reason?: string }>();

  const { data: card, isLoading } = useSWR(
    cardId ? ['get-card-by-id', cardId] : null,
    ([, id]) => getCardById(id),
    {
      shouldRetryOnError: false,
    }
  );

  const ltyProgramId = card?.cardTier?.ltyProgramId;

  const { data: tiersData, isLoading: tiersLoading } = useSWR(
    ltyProgramId ? ['get-tiers', ltyProgramId] : null,
    ([, programId]) => getTiers({ programId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  React.useEffect(() => {
    if (card?.cardTier?.id) {
      setSelectedTierId(card.cardTier.id);
    }
  }, [card]);

  React.useEffect(() => {
    if (card?.status === 'INACTIVE') {
      setSelectedStatus('INACTIVE');
    } else {
      setSelectedStatus('ACTIVE');
    }
  }, [card]);

  const handleUpdateCard = async () => {
    if (!cardId) {
      message.error('Card ID not found');
      return;
    }

    const updatePayload: UpdateCardRequest = {};

    if (selectedTierId !== undefined) {
      const currentTierId = card?.cardTier?.id;
      if (selectedTierId !== currentTierId) {
        updatePayload.cardTierId = selectedTierId;
      }
    }

    const currentStatus = card?.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (selectedStatus !== currentStatus) {
      updatePayload.status = selectedStatus === 'INACTIVE' ? 'INACTIVE' : null;
    }

    if (Object.keys(updatePayload).length === 0) {
      message.info(t('marketing.noChanges') || 'No changes to save');
      return;
    }

    setIsUpdating(true);
    try {
      await updateCard(cardId, updatePayload);
      showToast(t('routes.savedSuccessfully') || 'Card updated successfully', 'success');
      await mutate(['get-card-by-id', cardId]);
    } catch (error) {
      console.error('Failed to update card:', error);
      showToast(t('marketing.cardUpdateError') || 'Failed to update card', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenEquiringModal = () => {
    equiringForm.setFieldsValue({ type: 'TOP_UP', money: undefined, reason: undefined });
    setIsEquiringModalOpen(true);
  };

  const handleCloseEquiringModal = () => {
    equiringForm.resetFields();
    setIsEquiringModalOpen(false);
  };

  const handleCreateEquiring = async () => {
    if (!cardId || !card) {
      message.error('Card ID not found');
      return;
    }

    try {
      const values = await equiringForm.validateFields();

      if (values.type === 'DECREASE' && values.money > card.balance) {
        showToast(
          t('marketing.insufficientBalance'),
          'error'
        );
        return;
      }

      setIsCreatingEquiring(true);
      await createEquiring({
        cardId,
        type: values.type,
        money: values.money,
        reason: values.reason?.trim() ? values.reason.trim() : undefined,
      });
      showToast(t('routes.savedSuccessfully'), 'success');
      await mutate(['get-card-by-id', cardId]);
      handleCloseEquiringModal();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      const errorMessage =
        error?.response?.data?.message ||
        t('marketing.cardUpdateError');
      showToast(errorMessage, 'error');
      console.error('Failed to create equiring operation:', error);
    } finally {
      setIsCreatingEquiring(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <Text>{t('marketing.cardNotFound') || 'Card not found'}</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="flex text-primary02 mb-5 cursor-pointer"
        onClick={() => navigate(fromOrders ? '/marketing/marketing-transactions' : '/marketing/cards')}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>

      <div className="font-semibold text-text01 text-2xl mb-6">
        {t('marketing.card')}
      </div>

      <AntCard className="max-w-2xl">
        <div className="space-y-4">
          <div>
            <Text className="text-text02 text-sm">{t('marketing.cardNumber')}:</Text>
            <Title level={4} className="mt-1 mb-0">
              {card.number}
            </Title>

          </div>

          {card.unqNumber && (
            <div>
              <Text className="text-text02 text-sm">{t('marketing.uniqueCardNumber')}:</Text>
              <Title level={4} className="mt-1 mb-0">
                {card.unqNumber}
              </Title>
            </div>
          )}

          <div>
            <Text className="text-text02 text-sm">{t('marketing.type')}:</Text>
            <Title level={4} className="mt-1 mb-0">
              {card.type === 'VIRTUAL' ? t('marketing.virtual') || 'Virtual' : t('marketing.physical') || 'Physical'}
            </Title>
          </div>

          <div>
            <Text className="text-text02 text-sm">{t('marketing.balance')}:</Text>
            <Title level={4} className="mt-1 mb-0">
              {card.balance.toLocaleString('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 2,
              })}
            </Title>
          </div>

          <Can requiredPermissions={[{ action: 'update', subject: 'LTYProgram' }]} userPermissions={userPermissions}>
            {allowed => (
              <>
                <div>
                  <Text className="text-text02 text-sm">{t('marketing.level')}:</Text>
                  {tiersLoading ? (
                    <div className="mt-2">
                      <Skeleton.Input active style={{ width: '100%', height: 32 }} />
                    </div>
                  ) : allowed ? (
                    <>
                      <Select
                        className="w-full mt-2"
                        placeholder={t('marketing.selectTier') || 'Select Tier'}
                        value={selectedTierId}
                        onChange={setSelectedTierId}
                        allowClear
                      >
                        {tiersData?.map(tier => (
                          <Option key={tier.id} value={tier.id}>
                            {tier.name} ({t('marketing.discount')} {Math.floor(tier.limitBenefit)}%)
                          </Option>
                        ))}
                      </Select>
                      {card.cardTier && (
                        <Text className="text-text02 text-xs mt-1 block">
                          {t('marketing.currentTier') || 'Current'}: {card.cardTier.name}
                        </Text>
                      )}
                    </>
                  ) : (
                    <Title level={4} className="mt-1">
                      {card.cardTier ? `${card.cardTier.name} (${Math.floor(card.cardTier.limitBenefit)}%)` : '-'}
                    </Title>
                  )}
                </div>

                <div>
                  <Text className="text-text02 text-sm">{t('marketing.status') || 'Status'}:</Text>
                  {allowed ? (
                    <Select
                      className="w-full mt-2"
                      placeholder={t('marketing.selectStatus') || 'Select Status'}
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                    >
                      <Option value="ACTIVE">{t('marketing.active')}</Option>
                      <Option value="INACTIVE">{t('marketing.inactive')}</Option>
                    </Select>
                  ) : (
                    <Title level={4} className="mt-1">
                      {card.status === 'INACTIVE' ? t('marketing.inactive') : t('marketing.active')}
                    </Title>
                  )}
                </div>
              </>
            )}
          </Can>

          {card.corporate && (
            <div>
              <h1 className="text-text02 text-sm">{t('marketing.corporationName')}:</h1>
              <Title level={4} className="mt-1 mb-0">
                {card.corporate.name}
              </Title>
              <Text className="text-text02 text-xs mt-1 block">
                INN: {card.corporate.inn}
              </Text>
              <Text className="text-text02 text-xs mt-1 block">
                {t('marketing.address')}: {card.corporate.address}
              </Text>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-3">
              <Can requiredPermissions={[{ action: 'update', subject: 'LTYProgram' }]} userPermissions={userPermissions}>
                {allowed => allowed && (
                  <Button
                    type="primary"
                    onClick={handleUpdateCard}
                    loading={isUpdating}
                    disabled={isUpdating || isCreatingEquiring}
                  >
                    {t('organizations.save')}
                  </Button>
                )}
              </Can>
              <Can requiredPermissions={[{ action: 'delete', subject: 'LTYProgram' }]} userPermissions={userPermissions}>
                {allowed => allowed && (
                  <Button
                    onClick={handleOpenEquiringModal}
                    disabled={isUpdating || isCreatingEquiring}
                  >
                    {t('marketing.addEquiring')}
                  </Button>
                )}
              </Can>
            </div>
          </div>
        </div>
      </AntCard>

      <Modal
        title={t('marketing.addEquiring')}
        open={isEquiringModalOpen}
        onCancel={handleCloseEquiringModal}
        onOk={handleCreateEquiring}
        okText={t('common.create')}
        cancelText={t('constants.cancel')}
        okButtonProps={{ loading: isCreatingEquiring, disabled: isUpdating }}
        cancelButtonProps={{ disabled: isCreatingEquiring }}
        destroyOnClose
      >
        <Form form={equiringForm} layout="vertical">
          <Form.Item
            name="type"
            label={t('marketing.operationType')}
            rules={[
              {
                required: true,
                message: t('validation.required'),
              },
            ]}
          >
            <Select
              options={[
                { value: 'TOP_UP', label: t('marketing.topUp') },
                { value: 'DECREASE', label: t('marketing.decrease') },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="money"
            label={t('marketing.amount')}
            rules={[
              {
                required: true,
                message: t('validation.required'),
              },
              {
                validator: (_, value) => {
                  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
                    return Promise.reject(
                      new Error(t('validation.positiveNumber'))
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber className="w-full" min={0.01} precision={2} controls={false} />
          </Form.Item>

          <Form.Item
            name="reason"
            label={t('marketing.reason')}
          >
            <Input.TextArea
              rows={3}
              placeholder={t('marketing.reasonPlaceholder')}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Card;
