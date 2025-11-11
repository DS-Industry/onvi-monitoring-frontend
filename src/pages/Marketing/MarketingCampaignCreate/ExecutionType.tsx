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
} from '@/services/api/marketing';

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
    const [actionType, setActionType] = useState<string | null>(null);

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
    }, [marketingCampaign]);

    useEffect(() => {
        const promoTypeFromParams = searchParams.get('promoType');
        if (promoTypeFromParams) {
            setActionType(promoTypeFromParams);
        }
    }, [searchParams]);

    const handleNext = async () => {
        if (!marketingCampaignId) {
            showToast(t('errors.other.errorDuringFormSubmission') || 'Campaign ID is required', 'error');
            return;
        }

        if (!executionType) {
            message.warning(t('validation.executionTypeRequired') || 'Please select an execution type');
            return;
        }

        if (!actionType) {
            message.warning(t('validation.actionTypeRequired') || 'Please select a promo type');
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

            showToast(t('marketing.loyaltyCreated') || 'Execution type updated successfully', 'success');

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
                                    setExecutionType(CampaignExecutionType.TRANSACTIONAL);
                                }
                            }}
                            className={`cursor-pointer transition-all ${executionType === CampaignExecutionType.TRANSACTIONAL
                                ? 'border-primary02 border-2 shadow-md'
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
                                    setExecutionType(CampaignExecutionType.BEHAVIORAL);
                                }
                            }}
                            className={`cursor-pointer transition-all ${executionType === CampaignExecutionType.BEHAVIORAL
                                ? 'border-primary02 border-2 shadow-md'
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
                        <Card
                            hoverable
                            onClick={() => {
                                if (isEditable) {
                                    setActionType('discount');
                                    updateSearchParams(searchParams, setSearchParams, {
                                        promoType: 'discount',
                                    });
                                }
                            }}
                            className={`cursor-pointer transition-all ${actionType === 'discount'
                                ? 'border-primary02 border-2 shadow-md'
                                : 'border-gray-200'
                                }`}
                            style={{
                                borderRadius: 12,
                                minHeight: 100,
                            }}
                        >
                            <div>
                                <div className="flex justify-center w-full">
                                    <div className="flex items-center space-x-3">
                                        <PercentageOutlined style={{ fontSize: 24, color: '#0B68E1' }} />
                                        <div className="font-semibold text-[#0B68E1] text-lg">
                                            {t('marketingCampaigns.discount')}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-base03 text-sm mt-4 text-center">
                                    {t('marketingCampaigns.discountDescription')}
                                </div>
                            </div>
                        </Card>

                        <Card
                            hoverable
                            onClick={() => {
                                if (isEditable) {
                                    setActionType('promocode');
                                    updateSearchParams(searchParams, setSearchParams, {
                                        promoType: 'promocode',
                                    });
                                }
                            }}
                            className={`cursor-pointer transition-all ${actionType === 'promocode'
                                ? 'border-primary02 border-2 shadow-md'
                                : 'border-gray-200'
                                }`}
                            style={{
                                borderRadius: 12,
                                minHeight: 100,
                            }}
                        >
                            <div className="flex justify-center w-full">
                                <div className="flex items-center space-x-3">
                                    <GiftOutlined style={{ fontSize: 24, color: '#0B68E1' }} />
                                    <div className="font-semibold text-[#0B68E1] text-lg">
                                        {t('marketingCampaigns.promocode')}
                                    </div>
                                </div>
                            </div>
                            <div className="text-base03 text-sm mt-4 text-center">
                                {t('marketingCampaigns.promocodeDescription')}
                            </div>

                        </Card>

                        <Card
                            hoverable
                            onClick={() => {
                                if (isEditable) {
                                    setActionType('cashback');
                                    updateSearchParams(searchParams, setSearchParams, {
                                        promoType: 'cashback',
                                    });
                                }
                            }}
                            className={`cursor-pointer transition-all ${actionType === 'cashback'
                                ? 'border-primary02 border-2 shadow-md'
                                : 'border-gray-200'
                                }`}
                            style={{
                                borderRadius: 12,
                                minHeight: 140,
                            }}
                        >
                            <div className="flex justify-center w-full">
                                <div className="flex items-center space-x-3">
                                    <BankOutlined style={{ fontSize: 24, color: '#0B68E1' }} />
                                    <div className="font-semibold text-[#0B68E1] text-lg">
                                        {t('marketingCampaigns.cashback')}
                                    </div>
                                </div>
                            </div>
                            <div className="text-base03 text-sm mt-4 text-center">
                                {t('marketingCampaigns.cashbackDescription')}
                            </div>
                        </Card>

                        <Card
                            hoverable
                            onClick={() => {
                                if (isEditable) {
                                    setActionType('points');
                                    updateSearchParams(searchParams, setSearchParams, {
                                        promoType: 'points',
                                    });
                                }
                            }}
                            className={`cursor-pointer transition-all ${actionType === 'points'
                                ? 'border-primary02 border-2 shadow-md'
                                : 'border-gray-200'
                                }`}
                            style={{
                                borderRadius: 12,
                                minHeight: 140,
                            }}
                        >
                            <div className="flex justify-center w-full">
                                <div className="flex items-center space-x-3">
                                    <DollarOutlined style={{ fontSize: 24, color: '#0B68E1' }} />
                                    <div className="font-semibold text-[#0B68E1] text-lg">
                                        {t('marketingCampaigns.points')}
                                    </div>
                                </div>
                            </div>
                            <div className="text-base03 text-sm mt-4 text-center">
                                {t('marketingCampaigns.pointsDescription')}
                            </div>
                        </Card>
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

