import React, { useState } from 'react';
import Input from 'antd/es/input';

type MultilineInputProps = {
  value?: string;
  changeValue?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: boolean;
  label?: string;
  disabled?: boolean;
  rows?: number;
  inputType?: 'primary' | 'secondary' | 'tertiary';
  title?: string;
  classname?: string;
  helperText?: string;
};

const MultilineInput: React.FC<MultilineInputProps> = ({
  value = '',
  changeValue,
  error = false,
  label,
  disabled = false,
  rows = 4,
  title,
  classname = '',
  helperText,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isLabelFloating = isFocused || value?.length > 0;

  const paddingClass = 'py-2';

  const borderColor = disabled
    ? 'outline-none'
    : error
      ? 'border-errorFill'
      : isFocused
        ? 'border-primary02'
        : 'border';

  const hoverBorder = disabled ? '' : 'hover:border-primary02';
  const bgColor = disabled ? 'bg-disabledFill' : 'bg-background02';

  const textAreaClass = `w-full resize-none ${paddingClass} ${bgColor} rounded-md caret-primary02 text-black border outline-none ${borderColor} ${hoverBorder}`;

  return (
    <div className={`relative min-w-40 ${classname}`}>
      {title && title.endsWith('*') ? (
        <label className="text-sm text-text02">
          {title.slice(0, -1)}
          <span className="text-textError">*</span>
        </label>
      ) : (
        title && <label className="text-sm text-text02">{title}</label>
      )}

      <div className="relative mt-1">
        <Input.TextArea
          value={value}
          onChange={changeValue}
          disabled={disabled}
          rows={rows}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={textAreaClass}
          placeholder={isLabelFloating ? '' : label}
        />
      </div>

      {helperText && (
        <div
          className={`text-[11px] font-normal mt-1 ${
            error ? 'text-errorFill' : 'text-text02'
          }`}
        >
          {helperText}
        </div>
      )}
    </div>
  );
};

export default MultilineInput;
