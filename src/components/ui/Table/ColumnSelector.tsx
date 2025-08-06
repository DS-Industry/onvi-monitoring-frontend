import React from 'react';
import { Collapse, Divider, Checkbox } from 'antd';
import type { CheckboxOptionType } from 'antd/es/checkbox';
import { useTranslation } from 'react-i18next';

type ColumnSelectorProps = {
  checkedList: (string | number)[];
  options: CheckboxOptionType[];
  onChange: (value: string[]) => void;
};

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  checkedList,
  options,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <Collapse
      bordered={false}
      ghost
      style={{ marginBottom: 16 }}
      items={[
        {
          key: '1',
          label: (
            <span className="font-semibold text-base">
              {t('tables.displayedColumns')}
            </span>
          ),
          children: (
            <>
              <Divider style={{ marginTop: 0 }} />
              <Checkbox.Group
                value={checkedList}
                options={options}
                onChange={value => onChange(value as string[])}
              />
            </>
          ),
          style: { background: '#fafafa', borderRadius: 8 },
        },
      ]}
    />
  );
};

export default ColumnSelector;
