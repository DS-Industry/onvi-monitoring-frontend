import React from 'react';

interface CampaignHubCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

const CampaignHubCard: React.FC<CampaignHubCardProps> = ({
  icon,
  title,
  subtitle,
  onClick,
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick?.();
            }
          }
          : undefined
      }
      className={`flex min-h-[88px] items-start gap-4 rounded-xl p-6 transition-colors ${isClickable
        ? 'cursor-pointer hover:border-primary02/40'
        : 'cursor-default'
        }`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary02 text-xl text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-normal text-2xl">{title}</div>
        <div className="text-sm text-[#ACAEB3]">{subtitle}</div>
      </div>
    </div>
  );
};

export default CampaignHubCard;
