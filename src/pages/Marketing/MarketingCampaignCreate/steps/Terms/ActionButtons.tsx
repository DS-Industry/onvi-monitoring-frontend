import React from 'react';
import { useTranslation } from 'react-i18next';
import { RightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { ACTION_TYPE, MarketingCampaignResponse } from '@/services/api/marketing';

interface ActionButtonsProps {
    actionType?: ACTION_TYPE;
    marketingCampaign?: MarketingCampaignResponse;
    isUpdating: boolean;
    isDisabled: boolean;
    onNext: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    actionType,
    marketingCampaign,
    isUpdating,
    isDisabled,
    onNext,
}) => {
    const { t } = useTranslation();

    if (!actionType) {
        return null;
    }

    if (actionType === 'PROMOCODE_ISSUE') {
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
        <div className="flex justify-end gap-2 mt-3">
            <Button
                type="primary"
                icon={<RightOutlined />}
                iconPosition="end"
                loading={isUpdating}
                disabled={isDisabled}
                onClick={onNext}
            >
                {t('common.next')}
            </Button>
        </div>
    );
};

export default ActionButtons;

