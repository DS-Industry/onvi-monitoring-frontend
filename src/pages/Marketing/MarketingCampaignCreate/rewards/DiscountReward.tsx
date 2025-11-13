import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Radio } from 'antd';
import { PercentageOutlined } from '@ant-design/icons';

interface DiscountRewardProps {
    rewardValue: number;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    onValueChange: (value: number) => void;
    onTypeChange: (type: 'PERCENTAGE' | 'FIXED_AMOUNT') => void;
}

const DiscountReward: React.FC<DiscountRewardProps> = ({
    rewardValue,
    discountType,
    onValueChange,
    onTypeChange,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center min-h-[150px] w-full sm:w-64">
            <div className="w-full mb-4">
                <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-text01 text-sm font-medium whitespace-nowrap">
                            {t('marketingCampaigns.discount')}
                        </div>
                        <Input
                            type="number"
                            className="flex-1 max-w-32"
                            value={rewardValue}
                            suffix={
                                discountType === 'PERCENTAGE' ? (
                                    <div className="text-text02">%</div>
                                ) : (
                                    <div className="text-text02">₽</div>
                                )
                            }
                            onChange={e => onValueChange(Number(e.target.value) || 0)}
                        />
                    </div>
                    <Radio.Group
                        value={discountType}
                        onChange={e => onTypeChange(e.target.value)}
                        size="small"
                        className="flex justify-end"
                    >
                        <Radio value="PERCENTAGE">%</Radio>
                        <Radio value="FIXED_AMOUNT">₽</Radio>
                    </Radio.Group>
                </div>
            </div>

            <div className="w-full h-24 flex flex-col justify-center text-center border-[0.5px] bg-white border-primary02 rounded-2xl">
                <div className="flex justify-center items-center text-primary02">
                    <PercentageOutlined className="font-semibold text-primary02" />
                    <div className="ml-2 font-semibold text-base">
                        {t('marketing.discount')}
                    </div>
                </div>
                <div className="px-4 text-sm text-text02 font-normal">
                    {t('marketingCampaigns.give')}
                </div>
            </div>
        </div>
    );
};

export default DiscountReward;

