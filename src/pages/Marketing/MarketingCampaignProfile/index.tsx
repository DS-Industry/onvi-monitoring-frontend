import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PauseCircleOutlined,
  PlayCircleFilled,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Button, message, Popconfirm, Spin, Typography } from 'antd';
import axios from 'axios';
import CarWashIcon from '@icons/car_wash-icon.svg?react';
import EquipmentIcon from '@icons/equipment-icon.svg?react';
import FinancesIcon from '@icons/finances-icon.svg?react';
import {
  cancelMarketingCampaign,
  deleteDraftMarketingCampaign,
  getMarketingCampaignById,
  getMarketingConditionsById,
  getLoyaltyPrograms,
  pauseMarketingCampaign,
  reactivateMarketingCampaign,
  updateMarketingCampaign,
  UpdateMarketingCampaignRequest,
} from '@/services/api/marketing';
import { useUser } from '@/hooks/useUserStore';
import { useToast } from '@/components/context/useContext';
import { MarketingCampaignStatus } from '@/utils/constants';
import useAuthStore from '@/config/store/authSlice';
import { Can } from '@/permissions/Can';
import CampaignHubCard from './CampaignHubCard';
import GeneralInfo from './GeneralInfo';

const { Text } = Typography;

const MarketingCampaignProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const campaignId = Number(id);
  const user = useUser();
  const { showToast } = useToast();
  const userPermissions = useAuthStore(state => state.permissions);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: campaign,
    isLoading,
    error,
    mutate: mutateCampaign,
  } = useSWR(
    campaignId ? ['get-marketing-campaign-by-id', campaignId] : null,
    () => getMarketingCampaignById(campaignId),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: conditionsData, isLoading: conditionsLoading } = useSWR(
    campaignId ? ['get-marketing-conditions-by-id', campaignId] : null,
    () => getMarketingConditionsById(campaignId),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: loyaltyProgramsData } = useSWR(
    user.organizationId ? ['get-loyalty-programs', user.organizationId] : null,
    () => getLoyaltyPrograms(user.organizationId),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const isNotFound =
    axios.isAxiosError(error) && error.response?.status === 404;

  const revalidateCampaign = () =>
    mutateCampaign();

  const handlePauseCampaign = async () => {
    try {
      setIsPausing(true);
      await pauseMarketingCampaign(campaignId);
      await revalidateCampaign();
      showToast(t('marketing.campaignPaused'), 'success');
    } catch {
      showToast(t('marketing.campaignPauseFailed'), 'error');
    } finally {
      setIsPausing(false);
    }
  };

  const handleCancelCampaign = async () => {
    try {
      setIsCancelling(true);
      await cancelMarketingCampaign(campaignId);
      await revalidateCampaign();
      showToast(t('marketing.campaignCancelled'), 'success');
    } catch {
      showToast(t('marketing.campaignCancelFailed'), 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivateCampaign = async () => {
    try {
      setIsReactivating(true);
      await reactivateMarketingCampaign(campaignId);
      await revalidateCampaign();
      showToast(t('marketing.campaignReactivated'), 'success');
    } catch {
      showToast(t('marketing.campaignReactivateFailed'), 'error');
    } finally {
      setIsReactivating(false);
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      setIsDeleting(true);
      await deleteDraftMarketingCampaign(campaignId);
      showToast(t('success.recordDeleted'), 'success');
      navigate('/marketing/campaigns');
    } catch {
      showToast(t('marketing.campaignDeleteFailed'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLaunch = async () => {
    if (!campaign || !campaign.ltyProgramId) {
      message.error(t('marketing.errorCampaign'));
      return;
    }

    const selectedProgram = loyaltyProgramsData?.find(
      item => item.props.id === campaign.ltyProgramId
    );

    if (!selectedProgram) {
      message.error(t('marketing.errorCampaign'));
      return;
    }

    try {
      setIsLaunching(true);
      const updateRequest: UpdateMarketingCampaignRequest = {
        posIds: campaign.posIds,
        ltyProgramParticipantId: selectedProgram.props.participantId,
        status: MarketingCampaignStatus.ACTIVE,
      };

      await updateMarketingCampaign(campaignId, updateRequest);
      showToast(t('marketing.campaignLaunched'), 'success');
      navigate('/marketing/campaigns');
    } catch {
      message.error(t('marketing.errorCampaign'));
    } finally {
      setIsLaunching(false);
    }
  };

  if (!campaignId || isNotFound) {
    return (
      <div className="ml-12 md:ml-0">
        <div
          className="mb-5 flex cursor-pointer text-primary02"
          onClick={() => navigate('/marketing/campaigns')}
        >
          <ArrowLeftOutlined />
          <p className="ms-2">{t('login.back')}</p>
        </div>
        <Text type="secondary">{t('table.noData')}</Text>
      </div>
    );
  }

  if (isLoading || conditionsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const conditionsCount = conditionsData?.conditions?.length ?? 0;
  const isActive = campaign.status === MarketingCampaignStatus.ACTIVE;
  const isPaused = campaign.status === MarketingCampaignStatus.PAUSED;
  const canDelete = campaign.campaignUsage === 0 && !isActive && !isPaused;
  const canLaunch = !isActive && !isPaused;

  return (
    <div className="pb-10">
      <div className="mb-10 ml-12 md:ml-0">
        <div className="flex items-center gap-10">
          <div
            className="flex cursor-pointer text-primary02"
            onClick={() => navigate('/marketing/campaigns')}
          >
            <ArrowLeftOutlined />
            <p className="ms-2">{t('login.back')}</p>
          </div>
          <span className="text-xl font-bold text-text01 sm:text-3xl">
            {t('routes.viewMarketingCampaign')}
          </span>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <CampaignHubCard
            icon={<CarWashIcon className="h-6 w-6 text-white" />}
            title={t('warehouse.basic')}
            subtitle={t('marketingCampaigns.profileBasicSubtitle')}
          />
          <CampaignHubCard
            icon={<EquipmentIcon className="h-6 w-6 text-white" />}
            title={t('routes.edit')}
            subtitle={t('marketingCampaigns.profileEditSubtitle')}
            onClick={() =>
              navigate({
                pathname: '/marketing/campaign/create',
                search: `?marketingCampaignId=${campaignId}&mode=edit`,
              })
            }
          />
          <CampaignHubCard
            icon={<FinancesIcon className="h-6 w-6 text-white" />}
            title={t('marketingLoyalty.stats')}
            subtitle={t('marketingCampaigns.profileStatsSubtitle')}
            onClick={() => navigate(`/marketing/campaign/${campaignId}/stats`)}
          />
        </div>

        <GeneralInfo campaign={campaign} conditionsCount={conditionsCount} />

        <Can
          requiredPermissions={[{ action: 'update', subject: 'LTYProgram' }]}
          userPermissions={userPermissions}
        >
          {allowed =>
            allowed ? (
              <div className="flex flex-wrap justify-end gap-4 pb-2 pt-6">
                <Button
                  className="btn-outline-primary"
                  onClick={() => navigate('/marketing/campaigns')}
                >
                  {t('marketingLoyalty.saveAndExit')}
                </Button>

                {isActive && (
                  <>
                    <Popconfirm
                      title={t('marketing.confirmPauseCampaign')}
                      onConfirm={handlePauseCampaign}
                      okText={t('marketing.pauseCampaign')}
                      okType="default"
                      cancelText={t('common.cancel')}
                    >
                      <Button
                        className="btn-outline-primary"
                        icon={<PauseCircleOutlined />}
                        loading={isPausing}
                      >
                        {t('marketing.pauseCampaign')}
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title={t('marketing.confirmCancelCampaign')}
                      onConfirm={handleCancelCampaign}
                      okText={t('marketing.cancelCampaign')}
                      okType="danger"
                      cancelText={t('common.cancel')}
                    >
                      <Button
                        className="btn-outline-danger"
                        icon={<StopOutlined />}
                        loading={isCancelling}
                      >
                        {t('marketing.cancelCampaign')}
                      </Button>
                    </Popconfirm>
                  </>
                )}

                {isPaused && (
                  <Popconfirm
                    title={t('marketing.confirmReactivateCampaign')}
                    onConfirm={handleReactivateCampaign}
                    okText={t('marketing.reactivateCampaign')}
                    okType="default"
                    cancelText={t('common.cancel')}
                  >
                    <Button
                      type="primary"
                      className="btn-primary"
                      icon={<PlayCircleOutlined />}
                      loading={isReactivating}
                    >
                      {t('marketing.reactivateCampaign')}
                    </Button>
                  </Popconfirm>
                )}

                {canDelete && (
                  <Popconfirm
                    title={t('techTasks.confirmDelete')}
                    onConfirm={handleDeleteCampaign}
                    okText={t('common.delete')}
                    okType="danger"
                    cancelText={t('common.cancel')}
                  >
                    <Button
                      className="btn-outline-danger"
                      icon={<DeleteOutlined />}
                      loading={isDeleting}
                    >
                      {t('common.delete')}
                    </Button>
                  </Popconfirm>
                )}

                {canLaunch && (
                  <Button
                    type="primary"
                    className="btn-primary"
                    icon={<PlayCircleFilled />}
                    loading={isLaunching}
                    onClick={handleLaunch}
                  >
                    {t('marketing.launchNow')}
                  </Button>
                )}
              </div>
            ) : null
          }
        </Can>
      </div>
    </div>
  );
};

export default MarketingCampaignProfile;
