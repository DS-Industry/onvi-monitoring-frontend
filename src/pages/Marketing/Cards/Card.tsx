import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import {
  getCardById,
  updateCard,
  getTiers,
  UpdateCardRequest,
} from '@/services/api/marketing';
import { Spin, Card as AntCard, Typography, Select, Button, message, Skeleton } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useToast } from '@/components/context/useContext';

const { Title, Text } = Typography;
const { Option } = Select;

const Card: React.FC = () => {
  const { t } = useTranslation();
  const { cardId: cardIdParam } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const cardId = cardIdParam ? Number(cardIdParam) : undefined;

  const [selectedTierId, setSelectedTierId] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [isUpdating, setIsUpdating] = useState(false);

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
        onClick={() => navigate('/marketing/cards')}
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

          <div>
            <Text className="text-text02 text-sm">{t('marketing.level')}:</Text>
            {tiersLoading ? (
              <div className="mt-2">
                <Skeleton.Input active style={{ width: '100%', height: 32 }} />
              </div>
            ) : (
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
            )}
          </div>

          <div>
            <Text className="text-text02 text-sm">{t('marketing.status') || 'Status'}:</Text>
            <Select
              className="w-full mt-2"
              placeholder={t('marketing.selectStatus') || 'Select Status'}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Option value="ACTIVE">{t('marketing.active')}</Option>
              <Option value="INACTIVE">{t('marketing.inactive')}</Option>
            </Select>
          </div>

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
            <Button
              type="primary"
              onClick={handleUpdateCard}
              loading={isUpdating}
              disabled={isUpdating}
            >
              {t('organizations.save') || 'Save Changes'}
            </Button>
          </div>
        </div>
      </AntCard>
    </div>
  );
};

export default Card;
