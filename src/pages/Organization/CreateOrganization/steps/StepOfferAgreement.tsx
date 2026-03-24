import React, { useEffect, useState } from 'react';
import { Checkbox } from 'antd';
import { Trans, useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import { useCreateOrganizationContext } from '../context';
import { acceptOrganizationOffer } from '@/services/api/organization';

const StepOfferAgreement: React.FC = () => {
  const { t } = useTranslation();
  const {
    organizationId,
    showToast,
    mutateOrganizations,
    isOfferAccepted,
  } = useCreateOrganizationContext();
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOfferAccepted) {
      setIsChecked(true);
    }
  }, [isOfferAccepted]);

  const handleAccept = async () => {
    if (!organizationId || !isChecked || isLoading || isOfferAccepted) return;
    try {
      setIsLoading(true);
      await acceptOrganizationOffer(organizationId);
      await mutateOrganizations();
      setIsChecked(true);
      showToast(
        t('createOrganization.toast.offerAccepted'),
        'success'
      );
    } catch {
      showToast(
        t('createOrganization.toast.errorOfferAccept'),
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#BFFA00]">
          {t('createOrganization.stepLabel5')}
        </span>
        <h1 className="mt-2 text-lg sm:text-xl font-bold text-white">
          {t('createOrganization.offerTitle')}
        </h1>
        <p className="mt-2 text-sm text-[#a3a3a3]">
          {t('createOrganization.offerDescription')}
        </p>
      </div>

      <div className="space-y-6">
        <Checkbox
          checked={isOfferAccepted ? true : isChecked}
          onChange={e => {
            if (isOfferAccepted) return;
            setIsChecked(e.target.checked);
          }}
          className="text-sm text-[#d4d4d4]"
        >
          <Trans
            i18nKey="createOrganization.offerCheckbox"
            components={{
              offerLink: (
                <a
                  href="https://onvione.ru/legal/dogovor-oferty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#BFFA00] underline"
                />
              ),
              userAgreementLink: (
                <a
                  href="https://onvione.ru/legal/polzovatelskoe-soglashenie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#BFFA00] underline"
                />
              ),
            }}
          />
        </Checkbox>

        {isOfferAccepted && (
          <p className="text-xs text-[#4ade80]">
            {t('createOrganization.offerAlreadyAccepted')}
          </p>
        )}

        <Button
          type="basic"
          title={t('createOrganization.offerAcceptButton')}
          classname="w-[200px] !rounded-xl !py-3 font-semibold"
          disabled={!isChecked || !organizationId || isOfferAccepted}
          isLoading={isLoading}
          handleClick={handleAccept}
        />
      </div>
    </div>
  );
};

export default StepOfferAgreement;

