import React, { useState, useMemo, useCallback } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Select, Input, Button } from 'antd';
import type { SelectProps } from 'antd';

interface OptionType {
  id: number;
  name: string;
  color: string;
}

interface MultiInputProps {
  options: OptionType[];
  value?: number[];
  placeholder?: string;
  onChange: (selectedOptions: OptionType[]) => void;
  searchValue?: string;
  setSearchValue?: (value: string) => void;
  handleChange?: () => void;
  isLoading?: boolean;
  loadingOptions?: boolean;
  disabled?: boolean;
}

const MultiInput: React.FC<MultiInputProps> = ({
  options,
  value = [],
  placeholder = 'Название тега',
  onChange,
  searchValue = '',
  setSearchValue,
  handleChange,
  isLoading = false,
  loadingOptions = false,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [isInputFocused, setIsInputFocused] = useState(false);

  const selectedOptions = useMemo(
    () => options.filter(opt => value.includes(opt.id)),
    [value, options]
  );

  const handleSelectChange = useCallback(
    (selectedIds: number[]) => {
      const selected = options.filter(opt => selectedIds.includes(opt.id));
      onChange(selected);
    },
    [options, onChange]
  );

  const renderDropdown = (menu: React.ReactNode) => (
    <div>
      <div className="max-h-40 overflow-y-auto">{menu}</div>
      {handleChange && (
        <div className="flex gap-2 p-2 border-t border-gray-200">
          <Input
            value={searchValue}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onChange={e => setSearchValue?.(e.target.value)}
            placeholder={t('marketing.tags')}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={isLoading}
            onClick={() => {
              if (!handleChange || !searchValue?.trim()) return;
              handleChange();
              setSearchValue?.('');
            }}
          >
            {t('roles.create')}
          </Button>
        </div>
      )}
    </div>
  );

  const renderTag: SelectProps['tagRender'] = props => {
    const { label, value, closable, onClose } = props;
    const option = options.find(opt => opt.id === value);

    return (
      <span
        className={`inline-flex items-center text-white text-sm rounded px-2 py-0.5 me-1`}
        style={{ backgroundColor: option?.color || '#ccc' }}
      >
        {label}
        {closable && (
          <span onClick={onClose} className="ml-2 cursor-pointer font-bold">
            ×
          </span>
        )}
      </span>
    );
  };

  const renderOption: SelectProps['optionRender'] = option => {
    const { data } = option;
    return (
      <div className="flex justify-between items-center">
        <span
          className="text-white text-sm rounded px-2 py-0.5"
          style={{ backgroundColor: data.color }}
        >
          {data.name}
        </span>
      </div>
    );
  };

  return (
    <div className="w-80">
      <div className="text-sm text-gray-500 mb-1">{t('marketing.tags')}</div>
      <Select
        mode="multiple"
        showSearch
        className="w-80"
        disabled={disabled}
        value={selectedOptions.map(opt => opt.id)}
        loading={loadingOptions}
        placeholder={placeholder}
        onChange={selectedIds => {
          if (!isInputFocused) {
            handleSelectChange(selectedIds as number[]);
          }
        }}
        filterOption={(input, option) =>
          (option?.label as string).toLowerCase().includes(input.toLowerCase())
        }
        optionLabelProp="label"
        popupRender={renderDropdown}
        tagRender={renderTag}
        optionRender={renderOption}
        options={options.map(opt => ({
          value: opt.id,
          label: opt.name,
          name: opt.name,
          color: opt.color,
        }))}
      />
    </div>
  );
};

export default MultiInput;
