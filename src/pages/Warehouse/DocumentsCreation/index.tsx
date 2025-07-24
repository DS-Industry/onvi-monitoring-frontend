import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import DocumentCreationModal from "@/pages/Warehouse/DocumentsCreation/DocumentCreationModal";
import { useUser } from "@/hooks/useUserStore";
import { getOrganization } from "@/services/api/organization";
import { getDocument, getNomenclature, getWarehouses, saveDocument, sendDocument } from "@/services/api/warehouse";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { Skeleton } from "antd";
import DateInput from "@/components/ui/Input/DateInput";
import dayjs from "dayjs";
import { usePermissions } from "@/hooks/useAuthStore";
import { Can } from "@/permissions/Can";
import { updateSearchParams } from "@/utils/updateSearchParams";
import DocumentTypesTable from "@/pages/Warehouse/DocumentsTables/DocumentTypesTable";

type InventoryMetaData = {
    oldQuantity: number;
    deviation: number;
}

type MovingMetaData = {
    warehouseReceirId: number;
}

type DocumentsTableRow = {
    props: {
        id: number;
        warehouseDocumentId: number;
        nomenclatureId: number;
        quantity: number;
        comment?: string;
        metaData?: InventoryMetaData | MovingMetaData;
    }
}
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

const DocumentsCreation: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const documentType = searchParams.get("document");
    const { t } = useTranslation();
    const warehouseID = searchParams.get("warehouseId") || "*";
    const [warehouseId, setWarehouseId] = useState<number | string | null>(warehouseID);
    const [warehouseRecId, setWarehouseRecId] = useState(0);
    const [docId, setDocId] = useState(0);
    const [noOverhead, setNoOverHead] = useState('');
    const [selectedDate, setSelectedDate] = useState<string | null>(() => {
        return dayjs().toDate().toISOString().split("T")[0];
    });
    const navigate = useNavigate();
    const user = useUser();
    const userPermissions = usePermissions();

    const { data: document, isLoading: loadingDocument, isValidating: validatingDocument } = useSWR([`get-document-view`], () => getDocument(Number(searchParams.get("documentId"))), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    function isInventoryMetaData(metaData: InventoryMetaData | MovingMetaData | undefined): metaData is InventoryMetaData {
        return !!metaData && 'oldQuantity' in metaData && 'deviation' in metaData;
    }

    function isMovingMetaData(metaData: InventoryMetaData | MovingMetaData | undefined): metaData is MovingMetaData {
        return !!metaData && 'warehouseReceirId' in metaData;
    }

    useEffect(() => {
        if (loadingDocument) return;

        const isSavedOrSent =
            document?.document.props.status === "SAVED" ||
            document?.document.props.status === "SENT";

        const mapInventoryDetails = (details: DocumentsTableRow[], responsibleId: number, responsibleName: string) =>
            details.map((doc) => ({
                id: doc.props.id,
                check: false,
                responsibleId,
                responsibleName,
                nomenclatureId: doc.props.nomenclatureId,
                quantity: doc.props.quantity,
                comment: doc.props.comment || "",
                oldQuantity: isInventoryMetaData(doc.props.metaData)
                    ? doc.props.metaData.oldQuantity
                    : 0,
                deviation: isInventoryMetaData(doc.props.metaData)
                    ? doc.props.metaData.deviation
                    : 0,
            }));

        const mapOtherDetails = (details: DocumentsTableRow[], responsibleId: number, responsibleName: string) =>
            details.map((doc) => ({
                id: doc.props.id,
                check: false,
                responsibleId,
                responsibleName,
                nomenclatureId: doc.props.nomenclatureId,
                quantity: doc.props.quantity,
                comment: doc.props.comment || "",
            }));

        if (isSavedOrSent) {
            const docProps = document.document.props;
            setWarehouseId(docProps.warehouseId);
            setNoOverHead(docProps.name);
            setSelectedDate(
                new Date(docProps.carryingAt).toISOString().split("T")[0]
            );
            setDocId(docProps.id);

            if (documentType === "MOVING") {
                if (isMovingMetaData(document.details[0].props.metaData)) {
                    setWarehouseRecId(document.details[0].props.metaData?.warehouseReceirId);
                }
            }

            const responsibleId = docProps.responsibleId;
            const responsibleName = user.name;

            const tableData =
                documentType === "INVENTORY"
                    ? mapInventoryDetails(document.details, responsibleId, responsibleName)
                    : mapOtherDetails(document.details, responsibleId, responsibleName);

            setTableData(tableData);
        } else {
            setWarehouseId(searchParams.get("warehouseId") || null);
            setNoOverHead(searchParams.get("name") || "");

            const carryingAtParam = searchParams.get("carryingAt") ?? "";
            const validDate = dayjs(carryingAtParam).toDate();
            setSelectedDate(!isNaN(validDate.getTime()) ? validDate.toISOString().split("T")[0] : null);

            const documentIdParam = Number(searchParams.get("documentId"));
            setDocId(documentIdParam);

            const baseRow = {
                id: 1,
                check: false,
                responsibleId: user.id,
                responsibleName: user.name,
                nomenclatureId: 0,
                quantity: 0,
                comment: "",
            };

            const inventoryRow =
                documentType === "INVENTORY"
                    ? { ...baseRow, oldQuantity: 0, deviation: 0 }
                    : baseRow;

            setTableData([inventoryRow]);
        }
    }, [document, documentType, searchParams, loadingDocument, user.id, user.name]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const addProduct = () => {
        setIsModalOpen(true);
    }

    const { trigger: saveDoc, isMutating } = useSWRMutation(['save-document'],
        async (_, { arg }: {
            arg: {
                warehouseId: number;
                responsibleId: number;
                carryingAt: Date;
                details: {
                    nomenclatureId: number;
                    quantity: number;
                    comment?: string;
                }[]
            }
        }) => {
            return saveDocument(arg, docId);
        });

    const { trigger: sendDoc, isMutating: sendingDoc } = useSWRMutation(['send-document'],
        async (_, { arg }: {
            arg: {
                warehouseId: number;
                responsibleId: number;
                carryingAt: Date;
                details: {
                    nomenclatureId: number;
                    quantity: number;
                    comment?: string;
                }[]
            }
        }) => {
            return sendDocument(arg, docId);
        });


    const posType = searchParams.get("posId") || "*";
    const city = searchParams.get("city") || "*";

    const { data: organizationData } = useSWR([`get-org`], () => getOrganization({
        placementId: city
    }));

    const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const { data: nomenclatureData } = useSWR(organizations ? [`get-inventory`] : null, () => getNomenclature(organizations[0].value), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: warehouseData } = useSWR([`get-warehouse`], () => getWarehouses({
        posId: posType,
        placementId: city
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const nomenclatures: { name: string; value: number; }[] = nomenclatureData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const warehouses: { name: string; value: number; }[] = warehouseData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const [tableData, setTableData] = useState<TableRow[]>([]);

    const updateRow = () => {
        setTableData((prevData) => {

            const maxId = prevData.length > 0 ? Math.max(...prevData.map(row => row.id)) : 0;
            const existingNomenclatureIds = new Set(prevData.map(row => row.nomenclatureId));
            const availableNomenclature = nomenclatures.find(nom => !existingNomenclatureIds.has(nom.value));

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
                comment: "",
                ...(documentType === "INVENTORY" && { oldQuantity: 0, deviation: 0 })
            };

            return [...prevData, newRow];
        });
    };

    const deleteRow = () => {
        setTableData((prevData) => prevData.filter((row) => !row.check));
    };

    const sortAscending = () => {
        setTableData(prevData => [...prevData].sort((a, b) => a.id - b.id));
    };

    const sortDescending = () => {
        setTableData(prevData => [...prevData].sort((a, b) => b.id - a.id));
    };

    const handleSubmitAction = async (action: "save" | "send") => {
        const filteredTableData = tableData.filter((data) => data.check === true);

        const detailValues: {
            nomenclatureId: number;
            quantity: number;
            comment?: string;
            metaData?: {
                warehouseReceirId?: number;
                oldQuantity?: number;
                deviation?: number;
            };
        }[] = filteredTableData?.map((data) => {
            const base = {
                nomenclatureId: data.nomenclatureId,
                quantity: Number(data.quantity),
                comment: data.comment,
            };

            if (documentType === "MOVING") {
                return {
                    ...base,
                    metaData: { warehouseReceirId: warehouseRecId },
                };
            }

            if (
                documentType === "INVENTORY" &&
                "oldQuantity" in data &&
                "deviation" in data
            ) {
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
            responsibleId: tableData[0].responsibleId,
            carryingAt: dayjs(
                selectedDate === null
                    ? dayjs().toDate()
                    : selectedDate
            ).toDate(),
            details: detailValues,
        };

        let result;
        if (action === "save") {
            result = await saveDoc(payload);
        } else if (action === "send") {
            result = await sendDoc(payload);
        }

        updateSearchParams(searchParams, setSearchParams, {
            dateEnd: dayjs(
                selectedDate === null
                    ? dayjs().toDate()
                    : selectedDate
            ).toDate(),
        });

        if (result) {
            navigate("/warehouse/documents");
        }
    };

    return (
        <>
            <div>
                <DocumentCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onClick={setTableData} />
                {loadingDocument || validatingDocument ? (
                    <div className="mt-16">
                        <Skeleton.Input style={{ width: "100%", height: "300px" }} active block />
                    </div>
                ) :
                    <div>
                        <div className="flex flex-col sm:flex-row gap-y-4 py-4">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex">
                                    <div className="mr-10 text-text01 font-normal text-sm">
                                        <div>{t("warehouse.no")}</div>
                                        <div>{t("warehouse.overhead")}</div>
                                    </div>
                                    <Input
                                        type={""}
                                        value={noOverhead}
                                        changeValue={(e) => setNoOverHead(e.target.value)}
                                        disabled={true}
                                    />
                                </div>
                                <div className="flex">
                                    <div className="flex mt-3 text-text01 font-normal text-sm mx-2">{t("warehouse.from")}</div>
                                    <DateInput
                                        value={selectedDate ? dayjs(selectedDate) : null}
                                        changeValue={(date) => setSelectedDate(date ? date.format("YYYY-MM-DDTHH:mm") : "")}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col space-y-6">
                                <div className="flex space-x-2">
                                    <div className="flex items-center justify-start sm:justify-center sm:w-64 text-text01 font-normal text-sm">{documentType === "MOVING" ? t("warehouse.warehouseSend") : t("warehouse.ware")}</div>
                                    <DropdownInput
                                        value={warehouseId}
                                        options={warehouses}
                                        label={t("warehouse.enterWare")}
                                        classname="w-48 sm:w-80"
                                        onChange={(value) => setWarehouseId(value)}
                                    />
                                </div>
                                {documentType === "MOVING" && <div className="flex space-x-2">
                                    <div className="flex items-center sm:justify-center sm:w-64 text-text01 font-normal text-sm">{t("warehouse.warehouseRec")}</div>
                                    <DropdownInput
                                        value={warehouseRecId}
                                        options={warehouses}
                                        label={t("warehouse.enterWare")}
                                        classname="w-48 sm:w-80"
                                        onChange={(value) => setWarehouseRecId(value)}
                                    />
                                </div>}
                            </div>
                        </div>
                        <DocumentTypesTable
                            tableData={tableData}
                            setTableData={setTableData}
                            addRow={updateRow}
                            addProduct={addProduct}
                            deleteRow={deleteRow}
                            sortAscending={sortAscending}
                            sortDescending={sortDescending}
                        />
                        <Can
                            requiredPermissions={[
                                { action: "manage", subject: "Warehouse" },
                                { action: "create", subject: "Warehouse" },
                            ]}
                            userPermissions={userPermissions}
                        >
                            {(allowed) => allowed && <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3">
                                <Button
                                    type="outline"
                                    title={t("organizations.cancel")}
                                    handleClick={() => navigate('/warehouse/documents')}
                                />
                                <Button
                                    type="outline"
                                    title={t("warehouse.saveDraft")}
                                    form={true}
                                    isLoading={isMutating}
                                    handleClick={() => handleSubmitAction("save")}
                                />
                                <Button
                                    title={t("warehouse.saveAccept")}
                                    form={true}
                                    isLoading={sendingDoc}
                                    handleClick={() => handleSubmitAction("send")}
                                />
                            </div>}
                        </Can>
                    </div>
                }
            </div>
        </>
    )
}

export default DocumentsCreation;