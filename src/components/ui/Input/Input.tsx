import React, { useEffect, useState, useId } from 'react';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import AntInput from 'antd/es/input';

type InputProps = {
  type?: string;
  value?: any;
  changeValue?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  inputType?: 'primary' | 'secondary' | 'tertiary' | 'forth';
  showIcon?: boolean;
  IconComponent?: React.ReactNode;
  classname?: string;
  defaultValue?: string;
  title?: string;
  id?: string;
  placeholder?: string;
};

const Input: React.FC<InputProps> = ({
  type = 'text',
  value = '',
  changeValue,
  error = false,
  label,
  helperText,
  disabled = false,
  showIcon = false,
  IconComponent,
  classname,
  title,
  id,
  defaultValue,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPreFilled, setIsPreFilled] = useState(false);
  const [hasValue, setHasValue] = useState(
    value !== '' && value !== undefined && value !== null
  );
  const autoId = useId();
  const inputId = id || `input-${autoId}`;

  useEffect(() => {
    if (value && value !== '') {
      setIsPreFilled(true);
      setHasValue(true);
    } else {
      setIsPreFilled(false);
      setHasValue(false);
    }
  }, [value]);

  useEffect(() => {
    if (inputId) {
      const inputElement = document.getElementById(inputId) as HTMLInputElement;

      if (inputElement) {
        const checkAutofill = () => {
          if (inputElement.value.trim() !== '') {
            setIsPreFilled(true);
          } else {
            setIsPreFilled(false);
          }
        };

        checkAutofill();

        const observer = new MutationObserver(() => checkAutofill());
        observer.observe(inputElement, {
          attributes: true,
          attributeFilter: ['value'],
        });

        return () => observer.disconnect();
      }
    }
  }, [inputId]);

  const isLabelFloating = isFocused || isPreFilled || hasValue;

  const handlePasswordToggle = () => {
    if (!disabled) {
      setShowPassword(!showPassword);
    }
  };

  const containerClassName = `relative ${classname || ''}`;

  const PasswordIcon = () => (
    <div
      className={`absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer ${
        disabled ? 'cursor-default' : ''
      }`}
      onClick={handlePasswordToggle}
    >
      {!showPassword ? (
        <EyeOutlined
          style={{
            fontSize: '20px',
            color: disabled ? '#d9d9d9' : isFocused ? '#8c8c8c' : '#595959',
          }}
        />
      ) : (
        <EyeInvisibleOutlined
          style={{
            fontSize: '20px',
            color: disabled ? '#d9d9d9' : '#595959',
          }}
        />
      )}
    </div>
  );

  const CustomIcon = () => (
    <div className="absolute inset-y-0 right-0 pr-10 flex items-center">
      {IconComponent || (
        <UserOutlined
          style={{
            fontSize: '20px',
            color: disabled ? '#d9d9d9' : '#595959',
          }}
        />
      )}
    </div>
  );

  const inputConfig = {
    type: type === 'password' && showPassword ? 'text' : type,
  };

  return (
    <div className={containerClassName}>
      {title && (
        <label className="text-sm text-text02">
          {title.endsWith('*') ? (
            <>
              {title.substring(0, title.length - 1)}
              <span className="text-errorFill">*</span>
            </>
          ) : (
            title
          )}
        </label>
      )}

      <div className="relative">
        <div>
          <AntInput
            id={inputId}
            value={value}
            onChange={e => {
              if (changeValue) {
                changeValue(e);
              }
              setHasValue(e.target.value !== '');
            }}
            disabled={disabled}
            defaultValue={defaultValue}
            placeholder={isLabelFloating ? '' : label}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onAnimationStart={(e: React.AnimationEvent<HTMLInputElement>) => {
              if (e.animationName === 'onAutoFill') {
                setIsPreFilled(true);
              }
            }}
            {...inputConfig}
          />
          {type === 'password' && <PasswordIcon />}
          {showIcon && type !== 'date' && type !== 'password' && <CustomIcon />}
        </div>
      </div>
      {helperText && (
        <div
          className={`text-xs font-normal ${error ? 'text-errorFill' : 'text-text02'}`}
        >
          {helperText}
        </div>
      )}
    </div>
  );
};

export default Input;
