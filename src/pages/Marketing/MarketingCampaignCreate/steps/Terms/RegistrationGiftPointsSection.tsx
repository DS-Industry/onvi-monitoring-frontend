import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputNumber } from 'antd';
import {
    RegistrationGiftPointsPayload,
    validateRegistrationGiftPointsPayload,
} from '../../utils/registrationCampaign';

interface RegistrationGiftPointsSectionProps {
    payload: RegistrationGiftPointsPayload;
    onChange: (payload: RegistrationGiftPointsPayload) => void;
}

const RegistrationGiftPointsSection: React.FC<RegistrationGiftPointsSectionProps> = ({
    payload,
    onChange,
}) => {
    const { t } = useTranslation();

    const update = (patch: Partial<RegistrationGiftPointsPayload>) =>
        onChange({ ...payload, ...patch });

    const validation = validateRegistrationGiftPointsPayload(payload);
    const pointsError =
        validation.errorKey === 'validation.registrationPointsRequired'
            ? t(validation.errorKey)
            : undefined;

    return (
        <div className="flex flex-col gap-4 mt-2">
            <div>
                <div className="text-text01 text-sm font-semibold mb-2">
                    {t('marketingCampaigns.registrationPointsSettings')}
                </div>
                <div className="text-base03 text-sm">
                    {t('marketingCampaigns.registrationPointsSettingsDescription')}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
                <div>
                    <div className="text-text02 text-sm mb-1">
                        {t('marketingCampaigns.registrationPointsAmount')}
                    </div>
                    <InputNumber
                        min={1}
                        precision={0}
                        className="w-full"
                        value={payload.points}
                        status={pointsError ? 'error' : undefined}
                        onChange={value => update({ points: Number(value) || 0 })}
                    />
                    {pointsError && (
                        <div className="text-errorFill text-xs mt-1">{pointsError}</div>
                    )}
                </div>

                <div>
                    <div className="text-text02 text-sm mb-1">
                        {t('marketingCampaigns.registrationPointsDuration')}
                    </div>
                    <InputNumber
                        min={1}
                        precision={0}
                        className="w-full"
                        value={payload.durationDays}
                        placeholder="—"
                        onChange={value =>
                            update({
                                durationDays:
                                    value === null || value === undefined
                                        ? undefined
                                        : Number(value),
                            })
                        }
                    />
                    <div className="text-base03 text-xs mt-1">
                        {t('marketingCampaigns.registrationPointsDurationHint')}
                    </div>
                </div>
            </div>

            <div className="text-base03 text-sm">
                {t('marketingCampaigns.registrationRegionHint')}
            </div>
        </div>
    );
};

export default RegistrationGiftPointsSection;
