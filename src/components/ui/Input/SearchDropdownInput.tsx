import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import Select from 'antd/es/select';
import Spin from 'antd/es/spin';
import { useTranslation } from 'react-i18next';

type Option = {
  name: string;
  value?: string | number;
};

type SearchableDropdownProps = {
  options: Option[];
  placeholder?: string;
  value?: string | number;
  onChange: (value: any) => void;
  isDisabled?: boolean;
  error?: boolean;
  errorText?: string;
  classname?: string;
  title?: string;
  allowClear?: boolean;
  loading?: boolean;
  noHeight?: boolean;
};

const SearchDropdownInput: React.FC<SearchableDropdownProps> = ({
  options,
  placeholder = 'Select...',
  value,
  onChange,
  isDisabled = false,
  error = false,
  errorText = '',
  classname,
  title = '',
  allowClear = false,
  loading = false,
}) => {
  const { t } = useTranslation();
  const formattedOptions = loading
    ? [] // Show no options when loading
    : options.map(option => ({
        label: option.name,
        value: option.value,
      }));

  const validOptionValues = options.map(opt => opt.value);
  const sanitizedValue = validOptionValues.includes(value) ? value : undefined;

  return (
    <div className={`flex flex-col ${classname}`}>
      {title && <label className="text-sm text-text02">{title}</label>}

      <Select
        showSearch
        allowClear={allowClear}
        value={sanitizedValue}
        disabled={isDisabled}
        placeholder={placeholder}
        onChange={onChange}
        options={formattedOptions}
        notFoundContent={
          loading ? (
            <div className="flex items-center justify-center">
              <Spin size="small" />
            </div>
          ) : (
            t('table.noData')
          )
        }
        className={`w-full sm:w-80`}
        optionFilterProp="label"
        filterOption={(input, option) => {
          if (!option || !option.label) return false;
          return option.label.toLowerCase().includes(input.toLowerCase());
        }}
        suffixIcon={<SearchOutlined className="text-text02" />}
        status={error ? 'error' : ''}
      />

      {error && errorText && (
        <span className="text-sm text-errorFill mt-1">{errorText}</span>
      )}
    </div>
  );
};

export default SearchDropdownInput;
