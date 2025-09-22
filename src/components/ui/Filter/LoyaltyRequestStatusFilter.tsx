import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { LoyaltyRequestStatus } from '@/services/api/marketing';

const LoyaltyRequestStatusFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentStatus = searchParams.get('status') || 'ALL';

  const handleStatusChange = (value: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      status: value,
      page: '1', 
    });
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1 text-gray-700">
        {t('constants.status')}
      </label>
      <Select
        value={currentStatus}
        onChange={handleStatusChange}
        className="w-full min-w-[150px]"
        options={[
          { value: 'ALL', label: t('constants.allStatuses') },
          { value: LoyaltyRequestStatus.PENDING, label: t('constants.pending') },
          { value: LoyaltyRequestStatus.APPROVED, label: t('constants.approved') },
          { value: LoyaltyRequestStatus.REJECTED, label: t('constants.rejected') },
        ]}
      />
    </div>
  );
};

export default LoyaltyRequestStatusFilter;
