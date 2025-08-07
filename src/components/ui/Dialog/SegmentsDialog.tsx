import React, { useState } from 'react';
import Close from '@icons/close.svg?react';
import SearchInput from '@ui/Input/SearchInput';
import { useTranslation } from 'react-i18next';
import Button from '@ui/Button/Button';

interface TableColumn {
  label: string;
  key: string;
}

type Props = {
  columns: TableColumn[];
  selectedColumns: string[];
  onColumnToggle: (key: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (modalOpen: boolean) => void;
  setSelectedColumns: (columns: string[]) => void;
};

const SegmentsDialog: React.FC<Props> = ({
  columns,
  selectedColumns,
  onColumnToggle,
  isModalOpen,
  setIsModalOpen,
  setSelectedColumns,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const filteredColumns = columns.filter(col =>
    col.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { t } = useTranslation();

  const columnGroups: { [key: string]: TableColumn[] } = {
    'СЕГМЕНТАЦИЯ ПО ДАННЫМ КЛИЕНТА': filteredColumns.filter(
      col =>
        col.key === 'clientType' ||
        col.key === 'tags' ||
        col.key === 'registrationDate'
    ),
    'СЕГМЕНТАЦИЯ ПО ПОСЕЩЕНИЯМ': filteredColumns.filter(
      col =>
        col.key === 'visitCount' ||
        col.key === 'averageCheck' ||
        col.key === 'orderSum' ||
        col.key === 'visitDateRange'
    ),
    'СЕГМЕНТАЦИЯ ПО ПРОГРАММЕ ЛОЯЛЬНОСТИ': filteredColumns.filter(
      col =>
        col.key === 'bonusProgram' ||
        col.key === 'discountProgram' ||
        col.key === 'noProgram'
    ),
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-full max-w-4xl rounded-lg p-6 relative">
            <div className="flex justify-between items-center mb-6 text-text01">
              <h2 className="text-2xl font-semibold">Сегменты отбора</h2>
              <div className="flex justify-center items-center space-x-6">
                <SearchInput
                  placeholder="Поиск"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  searchType="outlined"
                  classname="w-80"
                />
                <Close
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer w-6 h-6"
                />
              </div>
            </div>

            <div className="flex">
              <div className="w-3/12 pr-4 space-y-2">
                {selectedColumns.map(key => {
                  const column = columns.find(col => col.key === key);
                  return (
                    column && (
                      <div className="text-base text-text01">
                        {column.label}
                      </div>
                    )
                  );
                })}
              </div>
              <div className="w-9/12 space-y-6 bg-disabledFill rounded-2xl p-4 text-text01">
                {Object.keys(columnGroups).map(groupName => (
                  <div key={groupName}>
                    <h3 className="text-sm uppercase mb-2">{groupName}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {columnGroups[groupName].map(column => (
                        <label
                          key={column.key}
                          className="flex items-center text-base"
                        >
                          <input
                            type="checkbox"
                            checked={selectedColumns.includes(column.key)}
                            onChange={() => onColumnToggle(column.key)}
                            className="mr-2"
                          />
                          {column.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button
                title={t('organizations.save')}
                handleClick={() => {
                  setIsModalOpen(false);
                  setSelectedColumns(selectedColumns);
                }}
              />
              <Button
                title={t('warehouse.reset')}
                handleClick={() => {
                  setIsModalOpen(false);
                  setSelectedColumns([]);
                }}
                type="outline"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SegmentsDialog;
