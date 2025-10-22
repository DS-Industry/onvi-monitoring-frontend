import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileTextOutlined, PlayCircleOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import useSWR, { mutate } from 'swr';
import {
  getLoyaltyProgramById,
  getPosesParticipants,
  publishLoyaltyProgram,
  requestHubStatus,
  unpublishLoyaltyProgram,
} from '@/services/api/marketing';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Divider, Input, Modal } from 'antd';
import { useToast } from '@/components/context/useContext';
import useSWRMutation from 'swr/mutation';
import { updateSearchParams } from '@/utils/searchParamsUtils';

interface PublicationsProps {
  isEditable?: boolean;
}

const Publications: React.FC<PublicationsProps> = ({ isEditable = true }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const loyaltyProgramId = Number(searchParams.get('loyaltyProgramId'));
  const currentStep = Number(searchParams.get('step')) || 1;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isHubRequestModalOpen, setIsHubRequestModalOpen] = useState(false);
  const [hubRequestComment, setHubRequestComment] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const isUpdate = Boolean(searchParams.get('mode') === 'edit');

  const { data: program, isLoading: loadingPrograms } = useSWR(
    loyaltyProgramId ? [`get-loyalty-program-by-id`, loyaltyProgramId] : null,
    () => getLoyaltyProgramById(loyaltyProgramId)
  );

  const { data: participantsData } = useSWR(
    loyaltyProgramId ? [`get-devices`, loyaltyProgramId] : null,
    () => getPosesParticipants(loyaltyProgramId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { trigger: requestHub, isMutating: isRequestingHub } = useSWRMutation(
    ['request-hub-status'],
    async (_, { arg }: { arg: { id: number; comment?: string } }) => {
      return requestHubStatus(arg.id, arg.comment);
    }
  );

  const handlePublishToggle = async () => {
    if (!program || !loyaltyProgramId) return;

    try {
      setIsPublishing(true);

      const isActive = program.status === 'ACTIVE';
      const apiFn = isActive ? unpublishLoyaltyProgram : publishLoyaltyProgram;

      const result = await apiFn(loyaltyProgramId);

      if (result) {
        showToast(
          isActive
            ? t('marketingLoyalty.loyaltyUnpublished')
            : t('marketingLoyalty.loyaltyPublished'),
          'success'
        );

        await mutate([`get-loyalty-program-by-id`, loyaltyProgramId]);

        navigate('/marketing/loyalty');
      }
    } catch (error) {
      showToast(t('common.errorOccurred'), 'error');
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleHubRequest = async () => {
    try {
      if (!loyaltyProgramId) return;

      await requestHub({
        id: loyaltyProgramId,
        comment: hubRequestComment || undefined,
      });

      showToast(t('marketing.hubRequestSubmitted'), 'success');
      setIsHubRequestModalOpen(false);
      setHubRequestComment('');
      mutate([`get-loyalty-program-by-id`, loyaltyProgramId]);
    } catch (error) {
      console.error('Error during hub request: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const goBack = () => {
    updateSearchParams(searchParams, setSearchParams, {
      step: currentStep - 1,
    });
  };

  const goNext = () => {
    updateSearchParams(searchParams, setSearchParams, {
      step: currentStep + 1,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-center bg-background02">
        <div className="flex flex-col rounded-lg w-full space-y-6 sm:space-y-8 lg:space-y-10">
          <div className="flex flex-col space-y-10 sm:space-y-0 sm:flex-row sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="aspect-square w-10 rounded-full bg-primary02 flex items-center justify-center text-text04">
                <FileTextOutlined style={{ fontSize: 20 }} />
              </div>
              <div>
                <div className="font-semibold text-text01">
                  {t('marketingLoyalty.publication')}
                </div>
                <div className="text-base03 text-xs">
                  {t('marketingLoyalty.implementation')}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="text-sm font-semibold text-text01">
              {t('marketingLoyalty.basicInformation')}
            </div>
            <div className="flex flex-col space-y-4 text-text01 text-xs">
              <div>{t('marketingLoyalty.name')}</div>
              <div>{t('marketingLoyalty.description')}</div>
              <div>{t('marketingLoyalty.maxLevels')}</div>
            </div>
            <div className="flex flex-col space-y-4 text-sm text-base03">
              <div>{program?.name || '-'}</div>
              <div>{program?.description || '-'}</div>
              <div>{program?.maxLevels || '-'}</div>
            </div>
          </div>
          <Divider />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="text-sm font-semibold text-text01">
              {t('marketing.write')}
            </div>
            <div className="flex flex-col space-y-4 text-text01 text-xs">
              <div>{t('marketingLoyalty.maxWriteOffPercent')}</div>
              <div>{t('marketing.use')}</div>
              <div>{t('marketingLoyalty.bonusExpiration')}</div>
            </div>
            <div className="flex flex-col space-y-4 text-sm text-base03">
              <div>{program?.maxRedeemPercentage || '0%'}</div>
              <div>{program?.hasBonusWithSale || '-'}</div>
              <div>
                {program?.lifetimeBonusDays || '0'} {t('marketingLoyalty.days')}
              </div>
            </div>
          </div>
          <Divider />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="text-sm font-semibold text-text01">
              {t('marketingLoyalty.participantsAndLevels')}
            </div>
            <div className="flex flex-col space-y-4 text-text01 text-xs">
              <div>{t('marketingLoyalty.participatingBranches')}</div>
              <div>{t('marketingLoyalty.numberOfLevels')}</div>
            </div>
            <div className="flex flex-col space-y-4 text-sm text-base03">
              <div>{participantsData?.length || '-'}</div>
              <div>{program?.maxLevels || '-'}</div>
            </div>
          </div>
          <Divider />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="text-sm font-semibold text-text01">
              {t('marketingLoyalty.hub')}
            </div>
            <div className="flex flex-col space-y-4 text-base03 text-xs">
              <div>{t('marketingLoyalty.hubRequest')}</div>
            </div>
            {program && program.isHub ? (
              <span className="bg-successFill text-white px-2 py-0.5 rounded text-sm max-w-48 flex justify-center">
                {t('marketing.hub')}
              </span>
            ) : program?.isHubRejected ? (
              <span className="bg-errorFill text-white px-2 py-0.5 rounded text-sm max-w-48 flex justify-center">
                {t('marketing.hubRejected')}
              </span>
            ) : program?.isHubRequested ? (
              <span className="bg-primary01 text-white px-2 py-0.5 rounded text-sm max-w-48 flex justify-center">
                {t('marketing.hubRequested')}
              </span>
            ) : loadingPrograms ? (
              <></>
            ) : (
              <Button
                className="bg-primary01 w-32"
                onClick={() => setIsHubRequestModalOpen(true)}
                disabled={!loyaltyProgramId}
              >
                {t('marketing.requestHub')}
              </Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end">
            <Button 
              className="text-primary02 w-full sm:w-auto"
            >
              {t('marketingLoyalty.saveAndExit')}
            </Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handlePublishToggle}
              loading={isPublishing}
              className="w-full sm:w-auto"
            >
              {program?.status === 'ACTIVE' ? t('marketingLoyalty.stopNow') : t('marketingLoyalty.startNow')}
            </Button>
          </div>
        </div>
      </div>
      
      {isEditable && (
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
        <div className="order-2 sm:order-1">
          {currentStep > 1 && isUpdate && (
            <Button
              icon={<LeftOutlined />}
              onClick={goBack}
              className="w-full sm:w-auto"
            >
              {t('common.back')}
            </Button>
          )}
        </div>
        {isUpdate && <Button
          type="primary"
          icon={<RightOutlined />}
          iconPosition="end"
          onClick={goNext}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {t('common.next')}
        </Button>}
      </div>
      )}
      
      <Modal
        title={t('marketing.requestHub')}
        open={isHubRequestModalOpen}
        onOk={handleHubRequest}
        onCancel={() => {
          setIsHubRequestModalOpen(false);
          setHubRequestComment('');
        }}
        confirmLoading={isRequestingHub}
        okText={t('actions.submit')}
        cancelText={t('actions.cancel')}
      >
        <div className="space-y-4">
          <p className="text-text02">{t('marketing.hubRequestDescription')}</p>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('marketing.comment')}
            </label>
            <Input.TextArea
              value={hubRequestComment}
              onChange={e => setHubRequestComment(e.target.value)}
              placeholder={t('marketing.hubRequestCommentPlaceholder')}
              rows={4}
              maxLength={500}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Publications;
