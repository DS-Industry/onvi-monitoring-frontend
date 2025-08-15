import { useUser } from '@/hooks/useUserStore';
import { Skeleton } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDocumentInitialization } from './useDocumentInitialization';
import { useDocumentTable } from './useDocumentTable';
import { useDocumentSubmit } from './useDocumentSubmit';
import { useState } from 'react';
import Header from './components/Header';
import DocumentForm from './components/DocumentForm';
import DocumentTypesTable from '../DocumentsTables/DocumentTypesTable';
import DocumentActions from './components/DocumentActions';

import { getNomenclature, getWarehouses } from '@/services/api/warehouse';

import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import useSWR from 'swr';
import { getOrganization } from '@/services/api/organization';
import { useTranslation } from 'react-i18next';

export default function DocCreation() {
  const [searchParams] = useSearchParams();
  const documentType = searchParams.get('document');
  const navigate = useNavigate();
  const user = useUser();

  const city = Number(searchParams.get('city')) || undefined;
  const posId = Number(searchParams.get('posId')) || undefined;

  const [docId, setDocId] = useState(0);

  const { t } = useTranslation();

  const { initialFormState, initialTableData, isLoading, isValidating } =
    useDocumentInitialization(searchParams, user, documentType);

  const { data: organizationData } = useSWR([`get-org`], () =>
    getOrganization({
      placementId: city,
    })
  );

  const organizations: { name: string; value: number }[] =
    organizationData?.map(item => ({ name: item.name, value: item.id })) || [];

  const { data: nomenclatureData } = useSWR(
    organizations ? [`get-inventory`] : null,
    () => getNomenclature(organizations.at(0)?.value || 0),
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

  const warehouses: { name: string; value: number }[] =
    warehouseData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const {
    tableData,
    addRow,
    deleteSelectedRows,
    sortAscending,
    sortDescending,
    // updateCell,
  } = useDocumentTable(initialTableData, documentType, nomenclatures, user);

  const [formState, setFormState] = useState(initialFormState);

  const { submit, isMutating, sendingDoc } = useDocumentSubmit(
    docId,
    documentType,
    navigate
  );

  if (isLoading || isValidating) {
    return (
      <Skeleton.Input style={{ width: '100%', height: '300px' }} active block />
    );
  }

  return (
    <>
      <Header title={t(`routes.${documentType}`)} icon={<QuestionMarkIcon />} />
      <DocumentForm
        formState={formState}
        setFormState={setFormState}
        warehouses={warehouses}
        documentType={documentType}
      />
      <DocumentTypesTable
        tableData={tableData}
        onAdd={addRow}
        onDelete={deleteSelectedRows}
        onSortAsc={sortAscending}
        onSortDesc={sortDescending}
        // onCellChange={updateCell}
      />
      <DocumentActions
        onCancel={() => navigate('/warehouse/documents')}
        onSave={() => submit('save', formState, tableData, user.id)}
        onSend={() => submit('send', formState, tableData, user.id)}
        isSaving={isMutating}
        isSending={sendingDoc}
      />
    </>
  );
}
