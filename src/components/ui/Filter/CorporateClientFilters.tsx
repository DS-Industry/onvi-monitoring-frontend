import React, { useState, useEffect, useCallback } from 'react';
import { Input, Collapse } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { debounce } from 'lodash';

const CorporateClientFilters: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilterKey, setActiveFilterKey] = useState<string[]>([]);

  const [innValue, setInnValue] = useState(searchParams.get('inn') || '');
  const [ownerPhoneValue, setOwnerPhoneValue] = useState(searchParams.get('ownerPhone') || '');
  const [nameValue, setNameValue] = useState(searchParams.get('name') || '');

  useEffect(() => {
    setInnValue(searchParams.get('inn') || '');
    setOwnerPhoneValue(searchParams.get('ownerPhone') || '');
    setNameValue(searchParams.get('name') || '');
  }, [searchParams]);

  const debouncedUpdateInn = useCallback(
    debounce((value: string) => {
      updateSearchParams(searchParams, setSearchParams, {
        inn: value || undefined,
        page: '1', 
      });
    }, 500),
    [searchParams, setSearchParams]
  );

  const debouncedUpdateOwnerPhone = useCallback(
    debounce((value: string) => {
      updateSearchParams(searchParams, setSearchParams, {
        ownerPhone: value || undefined,
        page: '1',
      });
    }, 500),
    [searchParams, setSearchParams]
  );

  const debouncedUpdateName = useCallback(
    debounce((value: string) => {
      updateSearchParams(searchParams, setSearchParams, {
        name: value || undefined,
        page: '1', 
      });
    }, 500),
    [searchParams, setSearchParams]
  );

  const handleInnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInnValue(value);
    debouncedUpdateInn(value);
  };

  const handleOwnerPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOwnerPhoneValue(value);
    debouncedUpdateOwnerPhone(value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameValue(value);
    debouncedUpdateName(value);
  };

  return (
    <Collapse
      bordered={false}
      ghost
      style={{ marginBottom: 16 }}
      activeKey={activeFilterKey}
      onChange={keys => setActiveFilterKey(keys as string[])}
      items={[
        {
          key: 'corporate-filters',
          label: (
            <span className="font-semibold text-base">
              {activeFilterKey.includes('corporate-filters')
                ? t('routes.filter')
                : t('routes.expand')}
            </span>
          ),
          style: { background: '#fafafa', borderRadius: 8 },
          children: (
            <div className="flex flex-wrap gap-4 p-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {t('corporateClients.inn')}
                </label>
                <Input
                  placeholder={t('corporateClients.inn')}
                  value={innValue}
                  onChange={handleInnChange}
                  className="w-40"
                  allowClear
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {t('corporateClients.ownerPhone')}
                </label>
                <Input
                  placeholder={t('corporateClients.ownerPhone')}
                  value={ownerPhoneValue}
                  onChange={handleOwnerPhoneChange}
                  className="w-40"
                  allowClear
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {t('corporateClients.name')}
                </label>
                <Input
                  placeholder={t('corporateClients.name')}
                  value={nameValue}
                  onChange={handleNameChange}
                  className="w-40"
                  allowClear
                />
              </div>
            </div>
          ),
        },
      ]}
    />
  );
};

export default CorporateClientFilters;
