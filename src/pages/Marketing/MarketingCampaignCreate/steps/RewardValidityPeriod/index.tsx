import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Checkbox, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { RightOutlined, CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useToast } from '@/components/context/useContext';
import useSWR from 'swr';
import {
    getMarketingCampaignById,
    updateMarketingCampaign,
} from '@/services/api/marketing';
import CalendarImage from '@/assets/Calendar.png';

const RewardValidityPeriod: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { showToast } = useToast();
    const marketingCampaignId = Number(searchParams.get('marketingCampaignId'));

    const [days, setDays] = useState<number | undefined>(undefined);
    const [isIndefinite, setIsIndefinite] = useState(false);
    const [updating, setUpdating] = useState(false);

    const {
        data: marketingCampaign,
        isLoading,
        isValidating,
        mutate,
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
        if (marketingCampaign) {
            if (marketingCampaign.activeDays !== undefined && marketingCampaign.activeDays !== null) {
                setDays(marketingCampaign.activeDays);
                setIsIndefinite(false);
            }
            else if (marketingCampaign.actionPayload) {
                const payload = marketingCampaign.actionPayload;
                if (payload.rewardValidityDays !== undefined) {
                    setDays(payload.rewardValidityDays);
                    setIsIndefinite(false);
                } else if (payload.rewardValidityIndefinite === true) {
                    setIsIndefinite(true);
                    setDays(undefined);
                }
            }
        }
    }, [marketingCampaign]);

    const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setDays(undefined);
        } else {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue > 0) {
                setDays(numValue);
                setIsIndefinite(false);
            }
        }
    };

    const handleIndefiniteChange = (e: any) => {
        const checked = e.target.checked;
        setIsIndefinite(checked);
        if (checked) {
            setDays(undefined);
        }
    };

    const handleSkip = () => {
        updateSearchParams(searchParams, setSearchParams, { step: 5 });
    };

    const handleNext = async () => {
        if (!marketingCampaignId || !marketingCampaign) {
            showToast(t('errors.other.errorDuringFormSubmission'), 'error');
            return;
        }

        try {
            setUpdating(true);

            const updatePayload: { activeDays?: number } = {};

            if (!isIndefinite && days !== undefined && days > 0) {
                updatePayload.activeDays = days;
            }

            await updateMarketingCampaign(marketingCampaignId, updatePayload);

            await mutate();

            message.success(t('marketingCampaigns.rewardValidityUpdated'));

            updateSearchParams(searchParams, setSearchParams, { step: 5 });
        } catch (error) {
            console.error('Error updating reward validity period: ', error);
            message.error(t('common.somethingWentWrong'));
        } finally {
            setUpdating(false);
        }
    };

    if (isLoading || isValidating) {
        return (
            <div className="bg-background02 pb-3">
                <div className="flex flex-col rounded-lg lg:flex-row">
                    <div className="mb-3">
                        <div className="flex items-center justify-center bg-background02">
                            <div className="flex flex-col rounded-lg w-full space-y-6 sm:space-y-8 lg:space-y-10">
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                                    <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
                                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background02 pb-3">
            <div className="flex flex-col rounded-lg lg:flex-row">
                <div className="mb-3">
                    <div className="flex items-center justify-center bg-background02">
                        <div className="flex flex-col rounded-lg w-full space-y-6 sm:space-y-8 lg:space-y-10">
                            <div className="flex items-center space-x-4">
                                <CalendarOutlined className="text-primary02 text-4xl" />
                                <div>
                                    <div className="font-bold text-text01 text-2xl">
                                        {t('marketingCampaigns.rewardValidityPeriod')}
                                    </div>
                                    <div className="text-base03 text-md">
                                        {t('marketingCampaigns.rewardValidityPeriodDescription')}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-6">
                                <div className="flex flex-col space-y-3">
                                    <div className="text-text01 text-sm font-semibold">
                                        {t('marketingCampaigns.numberOfDays')}
                                    </div>
                                    <div className="text-base03 text-sm">
                                        {t('marketingCampaigns.numberOfDaysDescription')}
                                    </div>
                                    <Input
                                        type="number"
                                        min={1}
                                        placeholder={t('marketingCampaigns.enterNumberOfDays')}
                                        value={days !== undefined ? days.toString() : ''}
                                        onChange={handleDaysChange}
                                        disabled={isIndefinite}
                                        className="max-w-md"
                                    />
                                </div>

                                <div className="flex flex-col space-y-3">
                                    <div className="text-text01 text-sm font-semibold">
                                        {t('marketingCampaigns.indefiniteWindow')}
                                    </div>
                                    <Checkbox
                                        checked={isIndefinite}
                                        onChange={handleIndefiniteChange}
                                    >
                                        {t('marketingCampaigns.indefiniteWindowDescription')}
                                    </Checkbox>
                                </div>

                                <div className="flex items-start space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <InfoCircleOutlined className="text-blue-500 text-lg mt-0.5" />
                                    <div className="text-blue-700 text-sm">
                                        {t('marketingCampaigns.rewardValidityPeriodTip')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex lg:w-8/12 rounded-r-lg lg:ml-20">
                    <div className="p-8">
                        <img
                            src={CalendarImage}
                            alt="Calendar illustration"
                            loading="lazy"
                            decoding="async"
                            className="object-cover w-11/12 h-11/12"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-3">
                <Button
                    onClick={handleSkip}
                    disabled={updating}
                >
                    {t('common.skip')}
                </Button>
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
        </div>
    );
};

export default RewardValidityPeriod;

