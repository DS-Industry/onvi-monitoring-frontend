import { useState, useEffect, useMemo } from 'react';
import { Button, Popover, Checkbox } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';

interface ColumnSelectorV2Props<T = any> {
  columns: ColumnsType<T>;
  storageKey: string;
}

interface ColumnSelectorV2Return<T = any> {
  ColumnSelector: React.ReactElement;
  visibleColumns: ColumnsType<T>;
}

const ColumnSelectorV2 = <T,>({
  columns,
  storageKey,
}: ColumnSelectorV2Props<T>): ColumnSelectorV2Return<T> => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const defaultColumns = columns
    .filter(col => col.key !== 'checkbox')
    .map(col => col.key as string);

  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && parsed.length ? parsed : defaultColumns;
    } catch {
      return defaultColumns;
    }
  });

  const [tempSelection, setTempSelection] = useState<string[]>(selectedColumns);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(selectedColumns));
    } catch (error) {
      console.warn('Failed to save column selection to localStorage', error);
    }
  }, [selectedColumns, storageKey]);

  useEffect(() => {
    setTempSelection(selectedColumns);
  }, [selectedColumns]);

  const visibleColumns = useMemo(() => {
    const checkboxColumn = columns.find(col => col.key === 'checkbox');
    const filteredColumns = columns.filter(col => 
      col.key === 'checkbox' || selectedColumns.includes(col.key as string)
    );
    return checkboxColumn ? [checkboxColumn, ...filteredColumns.filter(col => col.key !== 'checkbox')] : filteredColumns;
  }, [columns, selectedColumns]);

  const handleToggleColumn = (columnKey: string, checked: boolean) => {
    if (checked) {
      setTempSelection(prev => [...prev, columnKey]);
    } else {
      setTempSelection(prev => prev.filter(key => key !== columnKey));
    }
  };

  const handleApply = () => {
    setSelectedColumns(tempSelection);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempSelection(defaultColumns);
  };

  const popoverContent = (
    <div className="p-4 min-w-[200px]">
      <div className="mb-4">
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {columns
            .filter(col => col.key !== 'checkbox')
            .map(col => (
              <div key={col.key as string}>
                <Checkbox
                  checked={tempSelection.includes(col.key as string)}
                  onChange={(e) => handleToggleColumn(col.key as string, e.target.checked)}
                >
                  {typeof col.title === 'string' ? col.title : String(col.title)}
                </Checkbox>
              </div>
            ))}
        </div>
      </div>
      <div className="flex justify-between space-x-2">
        <Button size="small" onClick={handleReset}>
          {t('techTasks.columnSelector.reset')}
        </Button>
        <Button type="primary" size="small" onClick={handleApply}>
          {t('techTasks.columnSelector.apply')}
        </Button>
      </div>
    </div>
  );

  const ColumnSelectorComponent = (
    <Popover
      content={popoverContent}
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger="click"
      placement="bottomLeft"
      overlayClassName="column-selector-popover"
    >
      <Button icon={<SettingOutlined />}>
        {t('techTasks.columnSelector.title')}
      </Button>
    </Popover>
  );

  return {
    ColumnSelector: ColumnSelectorComponent,
    visibleColumns,
  };
};

export default ColumnSelectorV2;
