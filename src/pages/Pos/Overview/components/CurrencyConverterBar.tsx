import React from 'react';
import { InputNumber, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import type { CurrencyConversion } from '../hooks/useCurrencyConversion';

type CurrencyConverterBarProps = {
  conversion: CurrencyConversion;
  className?: string;
};

const CurrencyConverterBar: React.FC<CurrencyConverterBarProps> = ({
  conversion,
  className = '',
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    sourceCurrencyCode,
    targetCurrencyOptions,
    targetCurrencyId,
    conversionRate,
  } = conversion;

  return (
    <div className={`grid grid-cols-1 gap-3 md:grid-cols-3 ${className}`}>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('deposit.columns.currency')}
        </label>
        <Select
          disabled
          className="w-full"
          options={
            sourceCurrencyCode
              ? [{ label: sourceCurrencyCode, value: sourceCurrencyCode }]
              : undefined
          }
          value={sourceCurrencyCode}
          placeholder="—"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('deposit.converter.toCurrency')}
        </label>
        <Select
          allowClear
          className="w-full"
          disabled={!sourceCurrencyCode}
          options={targetCurrencyOptions}
          placeholder={t('deposit.converter.selectCurrency')}
          value={
            targetCurrencyId != null ? String(targetCurrencyId) : undefined
          }
          onChange={value => {
            updateSearchParams(searchParams, setSearchParams, {
              targetCurrencyId: value || undefined,
              currencyRate: value
                ? searchParams.get('currencyRate') || undefined
                : undefined,
            });
          }}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('deposit.converter.rate')}
        </label>
        <InputNumber
          min={0}
          step={0.0001}
          className="w-full"
          disabled={!targetCurrencyId}
          placeholder="0.0000"
          value={conversionRate}
          onChange={value => {
            updateSearchParams(searchParams, setSearchParams, {
              currencyRate: value ? String(value) : undefined,
            });
          }}
        />
      </div>
    </div>
  );
};

export default CurrencyConverterBar;
