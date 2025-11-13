import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'antd';
import { BoxPlotOutlined } from '@ant-design/icons';

interface PointsRewardProps {
    rewardValue: number;
    onValueChange: (value: number) => void;
}

const PointsReward: React.FC<PointsRewardProps> = ({
    rewardValue,
    onValueChange,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center min-h-[150px] w-full sm:w-64">
            <div className="w-full mb-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-text01 text-sm font-medium whitespace-nowrap">
                        {t('marketing.accrue')}
                    </div>
                    <Input
                        type="number"
                        className="flex-1 max-w-32"
                        value={rewardValue}
                        suffix={
                            <div className="text-text02">
                                {t('loyaltyRequests.points')}
                            </div>
                        }
                        onChange={e => onValueChange(Number(e.target.value) || 0)}
                    />
                </div>
            </div>

            <div className="w-full h-24 flex flex-col justify-center text-center border-[0.5px] bg-white border-primary02 rounded-2xl">
                <div className="flex justify-center items-center text-primary02">
                    <BoxPlotOutlined className="font-semibold text-primary02" />
                    <div className="ml-2 font-semibold text-base">
                        {t('marketingCampaigns.accrual')}
                    </div>
                </div>
                <div className="px-4 text-sm text-text02 font-normal">
                    {t('marketingCampaigns.award')}
                </div>
            </div>
        </div>
    );
};

export default PointsReward;




