import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateOrganizationContext } from './context';
import { STEPS } from './types';

const CreateOrganizationSidebar: React.FC = () => {
  const { t } = useTranslation();
  const { currentStep, setCurrentStep, isStepDisabled, isSubscriptionApproved } =
    useCreateOrganizationContext();

  return (
    <aside className="w-full md:w-[280px] shrink-0 border-b md:border-b-0 md:border-r border-[#1a1a1a] py-4 px-4 md:py-8 md:px-6 bg-black">
      <nav
        className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0"
        aria-label="Steps"
      >
        {STEPS.map((step, index) => {
          const isActive = currentStep === index;
          const disabled = isSubscriptionApproved ? false : isStepDisabled(index);

          console.log({
            disabled,
            isSubscriptionApproved,
            isStepDisabled: isStepDisabled(index)
          })

          return (
            <div
              key={step.key}
              className={`flex items-center gap-2 md:gap-3 py-2.5 md:py-3 px-3 rounded-xl shrink-0 min-w-0 transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#141414]'
                } ${isActive ? 'bg-[#141414] ring-1 ring-[#BFFA00] shadow-[0_0_20px_rgba(191,250,0,0.15)]' : ''}`}
              onClick={() => !disabled && setCurrentStep(index)}
              onKeyDown={e =>
                !disabled &&
                (e.key === 'Enter' || e.key === ' ') &&
                setCurrentStep(index)
              }
              role={disabled ? 'presentation' : 'button'}
              tabIndex={disabled ? -1 : 0}
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold shrink-0 transition-colors ${isActive
                  ? 'bg-[#BFFA00] text-black'
                  : disabled
                    ? 'bg-[#1a1a1a] text-[#525252]'
                    : 'bg-[#1a1a1a] text-[#2563eb]'
                  }`}
              >
                {index + 1}
              </span>
              <span
                className={`text-sm font-medium truncate hidden sm:inline ${isActive ? 'text-[#BFFA00]' : 'text-[#a3a3a3]'
                  }`}
              >
                {t(`createOrganization.${step.translationKey}`)}
              </span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default CreateOrganizationSidebar;
