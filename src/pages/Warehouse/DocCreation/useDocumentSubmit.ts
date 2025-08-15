import useSWRMutation from 'swr/mutation';
import { useNavigate } from 'react-router-dom';
import {
  DocumentBody,
  saveDocument,
  sendDocument,
  WarehouseDocumentType,
} from '@/services/api/warehouse';
import dayjs from 'dayjs';

interface TableRow {
  id: number;
  check: boolean;
  responsibleId: number;
  responsibleName: string;
  nomenclatureId: number;
  quantity: number;
  comment: string;
  oldQuantity?: number;
  deviation?: number;
}

interface FormState {
  warehouseId: number | string | null;
  warehouseRecId: number;
  docId: number;
  noOverHead: string;
  selectedDate: string | null;
}

export function useDocumentSubmit(
  docId: number,
  documentType: string | null,
  navigate: ReturnType<typeof useNavigate>
) {
  const { trigger: saveDoc, isMutating } = useSWRMutation(
    ['save-document'],
    async (_, { arg }: { arg: DocumentBody }) => {
      return saveDocument(arg, docId);
    }
  );

  const { trigger: sendDoc, isMutating: sendingDoc } = useSWRMutation(
    ['send-document'],
    async (_, { arg }: { arg: DocumentBody }) => {
      return sendDocument(arg, docId);
    }
  );

  const submit = async (
    action: 'save' | 'send',
    formState: FormState,
    tableData: TableRow[],
    userId: number
  ) => {
    const filteredTableData = tableData.filter(data => data.check === true);

    const detailValues =
      filteredTableData?.map(data => {
        const base = {
          nomenclatureId: data.nomenclatureId,
          quantity: Number(data.quantity),
          comment: data.comment,
        };

        if (documentType === WarehouseDocumentType.MOVING) {
          return {
            ...base,
            metaData: { warehouseReceirId: formState.warehouseRecId },
          };
        }

        if (documentType === WarehouseDocumentType.INVENTORY) {
          return {
            ...base,
            metaData: {
              oldQuantity: Number(data.oldQuantity),
              deviation: Number(data.deviation),
            },
          };
        }
        return base;
      }) || [];

    const payload = {
      warehouseId: formState.warehouseId == null ? 0 : Number(formState.warehouseId),
      responsibleId: tableData.at(0)?.responsibleId || userId,
      carryingAt: dayjs(
        formState.selectedDate === null ? dayjs().toDate() : formState.selectedDate
      ).toDate(),
      details: detailValues,
    };

    let result;
    if (action === 'save') {
      result = await saveDoc(payload);
    } else if (action === 'send') {
      result = await sendDoc(payload);
    }

    if (result) {
      navigate('/warehouse/documents');
    }
  };

  return { submit, isMutating, sendingDoc };
}