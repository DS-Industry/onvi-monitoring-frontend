import { getDocument, getWarehouses } from "@/services/api/warehouse";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import moment from "moment";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import { useDocumentType } from "@/hooks/useAuthStore";
import GoodsTable from "@/components/ui/Table/GoodsTable";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useButtonCreate } from "@/components/context/useContext";

type InventoryMetaData = {
    oldQuantity: number;
    deviation: number;
}

type MovingMetaData = {
    warehouseReceirId: number;
}

const DocumentView: React.FC = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const documentType = useDocumentType();
    const { buttonOn } = useButtonCreate();
    const navigate = useNavigate();
    const { data: document, isLoading: loadingDocument } = useSWR([`get-document`], () => getDocument(location.state.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: warehouseData } = useSWR([`get-warehouse`], () => getWarehouses(1), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const warehouses: { name: string; value: number; }[] = warehouseData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const columnsDocumentView = documentType === "INVENTORY" ? [
        {
            label: "",
            key: "check",
            type: "checkbox"
        },
        {
            label: "№",
            key: "id"
        },
        {
            label: "Ответственный",
            key: "responsibleId"
        },
        {
            label: "Номенклатура",
            key: "nomenclatureId"
        },
        {
            label: "Кол-во",
            key: "quantity"
        },
        {
            label: "Комментарий",
            key: "comment"
        },
        {
            label: "Кол-во учет",
            key: "oldQuantity"
        },
        {
            label: "Отклонение",
            key: "deviation"
        }
    ] : [
        {
            label: "",
            key: "check"
        },
        {
            label: "№",
            key: "id"
        },
        {
            label: "Ответственный",
            key: "responsibleId"
        },
        {
            label: "Номенклатура",
            key: "nomenclatureId"
        },
        {
            label: "Кол-во",
            key: "quantity"
        },
        {
            label: "Комментарий",
            key: "comment"
        }
    ];

    function isInventoryMetaData(metaData: InventoryMetaData | MovingMetaData | undefined): metaData is InventoryMetaData {
        return !!metaData && 'oldQuantity' in metaData && 'deviation' in metaData;
    }

    function isMovingMetaData(metaData: InventoryMetaData | MovingMetaData | undefined): metaData is MovingMetaData {
        return !!metaData && 'warehouseReceirId' in metaData;
    }

    const tableData: { 
        id: number; 
        responsibleId: number; 
        nomenclatureId: number; 
        quantity: number; 
        comment?: string; 
        oldQuantity?: number; 
        deviation?: number; 
    }[] = documentType === "INVENTORY"
        ? (document?.details || []).map((doc) => ({
            id: doc.props.id,
            responsibleId: document?.document.props.responsibleId ?? 0, 
            nomenclatureId: doc.props.nomenclatureId,
            quantity: doc.props.quantity,
            comment: doc.props.comment,
            oldQuantity: isInventoryMetaData(doc.props.metaData) ? doc.props.metaData.oldQuantity : 0,
            deviation: isInventoryMetaData(doc.props.metaData) ? doc.props.metaData.deviation : 0
        }))
        : (document?.details || []).map((doc) => ({
            id: doc.props.id,
            responsibleId: document?.document.props.responsibleId ?? 0, 
            nomenclatureId: doc.props.nomenclatureId,
            quantity: doc.props.quantity,
            comment: doc.props.comment
        }));    

    useEffect(() => {
        if(buttonOn)
            navigate("/warehouse/documents/creation", {state: { ownerId: location.state.ownerId } })
    },[buttonOn, location.state.ownerId, navigate])

    return (
        <div className="ml-20">
            {loadingDocument ? <TableSkeleton columnCount={10} /> :
                <div>
                    <div className="flex space-x-3 text-text02">
                        <div>{document?.document.props.name}</div>
                        <div>{moment(new Date(document?.document.props.createdAt ?? '')).format('DD.MM.YYYY HH:mm:ss')}</div>
                    </div>
                    <div className="flex py-4 justify-between">
                        <div className="flex">
                            <div className="mr-10 text-text01 font-normal text-sm">
                                <div>{t("warehouse.no")}</div>
                                <div>{t("warehouse.overhead")}</div>
                            </div>
                            <Input
                                type={""}
                                value={document?.document.props.name}
                                changeValue={() => { }}
                                disabled={true}
                            />
                            <div className="flex mt-3 text-text01 font-normal text-sm mx-2">{t("warehouse.from")}</div>
                            <Input
                                type={"date"}
                                value={new Date(document?.document.props.createdAt ?? '').toISOString().split("T")[0] || null}
                                changeValue={() => { }}
                                disabled={true}
                            />
                        </div>
                        <div className="flex flex-col space-y-6">
                            <div className="flex">
                                <div className="flex items-center justify-center w-64 text-text01 font-normal text-sm">{documentType === "MOVING" ? t("warehouse.warehouseSend") : t("warehouse.ware")}</div>
                                <DropdownInput
                                    value={document?.document.props.warehouseId}
                                    options={warehouses}
                                    classname="w-80"
                                    onChange={() => { }}
                                    isDisabled={true}
                                />
                            </div>
                            {documentType === "MOVING" && <div className="flex">
                                <div className="flex items-center justify-center w-64 text-text01 font-normal text-sm">{t("warehouse.warehouseRec")}</div>
                                <DropdownInput
                                    value={isMovingMetaData(document?.details[0].props.metaData) && document?.details[0].props.metaData?.warehouseReceirId}
                                    options={warehouses}
                                    classname="w-80"
                                    onChange={() => { }}
                                    isDisabled={true}
                                />
                            </div>}
                        </div>
                    </div>
                    <GoodsTable
                        tableData={tableData}
                        columns={columnsDocumentView}
                    />
                </div>
            }
        </div>
    )
}

export default DocumentView;