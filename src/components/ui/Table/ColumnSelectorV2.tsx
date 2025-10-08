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
    <div className="bg-white min-w-[200px] max-w-[300px]">
      <div className="mb-4">
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {columns
            .filter(col => col.key !== 'checkbox')
            .map(col => (
              <div 
                key={col.key as string}
                className="flex items-center p-2 rounded hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                onClick={() => handleToggleColumn(col.key as string, !tempSelection.includes(col.key as string))}
              >
                <Checkbox
                  checked={tempSelection.includes(col.key as string)}
                  onChange={(e) => handleToggleColumn(col.key as string, e.target.checked)}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700 flex-1">
                  {typeof col.title === 'string' ? col.title : String(col.title)}
                </span>
              </div>
            ))}
        </div>
      </div>
      <div className="flex justify-between space-x-3">
        <Button 
          
          onClick={handleReset}
          className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600"
        >
          {t('techTasks.columnSelector.reset')}
        </Button>
        <Button 
          type="primary" 
          
          onClick={handleApply}
          className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
        >
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
      overlayStyle={{ 
        padding: 0,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
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
