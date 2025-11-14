import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Checkbox } from 'antd';
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
    const editMode = Boolean(searchParams.get('mode') === 'edit');

    const [days, setDays] = useState<number | null>(null);
    const [isIndefinite, setIsIndefinite] = useState(false);
    const [initialDays, setInitialDays] = useState<number | null>(null);
    const [initialIsIndefinite, setInitialIsIndefinite] = useState(false);
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
            let newDays: number | null = null;
            let newIsIndefinite = false;

            if (marketingCampaign.activeDays !== undefined && marketingCampaign.activeDays !== null) {
                newDays = marketingCampaign.activeDays;
                newIsIndefinite = false;
            }
            else if (marketingCampaign.actionPayload) {
                const payload = marketingCampaign.actionPayload;
                if (payload.rewardValidityDays !== undefined) {
                    newDays = payload.rewardValidityDays;
                    newIsIndefinite = false;
                } else if (payload.rewardValidityIndefinite === true) {
                    newIsIndefinite = true;
                    newDays = null;
                }
            }

            setDays(newDays);
            setIsIndefinite(newIsIndefinite);

            if (initialDays === null) {
                setInitialDays(newDays);
                setInitialIsIndefinite(newIsIndefinite);
            }
        }
    }, [marketingCampaign]);

    const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setDays(null);
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
            setDays(null);
        }
    };

    const handleNext = async () => {
        if (!marketingCampaignId || !marketingCampaign) {
            showToast(t('errors.other.errorDuringFormSubmission'), 'error');
            return;
        }

        if (editMode) {
            const hasChanged = days !== initialDays || isIndefinite !== initialIsIndefinite;

            if (!hasChanged) {
                updateSearchParams(searchParams, setSearchParams, { step: 5 });
                return;
            }
        }

        try {
            setUpdating(true);

            const updatePayload: { activeDays?: number | null } = {};


            updatePayload.activeDays = days || null;


            await updateMarketingCampaign(marketingCampaignId, updatePayload);

            await mutate();

            setInitialDays(days);
            setInitialIsIndefinite(isIndefinite);

            updateSearchParams(searchParams, setSearchParams, { step: 5 });
            showToast(t('tables.SAVED'), 'success');
        } catch (error) {
            console.error('Error updating reward validity period: ', error);
            showToast(t('common.somethingWentWrong'), 'error');
        } finally {
            setUpdating(false);
        }
    };

    if (isLoading || isValidating) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-background02 p-6 rounded-lg">
                <div className="text-text02">{t('common.loading')}</div>
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
                                        value={days ? days.toString() : ''}
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

