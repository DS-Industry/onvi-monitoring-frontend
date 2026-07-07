import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputNumber, Select, Table } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
    SpendCycle,
    SpendMilestoneDiscountType,
    SpendMilestoneTier,
} from '../../utils/spendMilestone';

interface SpendMilestoneTiersSectionProps {
    spendCycle: SpendCycle;
    tiers: SpendMilestoneTier[];
    onSpendCycleChange: (cycle: SpendCycle) => void;
    onTiersChange: (tiers: SpendMilestoneTier[]) => void;
}

const SPEND_CYCLE_OPTIONS: SpendCycle[] = [
    'MONTHLY',
    'WEEKLY',
    'DAILY',
    'YEARLY',
    'ALL_TIME',
];

const DISCOUNT_TYPE_OPTIONS: SpendMilestoneDiscountType[] = [
    'PERCENTAGE',
    'FIXED_AMOUNT',
    'FREE_SERVICE',
];

const SpendMilestoneTiersSection: React.FC<SpendMilestoneTiersSectionProps> = ({
    spendCycle,
    tiers,
    onSpendCycleChange,
    onTiersChange,
}) => {
    const { t } = useTranslation();

    const updateTier = (index: number, patch: Partial<SpendMilestoneTier>) => {
        onTiersChange(
            tiers.map((tier, tierIndex) =>
                tierIndex === index ? { ...tier, ...patch } : tier
            )
        );
    };

    const addTier = () => {
        const lastThreshold = tiers.length > 0 ? tiers[tiers.length - 1].threshold : 0;
        onTiersChange([
            ...tiers,
            {
                threshold: lastThreshold + 300,
                discountType: 'PERCENTAGE',
                discountValue: 10,
                validDays: 30,
            },
        ]);
    };

    const removeTier = (index: number) => {
        onTiersChange(tiers.filter((_, tierIndex) => tierIndex !== index));
    };

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

    const columns = [
        {
            title: t('marketingCampaigns.spendThreshold'),
            dataIndex: 'threshold',
            key: 'threshold',
            render: (_: unknown, __: SpendMilestoneTier, index: number) => (
                <InputNumber
                    min={0}
                    className="w-full"
                    value={tiers[index].threshold}
                    addonAfter="₽"
                    onChange={value => updateTier(index, { threshold: Number(value) || 0 })}
                />
            ),
        },
        {
            title: t('marketing.discountType'),
            dataIndex: 'discountType',
            key: 'discountType',
            render: (_: unknown, __: SpendMilestoneTier, index: number) => (
                <Select
                    className="w-full min-w-[140px]"
                    value={tiers[index].discountType}
                    options={DISCOUNT_TYPE_OPTIONS.map(type => ({
                        value: type,
                        label: getDiscountTypeLabel(type),
                    }))}
                    onChange={value =>
                        updateTier(index, { discountType: value as SpendMilestoneDiscountType })
                    }
                />
            ),
        },
        {
            title: t('marketing.discountValue'),
            dataIndex: 'discountValue',
            key: 'discountValue',
            render: (_: unknown, __: SpendMilestoneTier, index: number) => (
                <InputNumber
                    min={0}
                    className="w-full"
                    value={tiers[index].discountValue}
                    addonAfter={
                        tiers[index].discountType === 'PERCENTAGE' ? '%' : '₽'
                    }
                    onChange={value =>
                        updateTier(index, { discountValue: Number(value) || 0 })
                    }
                />
            ),
        },
        {
            title: t('marketingCampaigns.validDays'),
            dataIndex: 'validDays',
            key: 'validDays',
            render: (_: unknown, __: SpendMilestoneTier, index: number) => (
                <InputNumber
                    min={1}
                    className="w-full"
                    value={tiers[index].validDays}
                    onChange={value =>
                        updateTier(index, { validDays: Number(value) || 1 })
                    }
                />
            ),
        },
        {
            title: t('marketingCampaigns.minOrderAmount'),
            dataIndex: 'minOrderAmount',
            key: 'minOrderAmount',
            render: (_: unknown, __: SpendMilestoneTier, index: number) => (
                <InputNumber
                    min={0}
                    className="w-full"
                    value={tiers[index].minOrderAmount}
                    placeholder="0"
                    onChange={value =>
                        updateTier(index, {
                            minOrderAmount:
                                value === null || value === undefined
                                    ? undefined
                                    : Number(value),
                        })
                    }
                />
            ),
        },
        {
            title: t('marketingCampaigns.maxDiscountAmount'),
            dataIndex: 'maxDiscountAmount',
            key: 'maxDiscountAmount',
            render: (_: unknown, __: SpendMilestoneTier, index: number) => (
                <InputNumber
                    min={0}
                    className="w-full"
                    value={tiers[index].maxDiscountAmount}
                    placeholder="—"
                    onChange={value =>
                        updateTier(index, {
                            maxDiscountAmount:
                                value === null || value === undefined
                                    ? undefined
                                    : Number(value),
                        })
                    }
                />
            ),
        },
        {
            key: 'actions',
            width: 48,
            render: (_: unknown, __: SpendMilestoneTier, index: number) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={tiers.length <= 1}
                    onClick={() => removeTier(index)}
                />
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4 mt-2">
            <div>
                <div className="text-text01 text-sm font-semibold mb-2">
                    {t('marketingCampaigns.spendMilestoneSettings')}
                </div>
                <div className="text-base03 text-sm mb-4">
                    {t('marketingCampaigns.spendMilestoneSettingsDescription')}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 max-w-xs">
                <span className="text-text01 text-sm font-medium whitespace-nowrap">
                    {t('marketingCampaigns.spendCycle')}
                </span>
                <Select
                    className="w-full"
                    value={spendCycle}
                    options={SPEND_CYCLE_OPTIONS.map(cycle => ({
                        value: cycle,
                        label: t(`marketingCampaigns.spendCycle_${cycle}`),
                    }))}
                    onChange={value => onSpendCycleChange(value as SpendCycle)}
                />
            </div>

            <div>
                <div className="text-text01 text-sm font-semibold mb-3">
                    {t('marketingCampaigns.spendTiers')}
                </div>
                <Table
                    rowKey={(_, index) => String(index)}
                    columns={columns}
                    dataSource={tiers}
                    pagination={false}
                    scroll={{ x: true }}
                    size="middle"
                />
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    className="mt-3"
                    onClick={addTier}
                >
                    {t('marketingCampaigns.addSpendTier')}
                </Button>
            </div>
        </div>
    );
};

export default SpendMilestoneTiersSection;
