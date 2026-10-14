import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputNumber, Select } from 'antd';
import { SpendMilestoneDiscountType } from '../../utils/spendMilestone';
import { RegistrationPromocodePayload } from '../../utils/registrationCampaign';

interface RegistrationPromocodeSectionProps {
    payload: RegistrationPromocodePayload;
    onChange: (payload: RegistrationPromocodePayload) => void;
}

const DISCOUNT_TYPE_OPTIONS: SpendMilestoneDiscountType[] = [
    'PERCENTAGE',
    'FIXED_AMOUNT',
    'FREE_SERVICE',
];

const toOptionalNumber = (value: number | string | null) =>
    value === null || value === undefined ? undefined : Number(value);

const RegistrationPromocodeSection: React.FC<RegistrationPromocodeSectionProps> = ({
    payload,
    onChange,
}) => {
    const { t } = useTranslation();

    const update = (patch: Partial<RegistrationPromocodePayload>) =>
        onChange({ ...payload, ...patch });

    const getDiscountTypeLabel = (type: SpendMilestoneDiscountType) => {
        switch (type) {
            case 'PERCENTAGE':
                return t('marketingCampaigns.percentage');
            case 'FIXED_AMOUNT':
                return t('marketingCampaigns.fixedAmount');
            case 'FREE_SERVICE':
                return t('marketingCampaigns.freeService');
        }
    };

    return (
        <div className="flex flex-col gap-4 mt-2">
            <div>
                <div className="text-text01 text-sm font-semibold mb-2">
                    {t('marketingCampaigns.registrationSettings')}
                </div>
                <div className="text-base03 text-sm">
                    {t('marketingCampaigns.registrationSettingsDescription')}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
                <div>
                    <div className="text-text02 text-sm mb-1">
                        {t('marketing.discountType')}
                    </div>
                    <Select
                        className="w-full"
                        value={payload.discountType}
                        options={DISCOUNT_TYPE_OPTIONS.map(type => ({
                            value: type,
                            label: getDiscountTypeLabel(type),
                        }))}
                        onChange={value =>
                            update({ discountType: value as SpendMilestoneDiscountType })
                        }
                    />
                </div>

                <div>
                    <div className="text-text02 text-sm mb-1">
                        {t('marketing.discountValue')}
                    </div>
                    <InputNumber
                        min={0}
                        max={payload.discountType === 'PERCENTAGE' ? 100 : undefined}
                        className="w-full"
                        value={payload.discountValue}
                        addonAfter={payload.discountType === 'PERCENTAGE' ? '%' : '₽'}
                        onChange={value => update({ discountValue: Number(value) || 0 })}
                    />
                </div>

                <div>
                    <div className="text-text02 text-sm mb-1">
                        {t('marketingCampaigns.validDays')}
                    </div>
                    <InputNumber
                        min={1}
                        precision={0}
                        className="w-full"
                        value={payload.validDays}
                        onChange={value => update({ validDays: Number(value) || 1 })}
                    />
                </div>

                <div>
                    <div className="text-text02 text-sm mb-1">
                        {t('marketingCampaigns.minOrderAmount')}
                    </div>
                    <InputNumber
                        min={0}
                        className="w-full"
                        value={payload.minOrderAmount}
                        placeholder="0"
                        addonAfter="₽"
                        onChange={value => update({ minOrderAmount: toOptionalNumber(value) })}
                    />
                </div>

                <div>
                    <div className="text-text02 text-sm mb-1">
                        {t('marketingCampaigns.maxDiscountAmount')}
                    </div>
                    <InputNumber
                        min={0}
                        className="w-full"
                        value={payload.maxDiscountAmount}
                        placeholder="—"
                        addonAfter="₽"
                        onChange={value =>
                            update({ maxDiscountAmount: toOptionalNumber(value) })
                        }
                    />
                </div>
            </div>

            <div className="text-base03 text-sm">
                {t('marketingCampaigns.registrationRegionHint')}
            </div>
        </div>
    );
};

export default RegistrationPromocodeSection;
