import React, { useState, useEffect } from 'react';
import { Modal, Select, Input, TimePicker, Button, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import {
    MarketingCampaignConditionType,
    Weekday,
    PromocodeDiscountType,
} from '@/services/api/marketing';

interface Condition {
    type?: MarketingCampaignConditionType;
    value?: any;
}

interface ConditionTypeOption {
    label: string;
    value: MarketingCampaignConditionType;
}

interface ConditionModalProps {
    open: boolean;
    onCancel: () => void;
    onApply: (condition: Condition) => void;
    currentCondition: Condition;
    setCurrentCondition: React.Dispatch<React.SetStateAction<Condition>>;
    loading?: boolean;
    allowedConditionTypes?: ConditionTypeOption[];
}

const ConditionModal: React.FC<ConditionModalProps> = ({
    open,
    onCancel,
    onApply,
    currentCondition,
    setCurrentCondition,
    loading,
    allowedConditionTypes,
}) => {
    const { t } = useTranslation();
    const [promocodeData, setPromocodeData] = useState({
        code: '',
        discountType: PromocodeDiscountType.FIXED_AMOUNT,
        discountValue: '',
        maxUsagePerUser: '',
    });

    const handleTimeChange = (field: 'start' | 'end', value: Dayjs | null) => {
        setCurrentCondition(prev => ({
            ...prev,
            value: {
                ...prev.value,
                [field]: value
                    ? dayjs()
                        .hour(value.hour())
                        .minute(value.minute())
                        .second(0)
                        .millisecond(0)
                        .toISOString()
                    : undefined,
            },
        }));
    };

    const handlePromocodeTypeChange = (newType: MarketingCampaignConditionType) => {
        if (newType !== MarketingCampaignConditionType.PROMOCODE_ENTRY) {
            setPromocodeData({
                code: '',
                discountType: PromocodeDiscountType.FIXED_AMOUNT,
                discountValue: '',
                maxUsagePerUser: '',
            });
        }
    };

    useEffect(() => {
        if (!open) {
            setPromocodeData({
                code: '',
                discountType: PromocodeDiscountType.FIXED_AMOUNT,
                discountValue: '',
                maxUsagePerUser: '',
            });
        }
    }, [open]);

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    {t('common.cancel')}
                </Button>,
                <Button
                    key="apply"
                    type="primary"
                    onClick={() => {
                        if (currentCondition.type === MarketingCampaignConditionType.PROMOCODE_ENTRY) {
                            onApply({
                                ...currentCondition,
                                value: promocodeData,
                            });
                        } else {
                            onApply(currentCondition);
                        }
                    }}
                    disabled={
                        !currentCondition.type ||
                        (currentCondition.type === MarketingCampaignConditionType.PROMOCODE_ENTRY &&
                            (!promocodeData.code ||
                                !promocodeData.discountValue ||
                                !promocodeData.maxUsagePerUser))
                    }
                    loading={loading}
                >
                    {t('marketing.apply')}
                </Button>,
            ]}
            centered
            className="rounded-2xl"
        >
            <div className="flex flex-col space-y-6 mb-40">
                <div>
                    <div className="text-base font-semibold mb-2">
                        {t('marketingCampaigns.conditionType')}
                    </div>
                    <Select
                        className="w-60"
                        placeholder={t('marketingCampaigns.conditionType')}
                        value={currentCondition.type}
                        onChange={type => {
                            handlePromocodeTypeChange(type);
                            setCurrentCondition({ type, value: undefined });
                        }}
                        options={
                            allowedConditionTypes || [
                                {
                                    label: t('marketingCampaigns.timePeriod'),
                                    value: MarketingCampaignConditionType.TIME_RANGE,
                                },
                                {
                                    label: t('marketingCampaigns.dayOfWeek'),
                                    value: MarketingCampaignConditionType.WEEKDAY,
                                },
                                {
                                    label: t('marketingCampaigns.purchaseAmount'),
                                    value: MarketingCampaignConditionType.PURCHASE_AMOUNT,
                                },
                                {
                                    label: t('marketingCampaigns.numberOfVisits'),
                                    value: MarketingCampaignConditionType.VISIT_COUNT,
                                },
                                {
                                    label: t('marketingCampaigns.promoCodeEntry'),
                                    value: MarketingCampaignConditionType.PROMOCODE_ENTRY,
                                },
                                {
                                    label: t('marketing.birth'),
                                    value: MarketingCampaignConditionType.BIRTHDAY,
                                },
                            ]
                        }
                    />
                </div>

                <div>
                    {currentCondition.type && (
                        <div className="text-base font-semibold mb-2">
                            {t('marketing.value')}
                        </div>
                    )}

                    {currentCondition.type ===
                        MarketingCampaignConditionType.TIME_RANGE && (
                            <div className="flex space-x-4">
                                <TimePicker
                                    format="HH:mm"
                                    value={
                                        currentCondition.value?.start
                                            ? dayjs(currentCondition.value.start)
                                            : null
                                    }
                                    onChange={v => handleTimeChange('start', v)}
                                    placeholder={t('filters.dateTime.startTime')}
                                    className="w-1/2"
                                />

                                <TimePicker
                                    format="HH:mm"
                                    value={
                                        currentCondition.value?.end
                                            ? dayjs(currentCondition.value.end)
                                            : null
                                    }
                                    onChange={v => handleTimeChange('end', v)}
                                    placeholder={t('filters.dateTime.endTime')}
                                    className="w-1/2"
                                />
                            </div>
                        )}

                    {currentCondition.type === MarketingCampaignConditionType.WEEKDAY && (
                        <Select
                            mode="multiple"
                            className="w-60"
                            placeholder={t('marketingCampaigns.day')}
                            value={currentCondition.value}
                            onChange={value =>
                                setCurrentCondition(prev => ({ ...prev, value }))
                            }
                            options={[
                                { label: t('common.monday'), value: Weekday.MONDAY },
                                { label: t('common.tuesday'), value: Weekday.TUESDAY },
                                { label: t('common.wednesday'), value: Weekday.WEDNESDAY },
                                { label: t('common.thursday'), value: Weekday.THURSDAY },
                                { label: t('common.friday'), value: Weekday.FRIDAY },
                                { label: t('common.saturday'), value: Weekday.SATURDAY },
                                { label: t('common.sunday'), value: Weekday.SUNDAY },
                            ]}
                        />
                    )}

                    {currentCondition.type ===
                        MarketingCampaignConditionType.PURCHASE_AMOUNT && (
                            <Input
                                type="number"
                                className="w-60"
                                placeholder={t('marketing.enter')}
                                value={currentCondition.value}
                                onChange={e =>
                                    setCurrentCondition(prev => ({
                                        ...prev,
                                        value: e.target.value,
                                    }))
                                }
                                suffix={<div>₽</div>}
                            />
                        )}

                    {currentCondition.type ===
                        MarketingCampaignConditionType.VISIT_COUNT && (
                            <Input
                                type="number"
                                className="w-60"
                                placeholder={t('techTasks.enterDaysCount')}
                                value={currentCondition.value}
                                onChange={e =>
                                    setCurrentCondition(prev => ({
                                        ...prev,
                                        value: e.target.value,
                                    }))
                                }
                            />
                        )}

                    {currentCondition.type ===
                        MarketingCampaignConditionType.PROMOCODE_ENTRY && (
                            <div className="flex flex-col space-y-4">
                                <div>
                                    <div className="text-sm font-semibold mb-2">
                                        {t('marketing.promoCode') || 'Promo Code'}
                                    </div>
                                    <Input
                                        className="w-60"
                                        placeholder={t('subscriptions.enter')}
                                        value={promocodeData.code}
                                        onChange={e =>
                                            setPromocodeData(prev => ({
                                                ...prev,
                                                code: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold mb-2">
                                        {t('marketing.discountType') || 'Discount Type'}
                                    </div>
                                    <Radio.Group
                                        value={promocodeData.discountType}
                                        onChange={e =>
                                            setPromocodeData(prev => ({
                                                ...prev,
                                                discountType: e.target.value,
                                            }))
                                        }
                                        options={[
                                            {
                                                value: PromocodeDiscountType.FIXED_AMOUNT,
                                                label: t('marketing.fix') || 'Fixed',
                                            },
                                            {
                                                value: PromocodeDiscountType.PERCENTAGE,
                                                label: t('marketing.per') || 'Percentage',
                                            },
                                        ]}
                                    />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold mb-2">
                                        {t('marketing.discountValue') || 'Discount Value'}
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-60"
                                        placeholder={t('marketing.enter')}
                                        value={promocodeData.discountValue}
                                        onChange={e =>
                                            setPromocodeData(prev => ({
                                                ...prev,
                                                discountValue: e.target.value,
                                            }))
                                        }
                                        suffix={
                                            promocodeData.discountType ===
                                                PromocodeDiscountType.PERCENTAGE ? (
                                                <div>%</div>
                                            ) : (
                                                <div>₽</div>
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold mb-2">
                                        {t('marketing.maxUsagePerUser') || 'Max Usage Per User'}
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-60"
                                        placeholder={t('marketing.enter')}
                                        value={promocodeData.maxUsagePerUser}
                                        onChange={e =>
                                            setPromocodeData(prev => ({
                                                ...prev,
                                                maxUsagePerUser: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        )}

                    {currentCondition.type === MarketingCampaignConditionType.BIRTHDAY && (
                        <div className="text-text02 text-sm italic">
                            {t('marketingCampaigns.birthdayNoValueNeeded')}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ConditionModal;

