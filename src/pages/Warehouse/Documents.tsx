import DropdownInput from '@/components/ui/Input/DropdownInput';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import {
  createDocument,
  getAllDocuments,
  unsendDocument,
  WarehouseDocumentStatus,
  WarehouseDocumentType,
} from '@/services/api/warehouse';
import useSWRMutation from 'swr/mutation';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useToast } from '@/components/context/useContext';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { Table, Button, Modal, Popconfirm } from 'antd';
import SavedIcon from '@icons/SavedIcon.png';
import SentIcon from '@icons/SentIcon.png';
import { getDateRender, getStatusTagRender } from '@/utils/tableUnits';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { useUser } from '@/hooks/useUserStore';

type Documents = {
  statusCheck: string;
  id: number;
  name: string;
  carryingAt: Date;
  status: string;
  statusRaw: WarehouseDocumentStatus;
  type: string;
  typeRaw: WarehouseDocumentType;
  warehouseName: string;
  responsibleName: string;
};

const Documents: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unsendingDocumentId, setUnsendingDocumentId] = useState<number | null>(
    null
  );
  const today = dayjs().toDate();
  const formattedDate = today.toISOString().slice(0, 10);
  const userPermissions = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();

  const document = searchParams.get('document') as WarehouseDocumentType;
  const [documentType, setDocumentType] =
    useState<WarehouseDocumentType>(document);
  const warehouseId = Number(searchParams.get('warehouseId')) || undefined;
  const dateStart =
    searchParams.get('dateStart') ??
    dayjs().toDate().toISOString().slice(0, 10);
  const dateEnd =
    searchParams.get('dateEnd') ?? dayjs().toDate().toISOString().slice(0, 10);
  const cityParam = Number(searchParams.get('city')) || undefined;

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const filterParams = useMemo(
    () => ({
      dateStart: new Date(dateStart || `${formattedDate} 00:00`),
      dateEnd: new Date(dateEnd?.toString() || `${formattedDate} 23:59`),
      warehouseId: warehouseId,
      placementId: cityParam,
      page: currentPage,
      size: pageSize,
      organizationId: user.organizationId,
    }),
    [dateStart, dateEnd, warehouseId, cityParam, formattedDate, currentPage, pageSize, user.organizationId]
  );

  const swrKey = `get-all-documents-${filterParams.warehouseId}-${filterParams.placementId}-${filterParams.dateStart}-${filterParams.dateEnd}-${filterParams.page}-${filterParams.size}-${filterParams.organizationId}`; // ✅ обновлён ключ

  const { data: allDocuments, isLoading: documentsLoading } = useSWR(
    swrKey,
    () => getAllDocuments(filterParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const data =
    allDocuments?.data?.map(item => ({
      ...item,
      status: t(`tables.${item.status}`),
      statusRaw: item.status,
      type: t(`routes.${item.type}`),
      typeRaw: item.type,
      statusCheck: '',
    })) || [];

  const documentTypes = [
    {
      name: t('routes.COMMISSIONING'),
      value: WarehouseDocumentType.COMMISSIONING,
    },
    { name: t('routes.WRITEOFF'), value: WarehouseDocumentType.WRITEOFF },
    { name: t('routes.MOVING'), value: WarehouseDocumentType.MOVING },
    { name: t('routes.INVENTORY'), value: WarehouseDocumentType.INVENTORY },
    { name: t('routes.RECEIPT'), value: WarehouseDocumentType.RECEIPT },
  ];

  const handleDropdownChange = (value: WarehouseDocumentType) => {
    setDocumentType(value);
    updateSearchParams(searchParams, setSearchParams, {
      document: value,
    });
  };

  const { trigger: createDoc, isMutating: loadingDocument } = useSWRMutation(
    ['create-document'],
    (_, { arg }: { arg: { type: WarehouseDocumentType } }) =>
      createDocument(arg)
  );

  const { trigger: unsendDoc } = useSWRMutation(
    ['unsend-document'],
    (_, { arg }: { arg: number }) => unsendDocument(arg)
  );

  const handleUnsend = async (documentId: number) => {
    setUnsendingDocumentId(documentId);
    try {
      await unsendDoc(documentId);
      await mutate(swrKey);
      showToast(t('warehouse.unsendSuccess'), 'success');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message;
      showToast(
        message || t('errors.other.errorDuringFormSubmission'),
        'error'
      );
    } finally {
      setUnsendingDocumentId(null);
    }
  };

  const handleModalSubmit = async () => {
    if (documentType) {
      try {
        const result = await createDoc({ type: documentType });

        if (result?.props) {
          const { id, name, carryingAt, status } = result.props;
          navigate(
            `/warehouse/documents/creation?documentId=${id}&document=${documentType}&name=${name}&carryingAt=${carryingAt}&warehouseId=${warehouseId}&status=${status}`
          );
        } else {
          console.error(
            'Document creation did not return expected data:',
            result
          );
        }
      } catch (error) {
        console.error('Error creating document:', error);
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    }
  };

  const allowed = hasPermission(
    [
      { action: 'manage', subject: 'Warehouse' },
      { action: 'create', subject: 'Warehouse' },
    ],
    userPermissions
  );

  const dateRender = getDateRender();
  const statusRender = getStatusTagRender(t);

  const columnsAllDocuments: ColumnsType<Documents> = [
    {
      title: '',
      dataIndex: 'statusCheck',
      key: 'statusCheck',
      render: (_: unknown, record: Documents) => (
        <div className="flex items-center gap-2">
          {record.statusRaw === WarehouseDocumentStatus.SENT ? (
            <img src={SentIcon} loading="lazy" alt="SENT" />
          ) : (
            <img src={SavedIcon} loading="lazy" alt="SAVED" />
          )}
          {allowed && record.statusRaw === WarehouseDocumentStatus.SENT && (
            <Popconfirm
              title={t('warehouse.unsendConfirm')}
              onConfirm={() => handleUnsend(record.id)}
              okText={t('warehouse.unsendReturn')}
              cancelText={t('organizations.cancel')}
            >
              <Button
                size="small"
                loading={unsendingDocumentId === record.id}
                disabled={
                  unsendingDocumentId !== null &&
                  unsendingDocumentId !== record.id
                }
              >
                {t('warehouse.unsendReturn')}
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
    {
      title: t('warehouse.no'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('equipment.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Documents) => (
        <Link
          to={{
            pathname: '/warehouse/documents/view',
            search: `?documentId=${record.id}&document=${record.typeRaw}`,
          }}
          className="text-blue-500 hover:text-blue-700 font-semibold"
        >
          {text}
        </Link>
      ),
    },
    {
      title: t('marketing.date'),
      dataIndex: 'carryingAt',
      key: 'carryingAt',
      render: dateRender,
    },
    {
      title: t('table.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: statusRender,
    },
    {
      title: t('warehouse.docType'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('routes.ware'),
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: t('equipment.resp'),
      dataIndex: 'responsibleName',
      key: 'responsibleName',
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columnsAllDocuments, 'documents-table-columns');

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    updateSearchParams(searchParams, setSearchParams, {
      page: current,
      size: pageSize,
    });
  };

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.documents')}
          </span>
        </div>
        {allowed && (
          <Button
            icon={<PlusOutlined />}
            className="btn-primary"
            onClick={() => setIsModalOpen(!isModalOpen)}
          >
            <div className='hidden sm:flex'>{t('routes.add')}</div>
          </Button>
        )}
      </div>
      <GeneralFilters
        count={allDocuments?.total || 0}
        display={['warehouse', 'city', 'dateTime']}
      />
      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />
        <Table<Documents>
          dataSource={data}
          columns={visibleColumns}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: allDocuments?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          onChange={handleTableChange}
          loading={documentsLoading}
          scroll={{ x: 'max-content' }}
        />
      </div>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleModalSubmit}
        className="w-96 h-72"
        okButtonProps={{
          loading: loadingDocument,
        }}
        okText={t('organizations.save')}
        cancelText={t('organizations.cancel')}
      >
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-text01">
            {t('warehouse.createDoc')}
          </h2>
        </div>
        <DropdownInput
          value={documentType}
          options={documentTypes}
          title={t('warehouse.docType')}
          label={t('warehouse.notSel')}
          classname="w-80"
          onChange={handleDropdownChange}
        />
      </Modal>
    </>
  );
};

export default Documents;
