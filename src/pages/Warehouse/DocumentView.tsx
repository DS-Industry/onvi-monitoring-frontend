import { getDocument, getNomenclature, getWarehouses } from "@/services/api/warehouse";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import moment from "moment";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import { useCity, useDocumentType, usePosType } from "@/hooks/useAuthStore";
import GoodsTable from "@/components/ui/Table/GoodsTable";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useButtonCreate } from "@/components/context/useContext";
import { useUser } from "@/hooks/useUserStore";

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
    const posType = usePosType();
    const city = useCity();
    const user = useUser();

    const { data: document, isLoading: loadingDocument } = useSWR([`get-document`], () => getDocument(location.state.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: nomenclatureData } = useSWR([`get-inventory`], () => getNomenclature(1), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const nomenclatures: { name: string; value: number; }[] = nomenclatureData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const { data: warehouseData } = useSWR([`get-warehouse`], () => getWarehouses({
        posId: posType,
        placementId: city
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const warehouses: { name: string; value: number; }[] = warehouseData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const columnsDocumentView = documentType === "INVENTORY" ? [
        {
            label: "№",
            key: "id"
        },
        {
            label: "Ответственный",
            key: "responsibleName"
        },
        {
            label: "Номенклатура",
            key: "nomenclatureName"
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
            label: "№",
            key: "id"
        },
        {
            label: "Ответственный",
            key: "responsibleName"
        },
        {
            label: "Номенклатура",
            key: "nomenclatureName"
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
        responsibleName: string;
        nomenclatureName: string;
        quantity: number;
        comment?: string;
        oldQuantity?: number;
        deviation?: number;
    }[] = documentType === "INVENTORY"
            ? (document?.details || []).map((doc) => ({
                id: doc.props.id,
                responsibleName: user.name,
                nomenclatureName: nomenclatures.find((nom) => nom.value === doc.props.nomenclatureId)?.name || "",
                quantity: doc.props.quantity,
                comment: doc.props.comment,
                oldQuantity: isInventoryMetaData(doc.props.metaData) ? doc.props.metaData.oldQuantity : 0,
                deviation: isInventoryMetaData(doc.props.metaData) ? doc.props.metaData.deviation : 0
            }))
            : (document?.details || []).map((doc) => ({
                id: doc.props.id,
                responsibleName: user.name,
                nomenclatureName: nomenclatures.find((nom) => nom.value === doc.props.nomenclatureId)?.name || "",
                quantity: doc.props.quantity,
                comment: doc.props.comment
            }));

    useEffect(() => {
        if (buttonOn)
            navigate("/warehouse/documents/creation", { state: { ownerId: location.state.ownerId } })
    }, [buttonOn, location.state.ownerId, navigate])

    return (
        <div>
            {loadingDocument ? <TableSkeleton columnCount={10} /> :
                <div>
                    <div className="flex flex-col sm:flex-row gap-4 py-4">
                        <div className="flex flex-wrap gap-4">
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
                            </div>
                            <div className="flex">
                                <div className="flex mt-3 text-text01 font-normal text-sm mx-2">{t("warehouse.from")}</div>
                                <Input
                                    type={"date"}
                                    value={new Date(document?.document.props.createdAt ?? '').toISOString().split("T")[0] || null}
                                    changeValue={() => { }}
                                    disabled={true}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col space-y-6">
                            <div className="flex space-x-2">
                                <div className="flex items-center sm:justify-center sm:w-64 text-text01 font-normal text-sm">{documentType === "MOVING" ? t("warehouse.warehouseSend") : t("warehouse.ware")}</div>
                                <DropdownInput
                                    value={document?.document.props.warehouseId}
                                    options={warehouses}
                                    classname="w-48 sm:w-80"
                                    onChange={() => { }}
                                    isDisabled={true}
                                />
                            </div>
                            {documentType === "MOVING" && <div className="flex space-x-2">
                                <div className="flex items-center sm:justify-center sm:w-64 text-text01 font-normal text-sm">{t("warehouse.warehouseRec")}</div>
                                <DropdownInput
                                    value={isMovingMetaData(document?.details[0].props.metaData) && document?.details[0].props.metaData?.warehouseReceirId}
                                    options={warehouses}
                                    classname="w-48 sm:w-80"
                                    onChange={() => { }}
                                    isDisabled={true}
                                />
                            </div>}
                        </div>
                    </div>
                    <GoodsTable
                        tableData={tableData}
                        columns={columnsDocumentView}
                        showDocument={true}
                        documentName={document?.document.props.name}
                        documentTime={moment(new Date(document?.document.props.createdAt ?? '')).format('DD.MM.YYYY HH:mm:ss')}
                    />
                </div>
            }
        </div>
    )
}

export default DocumentView;