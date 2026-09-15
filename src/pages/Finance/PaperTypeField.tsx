import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Space, Button as AntDButton } from 'antd';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import type { PaperTypeOption } from './paperGroupType';

type PaperTypeFieldProps = {
  paperTypeId: number;
  paperTypes: PaperTypeOption[];
  disabled: boolean;
  onSelect: (id: number) => void;
};

const PaperTypeField = ({
  paperTypeId,
  paperTypes,
  disabled,
  onSelect,
}: PaperTypeFieldProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const selected = paperTypes.find(paper => paper.value === paperTypeId);
  const filteredOptions = paperTypes.filter(opt =>
    opt.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (value: number) => {
    onSelect(value);
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={false}
        className="w-full sm:w-[600px] max-h-[550px] overflow-y-auto"
        maskClosable={false}
      >
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">
            {t('finance.addN')}
          </h2>
        </div>
        <Input
          placeholder={t('finance.selectArticle')}
          value={searchText}
          changeValue={e => setSearchText(e.target.value)}
          classname="mb-3"
        />
        <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                  paperTypeId === opt.value ? 'text-primary02' : ''
                }`}
              >
                {opt.name}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400">No matches found.</div>
          )}
        </div>
        <Button
          disabled={!paperTypeId}
          handleClick={() => setIsOpen(false)}
          title={t('finance.confirm')}
          classname="mt-4 w-full"
        />
      </Modal>
      <Space.Compact className="w-full">
        <div className="w-full">
          <div className="text-sm text-text02">{t('finance.article')}</div>
          <div className="w-full border h-10 flex items-center justify-center">
            {selected?.name || ''}
          </div>
        </div>
        <AntDButton
          onClick={() => setIsOpen(true)}
          type="primary"
          className="h-10 mt-[20px]"
          disabled={disabled}
          aria-label={t('finance.op')}
        >
          {t('finance.op')}
        </AntDButton>
      </Space.Compact>
    </>
  );
};

export default PaperTypeField;
