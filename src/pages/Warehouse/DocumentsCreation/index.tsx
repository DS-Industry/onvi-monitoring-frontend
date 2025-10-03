import Input from '@ui/Input/Input';
import DocumentCreationModal from '@/pages/Warehouse/DocumentsCreation/DocumentCreationModal';
import { useUser } from '@/hooks/useUserStore';
import {
  deleteDocument,
  DocumentBody,
  DocumentsTableRow,
  getDocument,
  getNomenclature,
  getWarehouses,
  InventoryMetaData,
  MovingMetaData,
  saveDocument,
  sendDocument,
  WarehouseDocumentStatus,
  WarehouseDocumentType,
} from '@/services/api/warehouse';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { Button, DatePicker, Select, Skeleton } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { usePermissions } from '@/hooks/useAuthStore';
import { Can } from '@/permissions/Can';
import DocumentTypesTable from '@/pages/Warehouse/DocumentsTables/DocumentTypesTable';
import { useToast } from '@/hooks/useToast';
import { ArrowLeftOutlined } from '@ant-design/icons';

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
  isDeleted?: boolean;
}

const DocumentsCreation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const documentType = searchParams.get('document');
  const documentId = Number(searchParams.get('documentId'));
  const { t } = useTranslation();
  const [warehouseId, setWarehouseId] = useState<number | string | null>(
    searchParams.get('warehouseId') || '*'
  );
  const [warehouseRecId, setWarehouseRecId] = useState(0);
  const [docId, setDocId] = useState(0);
  const [noOverhead, setNoOverHead] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    return dayjs().toDate().toISOString().split('T')[0];
  });
  const navigate = useNavigate();
  const user = useUser();
  const userPermissions = usePermissions();
  const { showToast } = useToast();
  const [isDeletingDocument, setIsDeletingDocument] = useState(false);

  const {
    data: document,
    isLoading: loadingDocument,
    isValidating: validatingDocument,
  } = useSWR([`get-document-view`], () => getDocument(documentId), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

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

  const documentsData = document?.document.props;
  const documentDetails = document?.details || [];

  useEffect(() => {
    if (loadingDocument) return;

    const isSavedOrSent =
      documentsData?.status === WarehouseDocumentStatus.SAVED ||
      documentsData?.status === WarehouseDocumentStatus.SENT;

    const mapInventoryDetails = (
      details: DocumentsTableRow[],
      responsibleId: number,
      responsibleName: string
    ) =>
      details.map(doc => {
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

    const mapOtherDetails = (
      details: DocumentsTableRow[],
      responsibleId: number,
      responsibleName: string
    ) =>
      details.map(doc => {
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

    if (isSavedOrSent) {
      setWarehouseId(documentsData.warehouseId);
      setNoOverHead(documentsData.name);
      setSelectedDate(
        new Date(documentsData.carryingAt).toISOString().split('T')[0]
      );
      setDocId(documentsData.id);

      const metaData = documentDetails.at(0)?.props.metaData;
      if (
        documentType === WarehouseDocumentType.MOVING &&
        metaData &&
        isMovingMetaData(metaData)
      ) {
        setWarehouseRecId(metaData.warehouseReceirId);
      }

      const responsibleId = documentsData.responsibleId;
      const responsibleName = documentsData.responsibleName || '';

      const tableData =
        documentType === WarehouseDocumentType.INVENTORY
          ? mapInventoryDetails(documentDetails, responsibleId, responsibleName)
          : mapOtherDetails(documentDetails, responsibleId, responsibleName);

      setTableData(tableData);
    } else {
      setWarehouseId(searchParams.get('warehouseId') || null);
      setNoOverHead(searchParams.get('name') || '');

      const carryingAtParam = searchParams.get('carryingAt') ?? '';
      const validDate = dayjs(carryingAtParam).toDate();
      setSelectedDate(
        !isNaN(validDate.getTime())
          ? validDate.toISOString().split('T')[0]
          : null
      );

      const documentIdParam = Number(searchParams.get('documentId'));
      setDocId(documentIdParam);

      const baseRow = {
        id: 1,
        check: false,
        responsibleId: user.id,
        responsibleName: user.name,
        nomenclatureId: 0,
        quantity: 0,
        comment: '',
      };

      const inventoryRow =
        documentType === WarehouseDocumentType.INVENTORY
          ? { ...baseRow, oldQuantity: 0, deviation: 0 }
          : baseRow;

      setTableData([inventoryRow]);
    }
  }, [
    document,
    documentType,
    searchParams,
    loadingDocument,
    user.id,
    user.name,
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const addProduct = () => {
    setIsModalOpen(true);
  };

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

  const posId = Number(searchParams.get('posId')) || undefined;
  const city = Number(searchParams.get('city')) || undefined;

  const { data: nomenclatureData } = useSWR(
    user.organizationId ? [`get-inventory`, user.organizationId] : null,
    () =>
      getNomenclature(user.organizationId!).finally(() => console.log('la')),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
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
      shouldRetryOnError: false,
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

  const [tableData, setTableData] = useState<TableRow[]>([]);

  const updateRow = () => {
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

      const newRow = {
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

  const deleteRow = () => {
    setTableData(prevData =>
      prevData.map(row => (row.check ? { ...row, isDeleted: true } : row))
    );
  };

  const sortAscending = () => {
    setTableData(prevData => [...prevData].sort((a, b) => a.id - b.id));
  };

  const sortDescending = () => {
    setTableData(prevData => [...prevData].sort((a, b) => b.id - a.id));
  };

  const handleSubmitAction = async (action: 'save' | 'send') => {
    const filteredTableData = tableData.filter(row => !row.isDeleted);

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
            metaData: { warehouseReceirId: warehouseRecId },
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
      warehouseId: warehouseId == null ? 0 : Number(warehouseId),
      responsibleId: tableData.at(0)?.responsibleId || user.id,
      carryingAt: dayjs(
        selectedDate === null ? dayjs().toDate() : selectedDate
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

  const handleDelete = async () => {
    setIsDeletingDocument(true);
    try {
      const result = await mutate(
        [`delete-collection`, documentId],
        () => deleteDocument(Number(documentId)),
        false
      );

      if (result) {
        navigate('/warehouse/documents');
      }
    } catch (error) {
      showToast(t('success.recordDeleted'), 'error');
    } finally {
      setIsDeletingDocument(false);
    }
  };

  return (
    <>
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
        onClick={() => {
          navigate(-1);
        }}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t(`routes.${documentType}`)}
          </span>
        </div>
      </div>
      <div>
        <DocumentCreationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onClick={setTableData}
        />
        {loadingDocument || validatingDocument ? (
          <div className="mt-16">
            <Skeleton.Input
              style={{ width: '100%', height: '300px' }}
              active
              block
            />
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row gap-y-4 py-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex">
                  <div className="mr-10 text-text01 font-normal text-sm">
                    <div>{t('warehouse.no')}</div>
                    <div>{t('warehouse.overhead')}</div>
                  </div>
                  <Input
                    type={''}
                    value={noOverhead}
                    changeValue={e => setNoOverHead(e.target.value)}
                    disabled={true}
                  />
                </div>
                <div className="flex">
                  <div className="flex mt-3 text-text01 font-normal text-sm mx-2">
                    {t('warehouse.from')}
                  </div>
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    value={selectedDate ? dayjs(selectedDate) : null}
                    onChange={(date: Dayjs | null) =>
                      setSelectedDate(date ? date.toISOString() : '')
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
                  <Select
                    showSearch
                    allowClear
                    placeholder={t('warehouse.enterWare')}
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                      (option?.label as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={warehouseId}
                    onChange={value => setWarehouseId(value)}
                    style={{ width: '20rem' }}
                    options={warehouses.map(w => ({
                      value: w.value,
                      label: w.name,
                    }))}
                  />
                </div>
                {documentType === WarehouseDocumentType.MOVING && (
                  <div className="flex space-x-2">
                    <div className="flex items-center sm:justify-center sm:w-64 text-text01 font-normal text-sm">
                      {t('warehouse.warehouseRec')}
                    </div>
                    <Select
                      showSearch
                      allowClear
                      placeholder={t('warehouse.enterWare')}
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        (option?.label as string)
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={warehouseRecId}
                      onChange={value => setWarehouseRecId(value)}
                      style={{ width: '20rem' }}
                      options={warehouses.map(w => ({
                        value: w.value,
                        label: w.name,
                      }))}
                    />
                  </div>
                )}
              </div>
            </div>
            <DocumentTypesTable
              tableData={tableData.filter(row => !row.isDeleted)}
              setTableData={setTableData}
              addRow={updateRow}
              addProduct={addProduct}
              deleteRow={deleteRow}
              sortAscending={sortAscending}
              sortDescending={sortDescending}
            />
            <Can
              requiredPermissions={[
                { action: 'manage', subject: 'Warehouse' },
                { action: 'create', subject: 'Warehouse' },
              ]}
              userPermissions={userPermissions}
            >
              {allowed =>
                allowed && (
                  <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3">
                    <Button
                      title={t('organizations.cancel')}
                      onClick={() => navigate('/warehouse/documents')}
                    >
                      {t('organizations.cancel')}
                    </Button>
                    <Button
                      onClick={handleDelete}
                      loading={isDeletingDocument}
                      className="bg-errorFill text-text04 hover:bg-red-300"
                    >
                      {t('marketing.delete')}
                    </Button>
                    <Button
                      title={t('warehouse.saveDraft')}
                      htmlType={'submit'}
                      loading={isMutating}
                      onClick={() => handleSubmitAction('save')}
                      type="primary"
                    >
                      {t('warehouse.saveDraft')}
                    </Button>
                    <Button
                      htmlType="submit"
                      loading={sendingDoc}
                      onClick={() => handleSubmitAction('send')}
                      type="primary"
                    >
                      {t('warehouse.saveAccept')}
                    </Button>
                  </div>
                )
              }
            </Can>
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentsCreation;
