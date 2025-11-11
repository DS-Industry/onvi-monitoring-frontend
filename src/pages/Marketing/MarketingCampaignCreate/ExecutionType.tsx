import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { RightOutlined } from '@ant-design/icons';
import { useToast } from '@/components/context/useContext';
import useSWR from 'swr';
import {
    updateMarketingCampaigns,
    MarketingCampaignUpdateDto,
    CampaignExecutionType,
    getMarketingCampaignById,
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

    const handleNext = async () => {
        if (!marketingCampaignId) {
            showToast(t('errors.other.errorDuringFormSubmission') || 'Campaign ID is required', 'error');
            return;
        }

        if (!executionType) {
            message.warning(t('validation.executionTypeRequired') || 'Please select an execution type');
            return;
        }

        try {
            setUpdating(true);
            const payload: MarketingCampaignUpdateDto = {
                executionType,
            };

            await updateMarketingCampaigns(payload, marketingCampaignId);
            showToast(t('marketing.loyaltyCreated') || 'Execution type updated successfully', 'success');

            updateSearchParams(searchParams, setSearchParams, {
                step: 4,
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
                    <RightOutlined style={{ fontSize: 24 }} />
                </div>
                <div>
                    <div className="font-bold text-text01 text-2xl">
                        {t('marketingCampaigns.executionType')}
                    </div>
                    <div className="text-base03 text-md">
                        {t('marketingCampaigns.selectExecutionType')}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 mt-6">
                <div className="text-text01 text-sm font-semibold">
                    {t('marketingCampaigns.executionType')}
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button
                        type={executionType === CampaignExecutionType.TRANSACTIONAL ? 'primary' : 'default'}
                        size="large"
                        onClick={() => setExecutionType(CampaignExecutionType.TRANSACTIONAL)}
                        disabled={!isEditable}
                        className="min-w-[200px] h-16 text-base"
                    >
                        {t('marketingCampaigns.transactional') || 'Transactional'}
                    </Button>

                    <Button
                        type={executionType === CampaignExecutionType.BEHAVIORAL ? 'primary' : 'default'}
                        size="large"
                        onClick={() => setExecutionType(CampaignExecutionType.BEHAVIORAL)}
                        disabled={!isEditable}
                        className="min-w-[200px] h-16 text-base"
                    >
                        {t('marketingCampaigns.behavioral') || 'Behavioral'}
                    </Button>
                </div>
            </div>

            {isEditable && (
                <div className="flex justify-end gap-2 mt-3">
                    <Button
                        type="primary"
                        icon={<RightOutlined />}
                        iconPosition="end"
                        loading={updating}
                        onClick={handleNext}
                    >
                        {t('common.next')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ExecutionType;

