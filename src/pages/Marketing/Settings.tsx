import React, { useEffect, useState } from 'react';
import BonusImage from '@icons/BasicBonus.svg?react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Input, Modal } from 'antd';

import { Skeleton } from 'antd';
import useSWR, { mutate } from 'swr';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import {
  createLoyaltyProgram,
  getLoyaltyProgramById,
  updateLoyaltyProgram,
  requestHubStatus,
} from '@/services/api/marketing';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/context/useContext';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useUser } from '@/hooks/useUserStore';
import { getPoses } from '@/services/api/equipment';

import { Checkbox, Collapse, Space } from 'antd';
import { usePermissions } from '@/hooks/useAuthStore';
const { Panel } = Collapse;

const MAX_VISIBLE = 5;

type LoyaltyPrograms = {
  name: string;
  organizationIds: number[];
  lifetimeDays?: number;
};

type UpdateLoyalty = {
  loyaltyProgramId: number;
  name?: string;
};

type Props = {
  nextStep?: (val: number) => void;
};

const Settings: React.FC<Props> = ({ nextStep }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const user = useUser();

  const [searchParams, setSearchParams] = useSearchParams();

  const loyaltyId = Number(searchParams.get('loyaltyId')) || undefined;

  const permissions = usePermissions();

  const hasPermission = user?.organizationId
    ? permissions.some(
        permission =>
          (permission.action === 'manage' || permission.action === 'update' || permission.action === 'read') &&
          permission.subject === 'Pos' &&
          Array.isArray(permission.conditions?.organizationId?.in) &&
          permission.conditions.organizationId.in.includes(user.organizationId!)
      )
    : false;

  const { data: loyaltyData, isValidating: loadingPrograms } = useSWR(
    loyaltyId ? [`get-loyalty-program-by-id`] : null,
    () => getLoyaltyProgramById(loyaltyId ? loyaltyId : 0),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const loyaltyById = loyaltyData;
  const defaultValues: LoyaltyPrograms = {
    name: '',
    organizationIds: [],
    lifetimeDays: undefined,
  };

  const [formData, setFormData] = useState(defaultValues);
  const [isHubRequestModalOpen, setIsHubRequestModalOpen] = useState(false);
  const [hubRequestComment, setHubRequestComment] = useState('');

  const { handleSubmit, errors, reset, setValue } = useFormHook(formData);

  const { trigger: createLoyalty, isMutating } = useSWRMutation(
    ['create-loyalty-program'],
    async (
      _,
      {
        arg,
      }: {
        arg: {
          name: string;
          organizationIds: number[];
          lifetimeDays?: number;
          ownerOrganizationId: number;
        };
      }
    ) => {
      return createLoyaltyProgram(arg);
    }
  );

  const { data: posData } = useSWR(
    [`get-pos`, user.organizationId],
    () => getPoses({ organizationId: user.organizationId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const payload: UpdateLoyalty = {
    loyaltyProgramId: loyaltyId ? loyaltyId : 0,
    name: formData.name,
  };

  const { trigger: updateLoyalty } = useSWRMutation(
    ['update-loyalty-program'],
    async () => updateLoyaltyProgram(payload)
  );

  const { trigger: requestHub, isMutating: isRequestingHub } = useSWRMutation(
    ['request-hub-status'],
    async (_, { arg }: { arg: { id: number; comment?: string } }) => {
      return requestHubStatus(arg.id, arg.comment);
    }
  );

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
  };

  const onSubmit = async () => {
    try {
      if (!user.organizationId) return;
      const result = await createLoyalty({
        name: formData.name,
        organizationIds: [user.organizationId],
        ownerOrganizationId: user.organizationId,
        lifetimeDays: formData.lifetimeDays,
      });
      if (result) {
        updateSearchParams(searchParams, setSearchParams, {
          loyaltyId: result.props.id,
        });

        nextStep?.(result.props.id);
        resetForm();
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  useEffect(() => {
    if (loyaltyById?.id) {
      setFormData({
        name: loyaltyById.name,
        organizationIds: loyaltyById.organizations.map(org => org.id),
        lifetimeDays: loyaltyById.lifetimeDays,
      });
    }
  }, [loyaltyById]);

  const handleUpdate = async () => {
    try {
      const result = await updateLoyalty();
      if (result) {
        mutate([`get-loyalty-program-by-id`]);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const handleHubRequest = async () => {
    try {
      if (!loyaltyId) return;

      await requestHub({
        id: loyaltyId,
        comment: hubRequestComment || undefined,
      });

      showToast(t('marketing.hubRequestSubmitted'), 'success');
      setIsHubRequestModalOpen(false);
      setHubRequestComment('');
      mutate([`get-loyalty-program-by-id`]);
    } catch (error) {
      console.error('Error during hub request: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  return (
    <Card
      className="rounded-2xl shadow-card w-full max-w-[1400px]"
      styles={{
        body: {
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        },
      }}
    >
      <form className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BonusImage />

            <div>
              <div className="text-lg font-semibold text-text01">
                {t('marketing.basic')}
              </div>
              <div className="text-text02">{t('marketing.setup')}</div>
            </div>
          </div>
          {loyaltyData && loyaltyData.isHub ? (
            <span className="bg-green-500 text-white px-2 py-0.5 rounded text-sm">
              {t('marketing.hub')}
            </span>
          ) : loyaltyData?.isHubRejected ? (
            <span className="bg-red-500 text-white px-2 py-0.5 rounded text-sm">
              {t('marketing.hubRejected')}
            </span>
          ) : loyaltyData?.isHubRequested ? (
            <span className="bg-green-500 text-white px-2 py-0.5 rounded text-sm">
              {t('marketing.hubRequested')}
            </span>
          ) : loadingPrograms ? (
            <></>
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={() => setIsHubRequestModalOpen(true)}
              disabled={!loyaltyId}
            >
              {t('marketing.requestHub')}
            </Button>
          )}
        </div>
        <div className="mt-5">
          {loadingPrograms ? (
            <div className="space-y-6">
              <Skeleton active paragraph={{ rows: 3 }} />
              <Skeleton.Input active size="large" style={{ maxWidth: 320 }} />
              <div className="flex flex-col sm:flex-row gap-4 mt-5">
                <Skeleton.Input active size="large" style={{ maxWidth: 320 }} />
                <Skeleton.Input active size="large" style={{ maxWidth: 320 }} />
              </div>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-semibold text-text01">
                {t('marketing.branch')}
              </div>
              <div className="text-text02">
                <div>{t('marketing.setUpBranch')}</div>
                <div>{t('marketing.branchCan')}</div>
              </div>

              <div className="">
                <div className="max-w-80">
                  <label className="block text-sm font-medium mb-1">
                    {t('equipment.name')}
                  </label>
                  <Input
                    value={formData.name}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      setValue('name', e.target.value, {
                        shouldValidate: true,
                      });
                    }}
                    status={errors.name ? 'error' : ''}
                    placeholder={t('equipment.name')}
                  />
                  {errors.name && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </div>
                  )}
                </div>
                <div>
                  {posData && posData.length > 0 && (
                    <Card
                      className="rounded-2xl border-text03 w-fit mt-5"
                      styles={{
                        body: {
                          padding: '10px 24px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px',
                        },
                      }}
                    >
                      <Space direction="vertical" className="w-full">
                        {posData.slice(0, MAX_VISIBLE).map(pos => (
                          <Checkbox key={pos.id} value={pos.id} checked>
                            {pos.name} — {pos.address}
                          </Checkbox>
                        ))}

                        {posData.length > MAX_VISIBLE && (
                          <Collapse ghost>
                            <Panel
                              header={`+${posData.length - MAX_VISIBLE} more`}
                              key="more"
                            >
                              <Space direction="vertical" className="w-full">
                                {posData.slice(MAX_VISIBLE).map(pos => (
                                  <Checkbox key={pos.id} value={pos.id}>
                                    {pos.name} — {pos.address}
                                  </Checkbox>
                                ))}
                              </Space>
                            </Panel>
                          </Collapse>
                        )}
                      </Space>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {hasPermission && (
          <div className="flex space-x-4">
            {loyaltyId === undefined ? (
              <Button
                loading={isMutating}
                onClick={() => handleSubmit(onSubmit)()}
                type="primary"
              >
                {t('common.create')}
              </Button>
            ) : (
              <Button
                loading={isMutating}
                onClick={handleUpdate}
                type="primary"
              >
                {t('organizations.save')}
              </Button>
            )}
          </div>
        )}
      </form>

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
    </Card>
  );
};

export default Settings;
