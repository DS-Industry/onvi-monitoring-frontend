import {
  getDocument,
  getNomenclature,
  getWarehouses,
} from '@/services/api/warehouse';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import Input from '@/components/ui/Input/Input';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import { useUser } from '@/hooks/useUserStore';
import { getOrganization } from '@/services/api/organization';
import { Skeleton, Button as AntDButton } from 'antd';
import DateInput from '@/components/ui/Input/DateInput';
import dayjs from 'dayjs';
import DocumentsViewTable from './DocumentsTables/DocumentsViewTable';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import { PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';

type InventoryMetaData = {
  oldQuantity: number;
  deviation: number;
};

type MovingMetaData = {
  warehouseReceirId: number;
};

const DocumentView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const posId = Number(searchParams.get('posId')) || undefined;
  const city = Number(searchParams.get('city')) || undefined;
  const documentType = searchParams.get('document');
  const user = useUser();
  const userPermissions = usePermissions();

  const documentId = searchParams.get('documentId');
  const {
    data: document,
    isLoading: loadingDocument,
    isValidating: validatingDocument,
  } = useSWR([`get-document`], () => getDocument(Number(documentId)), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const { data: organizationData } = useSWR([`get-org`], () =>
    getOrganization({
      placementId: city,
    })
  );

  const organizations: { name: string; value: number }[] =
    organizationData?.map(item => ({ name: item.name, value: item.id })) || [];

  const { data: nomenclatureData } = useSWR(
    organizations ? [`get-inventory`] : null,
    () => getNomenclature(organizations[0].value),
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

  const baseColumns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Ответственный',
      dataIndex: 'responsibleName',
      key: 'responsibleName',
    },
    {
      title: 'Номенклатура',
      dataIndex: 'nomenclatureName',
      key: 'nomenclatureName',
    },
    {
      title: 'Кол-во',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Комментарий',
      dataIndex: 'comment',
      key: 'comment',
    },
  ];

  const inventoryExtraColumns = [
    {
      title: 'Кол-во учет',
      dataIndex: 'oldQuantity',
      key: 'oldQuantity',
    },
    {
      title: 'Отклонение',
      dataIndex: 'deviation',
      key: 'deviation',
    },
  ];

  const columnsDocumentView =
    documentType === 'INVENTORY'
      ? [...baseColumns, ...inventoryExtraColumns]
      : baseColumns;

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

  const tableData: {
    id: number;
    responsibleName: string;
    nomenclatureName: string;
    quantity: number;
    comment?: string;
    oldQuantity?: number;
    deviation?: number;
  }[] =
    documentType === 'INVENTORY'
      ? (document?.details || []).map(doc => ({
          id: doc.props.id,
          responsibleName: user.name,
          nomenclatureName:
            nomenclatures.find(nom => nom.value === doc.props.nomenclatureId)
              ?.name || '',
          quantity: doc.props.quantity,
          comment: doc.props.comment,
          oldQuantity: isInventoryMetaData(doc.props.metaData)
            ? doc.props.metaData.oldQuantity
            : 0,
          deviation: isInventoryMetaData(doc.props.metaData)
            ? doc.props.metaData.deviation
            : 0,
        }))
      : (document?.details || []).map(doc => ({
          id: doc.props.id,
          responsibleName: user.name,
          nomenclatureName:
            nomenclatures.find(nom => nom.value === doc.props.nomenclatureId)
              ?.name || '',
          quantity: doc.props.quantity,
          comment: doc.props.comment,
        }));

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'Warehouse' },
    { action: 'create', subject: 'Warehouse' },
  ]);

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t(`routes.${documentType}`)}
          </span>
          <QuestionMarkIcon />
        </div>
        {allowed && (
          <AntDButton
            icon={<PlusOutlined />}
            className="btn-primary"
            onClick={() => {
              navigate(
                `/warehouse/documents/creation?documentId=${documentId}&document=${documentType}`
              );
            }}
          >
            {t(`routes.edit`)}
          </AntDButton>
        )}
      </div>
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
          <div className="flex flex-col sm:flex-row gap-4 py-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex">
                <div className="mr-10 text-text01 font-normal text-sm">
                  <div>{t('warehouse.no')}</div>
                  <div>{t('warehouse.overhead')}</div>
                </div>
                <Input
                  type={''}
                  value={document?.document.props.name}
                  changeValue={() => {}}
                  disabled={true}
                />
              </div>
              <div className="flex">
                <div className="flex mt-3 text-text01 font-normal text-sm mx-2">
                  {t('warehouse.from')}
                </div>
                <DateInput
                  value={
                    document?.document.props.createdAt
                      ? dayjs(document?.document.props.createdAt)
                      : null
                  }
                  changeValue={() => {}}
                  disabled={true}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-6">
              <div className="flex space-x-2">
                <div className="flex items-center sm:justify-center sm:w-64 text-text01 font-normal text-sm">
                  {documentType === 'MOVING'
                    ? t('warehouse.warehouseSend')
                    : t('warehouse.ware')}
                </div>
                <DropdownInput
                  value={document?.document.props.warehouseId}
                  options={warehouses}
                  classname="w-48 sm:w-80"
                  onChange={() => {}}
                  isDisabled={true}
                />
              </div>
              {documentType === 'MOVING' && (
                <div className="flex space-x-2">
                  <div className="flex items-center sm:justify-center sm:w-64 text-text01 font-normal text-sm">
                    {t('warehouse.warehouseRec')}
                  </div>
                  <DropdownInput
                    value={
                      isMovingMetaData(document?.details[0].props.metaData) &&
                      document?.details[0].props.metaData?.warehouseReceirId
                    }
                    options={warehouses}
                    classname="w-48 sm:w-80"
                    onChange={() => {}}
                    isDisabled={true}
                  />
                </div>
              )}
            </div>
          </div>
          <DocumentsViewTable
            tableData={tableData}
            columns={columnsDocumentView}
            documentName={document?.document.props.name}
            documentTime={dayjs(
              document?.document.props.createdAt ?? ''
            ).format('DD.MM.YYYY HH:mm:ss')}
          />
        </div>
      )}
    </div>
  );
};

export default DocumentView;
