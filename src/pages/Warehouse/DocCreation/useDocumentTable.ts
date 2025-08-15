import { useState } from 'react';
import { WarehouseDocumentType } from '@/services/api/warehouse';

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

interface Nomenclature {
  name: string;
  value: number;
}

export function useDocumentTable(
  initialData: TableRow[],
  documentType: string | null,
  nomenclatures: Nomenclature[],
  user: { id: number; name: string }
) {
  const [tableData, setTableData] = useState<TableRow[]>(initialData);

  const addRow = () => {
    setTableData(prevData => {
      const maxId =
        prevData.length > 0 ? Math.max(...prevData.map(row => row.id)) : 0;
      const existingNomenclatureIds = new Set(
        prevData.map(row => row.nomenclatureId)
      );
      const availableNomenclature = nomenclatures.find(
        nom => !existingNomenclatureIds.has(nom.value)
      );

      if (!availableNomenclature) {
        return prevData;
      }

      const newRow: TableRow = {
        id: maxId + 1,
        check: false,
        responsibleId: user.id,
        responsibleName: user.name,
        nomenclatureId: availableNomenclature.value,
        quantity: 0,
        comment: '',
        ...(documentType === WarehouseDocumentType.INVENTORY && {
          oldQuantity: 0,
          deviation: 0,
        }),
      };

      return [...prevData, newRow];
    });
  };

  const deleteSelectedRows = () => {
    setTableData(prevData => prevData.filter(row => !row.check));
  };

  const sortAscending = () => {
    setTableData(prevData => [...prevData].sort((a, b) => a.id - b.id));
  };

  const sortDescending = () => {
    setTableData(prevData => [...prevData].sort((a, b) => b.id - a.id));
  };

  const updateTableData = (newData: TableRow[]) => {
    setTableData(newData);
  };

  return {
    tableData,
    setTableData: updateTableData,
    addRow,
    deleteSelectedRows,
    sortAscending,
    sortDescending,
  };
}