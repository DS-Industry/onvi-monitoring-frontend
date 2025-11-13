import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { RightOutlined, SettingOutlined, GiftOutlined, DollarOutlined, PercentageOutlined, BankOutlined, ScheduleOutlined } from '@ant-design/icons';
import { useToast } from '@/components/context/useContext';
import useSWR from 'swr';
import {
    updateMarketingCampaigns,
    MarketingCampaignUpdateDto,
    CampaignExecutionType,
    getMarketingCampaignById,
    createMarketingCampaignAction,
    ACTION_TYPE,
} from '@/services/api/marketing';
import ActionTypeCard from './ActionTypeCard';

interface ExecutionTypeProps {
    isEditable?: boolean;
}

const ExecutionType: React.FC<ExecutionTypeProps> = ({ isEditable = true }) => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { showToast } = useToast();
    const marketingCampaignId = Number(searchParams.get('marketingCampaignId'));
    const [executionType, setExecutionType] = useState<CampaignExecutionType | null>(null);
    const [updating, setUpdating] = useState(false);
    const [actionType, setActionType] = useState<ACTION_TYPE | null>(null);

    const {
        data: marketingCampaign,
        isLoading,
        isValidating,
    } = useSWR(
        marketingCampaignId
            ? [`get-marketing-campaign-by-id`, marketingCampaignId]
            : null,
        () => getMarketingCampaignById(marketingCampaignId),
        {
            revalidateOnFocus: false,
        }
    );

    useEffect(() => {
        if (marketingCampaign?.executionType) {
            setExecutionType(marketingCampaign.executionType as CampaignExecutionType);
        }

        if (marketingCampaign?.actionType) {
            setActionType(marketingCampaign.actionType as ACTION_TYPE);
        }
    }, [marketingCampaign]);

    const handleNext = async () => {
        if (!marketingCampaignId) {
            showToast(t('errors.other.errorDuringFormSubmission'), 'error');
            return;
        }

        if (!executionType) {
            message.warning(t('validation.executionTypeRequired'));
            return;
        }

        if (!actionType) {
            message.warning(t('validation.actionTypeRequired'));
            return;
        }

        try {
            setUpdating(true);
            const payload: MarketingCampaignUpdateDto = {
                executionType,
            };

            await updateMarketingCampaigns(payload, marketingCampaignId);


            await createMarketingCampaignAction({
                campaignId: marketingCampaignId,
                actionType: actionType,
            });


            showToast(t('marketing.loyaltyCreated'), 'success');

            updateSearchParams(searchParams, setSearchParams, {
                step: 3,
            });
        } catch (error) {
            console.error('Error updating execution type: ', error);
            showToast(t('errors.other.errorDuringFormSubmission'), 'error');
        } finally {
            setUpdating(false);
        }
    };

    if (isLoading || isValidating) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-background02 p-6 rounded-lg">
                <div className="text-text02">{t('common.loading') || 'Loading...'}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 sm:space-y-8 lg:space-y-10 bg-background02 p-6 rounded-lg">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary02 flex items-center justify-center rounded-full text-white">
                    <SettingOutlined style={{ fontSize: 24 }} />
                </div>
                <div>
                    <div className="font-bold text-text01 text-2xl">
                        {t('marketingCampaigns.actionType')}
                    </div>
                    <div className="text-base03 text-md">
                        {t('marketingCampaigns.actionTypeDescription')}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 mt-6">
                <div>
                    <div className="text-text01 text-sm font-semibold mb-4">
                        {t('marketingCampaigns.triggerType')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card
                            hoverable
                            onClick={() => {
                                if (isEditable) {
                                    if (executionType !== CampaignExecutionType.TRANSACTIONAL) {
                                        setActionType(null)
                                    }
                                    setExecutionType(CampaignExecutionType.TRANSACTIONAL);
                                }
                            }}
                            className={`cursor-pointer transition-all ${executionType === CampaignExecutionType.TRANSACTIONAL
                                ? 'border-primary02 border-2 shadow-md bg-[#F5FBFF]'
                                : 'border-gray-200'
                                }`}
                            style={{
                                borderRadius: 12,
                                minHeight: 140,
                            }}
                        >
                            <div className="flex flex-col items-start">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 flex items-center justify-center rounded-lg mb-3">
                                        <BankOutlined style={{ fontSize: 24, color: '#0B68E1' }} />
                                    </div>
                                    <div className="ms-3 font-semibold text-[#0B68E1] text-base mb-2">
                                        {t('marketingCampaigns.transactional')}
                                    </div>
                                </div>
                                <div className="text-base03 text-sm">
                                    {t('marketingCampaigns.transactionalDescription')}
                                </div>
                            </div>
                        </Card>

                        <Card
                            hoverable
                            onClick={() => {
                                if (isEditable) {
                                    if (executionType !== CampaignExecutionType.BEHAVIORAL) {
                                        setActionType(null)
                                    }
                                    setExecutionType(CampaignExecutionType.BEHAVIORAL);
                                }
                            }}
                            className={`cursor-pointer transition-all ${executionType === CampaignExecutionType.BEHAVIORAL
                                ? 'border-primary02 border-2 shadow-md bg-[#F5FBFF]'
                                : 'border-gray-200'
                                }`}
                            style={{
                                borderRadius: 12,
                                minHeight: 140,
                            }}
                        >
                            <div className="flex flex-col items-start">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-primary02/10 flex items-center justify-center rounded-lg mb-3">
                                        <ScheduleOutlined style={{ fontSize: 24, color: '#0B68E1' }} />
                                    </div>
                                    <div className="ms-3 font-semibold text-[#0B68E1] text-base mb-2">
                                        {t('marketingCampaigns.behavioral')}
                                    </div>
                                </div>
                                <div className="text-base03 text-sm">
                                    {t('marketingCampaigns.behavioralDescription')}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <div>
                    <div className="text-text01 text-sm font-semibold mb-4">
                        {t('marketingCampaigns.actionType')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ActionTypeCard
                            actionType="DISCOUNT"
                            icon={PercentageOutlined}
                            titleKey="marketingCampaigns.discount"
                            descriptionKey="marketingCampaigns.discountDescription"
                            requiredExecutionType={CampaignExecutionType.TRANSACTIONAL}
                            selectedActionType={actionType}
                            executionType={executionType}
                            isEditable={isEditable}
                            onSelect={setActionType}
                        />

                        <ActionTypeCard
                            actionType="PROMOCODE_ISSUE"
                            icon={GiftOutlined}
                            titleKey="marketingCampaigns.promocode"
                            descriptionKey="marketingCampaigns.promocodeDescription"
                            requiredExecutionType={CampaignExecutionType.TRANSACTIONAL}
                            selectedActionType={actionType}
                            executionType={executionType}
                            isEditable={isEditable}
                            onSelect={setActionType}
                        />

                        <ActionTypeCard
                            actionType="CASHBACK_BOOST"
                            icon={BankOutlined}
                            titleKey="marketingCampaigns.cashback"
                            descriptionKey="marketingCampaigns.cashbackDescription"
                            requiredExecutionType={CampaignExecutionType.BEHAVIORAL}
                            selectedActionType={actionType}
                            executionType={executionType}
                            isEditable={isEditable}
                            onSelect={setActionType}
                        />

                        <ActionTypeCard
                            actionType="GIFT_POINTS"
                            icon={DollarOutlined}
                            titleKey="marketingCampaigns.points"
                            descriptionKey="marketingCampaigns.pointsDescription"
                            requiredExecutionType={CampaignExecutionType.BEHAVIORAL}
                            selectedActionType={actionType}
                            executionType={executionType}
                            isEditable={isEditable}
                            onSelect={setActionType}
                        />
                    </div>
                </div>

            </div >

            {
                isEditable && (
                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="primary"
                            icon={<RightOutlined />}
                            iconPosition="end"
                            loading={updating}
                            onClick={handleNext}
                            size="large"
                        >
                            {t('common.next')}
                        </Button>
                    </div>
                )
            }
        </div >
    );
};

export default ExecutionType;

