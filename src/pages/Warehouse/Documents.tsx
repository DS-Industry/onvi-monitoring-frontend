import { useButtonCreate } from "@/components/context/useContext";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Modal from "@/components/ui/Modal/Modal";
import React, { useMemo, useState } from "react";
import Close from "@icons/close.svg?react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useSWR from "swr";
import { createDocument, getAllDocuments, getWarehouses, WarehouseDocumentType } from "@/services/api/warehouse";
import useSWRMutation from "swr/mutation";
import { getWorkers } from "@/services/api/equipment";
import { updateSearchParams } from "@/utils/updateSearchParams";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";
import { Table } from "antd";
import SavedIcon from "@icons/SavedIcon.png";
import SentIcon from "@icons/SentIcon.png";
import { getDateRender, getStatusTagRender } from "@/utils/tableUnits";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";
import dayjs from "dayjs";
import { ColumnsType } from "antd/es/table";

type Documents = {
    statusCheck: string;
    id: number;
    name: string;
    carryingAt: Date;
    status: string;
    type: string;
    warehouseName: string;
    responsibleName: string;
}

const Documents: React.FC = () => {
    const { buttonOn, setButtonOn } = useButtonCreate();
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");

    const today = dayjs().toDate();
    const formattedDate = today.toISOString().slice(0, 10);

    const [searchParams, setSearchParams] = useSearchParams();

    const document = searchParams.get("document") as WarehouseDocumentType;
    const [documentType, setDocumentType] = useState<WarehouseDocumentType>(document);
    const posId = searchParams.get("posId") || "*";
    const warehouseId = searchParams.get("warehouseId") || "*";
    const dateStart =
        searchParams.get("dateStart") ?? dayjs().toDate().toISOString().slice(0, 10);
    const dateEnd =
        searchParams.get("dateEnd") ?? dayjs().toDate().toISOString().slice(0, 10);
    const cityParam = Number(searchParams.get("city")) || "*";

    const navigate = useNavigate();

    const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: warehouseData } = useSWR(posId && cityParam ? [`get-warehouse`] : null, () => getWarehouses({
        posId: posId,
        placementId: cityParam
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const workers: { name: string; value: number; }[] = workerData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const warehouses: { name: string; value: number | string; }[] = warehouseData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const warehousesAllObj = {
        name: allCategoriesText,
        value: "*",
    };

    warehouses.unshift(warehousesAllObj);

    const filterParams = useMemo(
        () => ({
            dateStart: new Date(dateStart || `${formattedDate} 00:00`),
            dateEnd: new Date(dateEnd?.toString() || `${formattedDate} 23:59`),
            warehouseId: warehouseId || "*",
            placementId: cityParam,
        }),
        [
            dateStart,
            dateEnd,
            warehouseId,
            cityParam,
            formattedDate
        ]
    );

    const swrKey = useMemo(() =>
        warehouseId ? `get-all-documents-${filterParams.warehouseId}-${filterParams.placementId}-${filterParams.dateStart}-${filterParams.dateEnd}` : null,
        [filterParams, warehouseId]
    );

    const { data: allDocuments, isLoading: documentsLoading } = useSWR(swrKey, () => getAllDocuments(filterParams), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const data = allDocuments?.map((item) => ({
        ...item,
        warehouseName: warehouses.find((ware) => ware.value === item.warehouseId)?.name || "-",
        responsibleName: workers.find((wor) => wor.value === item.responsibleId)?.name || "-",
        status: t(`tables.${item.status}`),
        type: t(`routes.${item.type}`),
        statusCheck: '' 
    })) || [];

    const documentTypes = [
        { name: t("routes.COMMISSIONING"), value: WarehouseDocumentType.COMMISSIONING },
        { name: t("routes.WRITEOFF"), value: WarehouseDocumentType.WRITEOFF },
        { name: t("routes.MOVING"), value: WarehouseDocumentType.MOVING },
        { name: t("routes.INVENTORY"), value: WarehouseDocumentType.INVENTORY },
        { name: t("routes.RECEIPT"), value: WarehouseDocumentType.RECEIPT },
    ]

    const handleDropdownChange = (value: WarehouseDocumentType) => {
        setDocumentType(value);
        updateSearchParams(searchParams, setSearchParams, {
            document: value
        });
    };

    const { trigger: createDoc, isMutating: loadingDocument } = useSWRMutation(
        ['create-document'],
        (_, { arg }: { arg: { type: WarehouseDocumentType } }) => createDocument(arg)
    );

    const handleModalSubmit = async () => {
        if (documentType) {
            const documentTypeEnum = documentType;

            try {
                const result = await createDoc({ type: documentTypeEnum });

                if (result?.props) {
                    const { id, name, carryingAt, status } = result.props;
                    navigate(`/warehouse/documents/creation?documentId=${id}&document=${documentType}&name=${name}&carryingAt=${carryingAt}&warehouseId=${warehouseId}&status=${status}`);
                } else {
                    console.error("Document creation did not return expected data:", result);
                }
            } catch (error) {
                console.error("Error creating document:", error);
            }
        }
    };

    const dateRender = getDateRender();
    const statusRender = getStatusTagRender(t);

    const columnsAllDocuments: ColumnsType<Documents> = [
        {
            title: "",
            dataIndex: "statusCheck",
            key: "statusCheck",
            render: (_: unknown, record: { status: string }) =>
                record.status === t("tables.SENT") ?
                    <img src={SentIcon} loading="lazy" alt="SENT" />
                    : <img src={SavedIcon} loading="lazy" alt="SAVED" />
        },
        {
            title: "№",
            dataIndex: "id",
            key: "id"
        },
        {
            title: "Номер",
            dataIndex: "name",
            key: "name",
            render: (text: string, record: { id: number, type: string }) => (
                <Link
                    to={{
                        pathname: '/warehouse/documents/view',
                        search: `?documentId=${record.id}&document=${documentTypes.find((doc) => doc.name === record.type)?.value}`
                    }}
                    className="text-blue-500 hover:text-blue-700 font-semibold"
                >
                    {text}
                </Link>
            ),
        },
        {
            title: "Дата",
            dataIndex: "carryingAt",
            key: "carryingAt",
            render: dateRender
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
            render: statusRender
        },
        {
            title: "Вид документа",
            dataIndex: "type",
            key: "type"
        },
        {
            title: "Склад",
            dataIndex: "warehouseName",
            key: "warehouseName"
        },
        {
            title: "Ответственный",
            dataIndex: "responsibleName",
            key: "responsibleName"
        }
    ]

    const { checkedList, setCheckedList, options, visibleColumns } =
        useColumnSelector(columnsAllDocuments, "documents-table-columns");

    return (
        <>
            <GeneralFilters
                count={data.length}
                wareHousesSelect={warehouses}
                hideSearch={true}
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
                    pagination={false}
                    loading={documentsLoading}
                />
            </div>
            <Modal isOpen={buttonOn} onClose={() => setButtonOn(false)} handleClick={handleModalSubmit} classname="w-96 h-72" loading={loadingDocument}>
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-text01">{t("warehouse.createDoc")}</h2>
                    <div className="flex items-center gap-6">
                        <Close onClick={() => setButtonOn(false)} className="cursor-pointer" />
                    </div>
                </div>
                <DropdownInput
                    value={documentType}
                    options={documentTypes}
                    title={t("warehouse.docType")}
                    label={t("warehouse.notSel")}
                    classname="w-80"
                    onChange={handleDropdownChange}
                />
            </Modal>
        </>
    )
}

export default Documents;