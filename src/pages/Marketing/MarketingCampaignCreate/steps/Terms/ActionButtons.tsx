import React from 'react';
import { useTranslation } from 'react-i18next';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { ACTION_TYPE, MarketingCampaignResponse } from '@/services/api/marketing';

interface ActionButtonsProps {
    actionType?: ACTION_TYPE;
    marketingCampaign?: MarketingCampaignResponse;
    isSpendMilestone?: boolean;
    isUpdating: boolean;
    isDisabled: boolean;
    onNext: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    actionType,
    marketingCampaign,
    isSpendMilestone = false,
    isUpdating,
    isDisabled,
    onNext,
}) => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentStep = Number(searchParams.get('step')) || 1;

    const goBack = () => {
        updateSearchParams(searchParams, setSearchParams, {
            step: currentStep - 1,
        });
    };

    if (!actionType) {
        return null;
    }

    const isPromocodeIssue = actionType === 'PROMOCODE_ISSUE';
    const isPromocodeEntry =
        isPromocodeIssue && !isSpendMilestone;

    const isNextDisabled = isPromocodeEntry
        ? !marketingCampaign?.actionPromocode
        : isDisabled;

    if (actionType === 'PROMOCODE_ISSUE' && !isSpendMilestone) {
        return (
            <div className="flex justify-end gap-2 mt-3">
                <Button
                    type="primary"
                    icon={<RightOutlined />}
                    iconPosition="end"
                    disabled={!marketingCampaign?.actionPromocode}
                    loading={isUpdating}
                    onClick={onNext}
                >
                    {t('common.next')}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-3">
            <div className="order-2 sm:order-1">
                {currentStep > 1 && (
                    <Button
                        icon={<LeftOutlined />}
                        onClick={goBack}
                        className="w-full sm:w-auto"
                    >
                        {t('common.back')}
                    </Button>
                )}
            </div>
            <Button
                type="primary"
                icon={<RightOutlined />}
                iconPosition="end"
                loading={isUpdating}
                disabled={isNextDisabled}
                onClick={onNext}
                className="w-full sm:w-auto order-1 sm:order-2"
            >
                {t('common.next')}
            </Button>
        </div>
    );
};

export default ActionButtons;
