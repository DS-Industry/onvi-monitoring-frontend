import React from 'react';
import { useTranslation } from 'react-i18next';
import DropdownInput from '@ui/Input/DropdownInput';
import Input from '@ui/Input/Input';
import DateInput from '@ui/Input/DateInput';
import dayjs from 'dayjs';
import { WarehouseDocumentType } from '@/services/api/warehouse';

interface FormState {
  warehouseId: number | string | null;
  warehouseRecId: number;
  docId: number;
  noOverHead: string;
  selectedDate: string | null;
}

interface DocumentFormProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  warehouses: { name: string; value: number }[];
  documentType: string | null;
}

const DocumentForm: React.FC<DocumentFormProps> = ({
  formState,
  setFormState,
  warehouses,
  documentType,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row gap-y-4 py-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex">
          <div className="mr-10 text-text01 font-normal text-sm">
            <div>{t('warehouse.no')}</div>
            <div>{t('warehouse.overhead')}</div>
          </div>
          <Input
            type={''}
            value={formState.noOverHead}
            changeValue={e => 
              setFormState(prev => ({ ...prev, noOverHead: e.target.value }))
            }
            disabled={true}
          />
        </div>
        <div className="flex">
          <div className="flex mt-3 text-text01 font-normal text-sm mx-2">
            {t('warehouse.from')}
          </div>
          <DateInput
            value={formState.selectedDate ? dayjs(formState.selectedDate) : null}
            changeValue={date =>
              setFormState(prev => ({
                ...prev,
                selectedDate: date ? date.format('YYYY-MM-DDTHH:mm') : ''
              }))
            }
          />
        </div>
      </div>
      <div className="flex flex-col space-y-6">
        <div className="flex space-x-2">
          <div className="flex items-center justify-start sm:justify-center sm:w-64 text-text01 font-normal text-sm">
            {documentType === WarehouseDocumentType.MOVING
              ? t('warehouse.warehouseSend')
              : t('warehouse.ware')}
          </div>
          <DropdownInput
            value={formState.warehouseId}
            options={warehouses}
            label={t('warehouse.enterWare')}
            classname="w-48 sm:w-80"
            onChange={value => 
              setFormState(prev => ({ ...prev, warehouseId: value }))
            }
          />
        </div>
        {documentType === WarehouseDocumentType.MOVING && (
          <div className="flex space-x-2">
            <div className="flex items-center sm:justify-center sm:w-64 text-text01 font-normal text-sm">
              {t('warehouse.warehouseRec')}
            </div>
            <DropdownInput
              value={formState.warehouseRecId}
              options={warehouses}
              label={t('warehouse.enterWare')}
              classname="w-48 sm:w-80"
              onChange={value => 
                setFormState(prev => ({ ...prev, warehouseRecId: value }))
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentForm;