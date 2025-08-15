import { useMemo } from 'react';
import useSWR from 'swr';
import dayjs from 'dayjs';
import {
  getDocument,
  DocumentsTableRow,
  InventoryMetaData,
  MovingMetaData,
  WarehouseDocumentStatus,
  WarehouseDocumentType,
  getNomenclature,
  getWarehouses,
} from '@/services/api/warehouse';
import { getOrganization } from '@/services/api/organization';

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

function isInventoryMetaData(
  metaData: InventoryMetaData | MovingMetaData | undefined
): metaData is InventoryMetaData {
  return !!metaData && 'oldQuantity' in metaData && 'deviation' in metaData;
}

function isMovingMetaData(
  metaData: InventoryMetaData | MovingMetaData | undefined
): metaData is MovingMetaData {
  return !!metaData && 'warehouseReceirId' in metaData;
}

function mapInventoryDetails(
  details: DocumentsTableRow[],
  responsibleId: number,
  responsibleName: string
): TableRow[] {
  return details.map(doc => {
    const detailsProps = doc.props;
    return {
      id: detailsProps.id,
      check: false,
      responsibleId,
      responsibleName,
      nomenclatureId: detailsProps.nomenclatureId,
      quantity: detailsProps.quantity,
      comment: detailsProps.comment || '',
      oldQuantity: isInventoryMetaData(detailsProps.metaData)
        ? detailsProps.metaData.oldQuantity
        : 0,
      deviation: isInventoryMetaData(detailsProps.metaData)
        ? detailsProps.metaData.deviation
        : 0,
    };
  });
}

function mapOtherDetails(
  details: DocumentsTableRow[],
  responsibleId: number,
  responsibleName: string
): TableRow[] {
  return details.map(doc => {
    const detailsProps = doc.props;
    return {
      id: detailsProps.id,
      check: false,
      responsibleId,
      responsibleName,
      nomenclatureId: detailsProps.nomenclatureId,
      quantity: detailsProps.quantity,
      comment: detailsProps.comment || '',
    };
  });
}

export function useDocumentInitialization(
  searchParams: URLSearchParams,
  user: { id: number; name: string },
  documentType: string | null
) {
  const documentIdParam = Number(searchParams.get('documentId'));
  const posId = Number(searchParams.get('posId')) || undefined;
  const city = Number(searchParams.get('city')) || undefined;

  const {
    data: document,
    isLoading: loadingDocument,
    isValidating: validatingDocument,
  } = useSWR(
    documentIdParam ? ['get-document-view', documentIdParam] : null,
    () => getDocument(documentIdParam),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: organizationData } = useSWR([`get-org`], () =>
    getOrganization({
      placementId: city,
    })
  );

  const organizations: { name: string; value: number }[] =
    organizationData?.map((item: any) => ({ name: item.name, value: item.id })) || [];

  const { data: nomenclatureData } = useSWR(
    organizations.length ? [`get-inventory`] : null,
    () => getNomenclature(organizations.at(0)?.value || 0),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: warehouseData } = useSWR(
    [`get-warehouse`],
    () =>
      getWarehouses({
        posId: posId,
        placementId: city,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const nomenclatures: { name: string; value: number }[] =
    nomenclatureData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const warehouses: { name: string; value: number }[] =
    warehouseData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const { initialFormState, initialTableData } = useMemo(() => {
    const defaultForm: FormState = {
      warehouseId: searchParams.get('warehouseId') || '*',
      warehouseRecId: 0,
      docId: documentIdParam || 0,
      noOverHead: searchParams.get('name') || '',
      selectedDate: (() => {
        const carryingAtParam = searchParams.get('carryingAt') ?? '';
        const validDate = dayjs(carryingAtParam).toDate();
        return !isNaN(validDate.getTime())
          ? validDate.toISOString().split('T')[0]
          : dayjs().toDate().toISOString().split('T')[0];
      })(),
    };

    const defaultTableData: TableRow[] = [
      {
        id: 1,
        check: false,
        responsibleId: user.id,
        responsibleName: user.name,
        nomenclatureId: 0,
        quantity: 0,
        comment: '',
        ...(documentType === WarehouseDocumentType.INVENTORY && {
          oldQuantity: 0,
          deviation: 0,
        }),
      },
    ];

    if (document) {
      const documentsData = document.document.props;
      const documentDetails = document.details || [];
      const isSavedOrSent =
        documentsData?.status === WarehouseDocumentStatus.SAVED ||
        documentsData?.status === WarehouseDocumentStatus.SENT;

      if (isSavedOrSent) {
        const formState: FormState = {
          warehouseId: documentsData.warehouseId,
          warehouseRecId: (() => {
            const metaData = documentDetails.at(0)?.props.metaData;
            if (
              documentType === WarehouseDocumentType.MOVING &&
              metaData &&
              isMovingMetaData(metaData)
            ) {
              return metaData.warehouseReceirId;
            }
            return 0;
          })(),
          docId: documentsData.id,
          noOverHead: documentsData.name,
          selectedDate: new Date(documentsData.carryingAt)
            .toISOString()
            .split('T')[0],
        };

        const responsibleId = documentsData.responsibleId;
        const responsibleName = user.name;

        const tableData =
          documentType === WarehouseDocumentType.INVENTORY
            ? mapInventoryDetails(documentDetails, responsibleId, responsibleName)
            : mapOtherDetails(documentDetails, responsibleId, responsibleName);

        return {
          initialFormState: formState,
          initialTableData: tableData,
        };
      }
    }

    return {
      initialFormState: defaultForm,
      initialTableData: defaultTableData,
    };
  }, [document, searchParams, user.id, user.name, documentType, documentIdParam]);

  return {
    initialFormState,
    initialTableData,
    isLoading: loadingDocument,
    isValidating: validatingDocument,
    organizations,
    nomenclatures,
    warehouses,
  };
}