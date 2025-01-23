import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import SearchInput from "@/components/ui/Input/SearchInput";
import DocumentModal from "@/components/ui/Modal/DocumentModal";
import GoodsTable from "@/components/ui/Table/GoodsTable";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useDocumentType, usePosType, useSetEndDate } from "@/hooks/useAuthStore";
import { getWorkers } from "@/services/api/equipment";
import { getDocument, getInventoryItems, getNomenclature, getWarehouses, saveDocument, sendDocument } from "@/services/api/warehouse";
import { columnsInventoryItems } from "@/utils/OverFlowTableData";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

type InventoryMetaData = {
    oldQuantity: number;
    deviation: number;
}

type MovingMetaData = {
    warehouseReceirId: number;
}

const DocumentsCreation: React.FC = () => {

    const documentType = useDocumentType();
    const { t } = useTranslation();
    const [warehouseId, setWarehouseId] = useState<number | null>(0);
    const [warehouseRecId, setWarehouseRecId] = useState(0);
    const [docId, setDocId] = useState(0);
    const [noOverhead, setNoOverHead] = useState('');
    const [selectedDate, setSelectedDate] = useState<string | null>(() => {
        const today = new Date(); 
        return today.toISOString().split("T")[0]; 
    });
    const navigate = useNavigate();
    const location = useLocation();
    const setEndDate = useSetEndDate();

    const { data: document, isLoading: loadingDocument } = useSWR([`get-document-view`], () => getDocument(location.state.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    function isInventoryMetaData(metaData: InventoryMetaData | MovingMetaData | undefined): metaData is InventoryMetaData {
        return !!metaData && 'oldQuantity' in metaData && 'deviation' in metaData;
    }

    function isMovingMetaData(metaData: InventoryMetaData | MovingMetaData | undefined): metaData is MovingMetaData {
        return !!metaData && 'warehouseReceirId' in metaData;
    }

    useEffect(() => {
        if (!loadingDocument) {
            if (document?.document.props.status === "SAVED" || document?.document.props.status === "SENT") {
                setWarehouseId(document.document.props.warehouseId);
                setNoOverHead(document.document.props.name);
                setSelectedDate(new Date(document.document.props.carryingAt).toISOString().split("T")[0]);
                setDocId(document.document.props.id);
                if (documentType === "MOVING")
                    if (isMovingMetaData(document.details[0].props.metaData))
                        setWarehouseRecId(document.details[0].props.metaData?.warehouseReceirId)
                const tableData = documentType === "INVENTORY"
                    ? document?.details.map((doc) => ({
                        id: doc.props.id,
                        check: false, // Add the 'check' property
                        responsibleId: document.document.props.responsibleId,
                        nomenclatureId: doc.props.nomenclatureId,
                        quantity: doc.props.quantity,
                        comment: doc.props.comment || "",
                        oldQuantity: isInventoryMetaData(doc.props.metaData) ? doc.props.metaData.oldQuantity : 0,
                        deviation: isInventoryMetaData(doc.props.metaData) ? doc.props.metaData.deviation : 0
                    }))
                    : document?.details.map((doc) => ({
                        id: doc.props.id,
                        check: false, // Add the 'check' property
                        responsibleId: document.document.props.responsibleId,
                        nomenclatureId: doc.props.nomenclatureId,
                        quantity: doc.props.quantity,
                        comment: doc.props.comment || ""
                    }));
                setTableData(tableData);
            } else {
                setWarehouseId(location?.state?.warehouseId || null);
                setNoOverHead(location?.state?.name || '');
                const validDate = new Date(location?.state?.carryingAt ?? '');
                setSelectedDate(!isNaN(validDate.getTime()) ? validDate.toISOString().split("T")[0] : null);
                setDocId(location?.state.ownerId);

                const tableData = documentType === "INVENTORY"
                    ? [{
                        id: location?.state.ownerId,
                        check: false, // Add the 'check' property
                        responsibleId: 0,
                        nomenclatureId: 0,
                        quantity: 0,
                        comment: "",
                        oldQuantity: 0,
                        deviation: 0
                    }]
                    : [{
                        id: location?.state.ownerId,
                        check: false, // Add the 'check' property
                        responsibleId: 0,
                        nomenclatureId: 0,
                        quantity: 0,
                        comment: ""
                    }];
                setTableData(tableData);
            }
        }
    }, [document, documentType, location?.state?.carryingAt, location?.state.ownerId, location?.state?.name, location?.state?.warehouseId, loadingDocument]);


    const [errors, setErrors] = useState({
        warehouse: false,
        responsible: false,
        nomenclature: false,
        quantity: false,
        warehouseRec: false
    });
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

    const mockData = documentType === "INVENTORY" ? [
        { id: 1, check: false, responsibleId: 0, nomenclatureId: 0, quantity: 0, comment: "", oldQuantity: 0, deviation: 0 }
    ] : [
        { id: 1, check: false, responsibleId: 0, nomenclatureId: 0, quantity: 0, comment: "" }
    ]

    const posType = usePosType();

    const [tableData, setTableData] = useState(mockData);

    const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: nomenclatureData } = useSWR([`get-inventory`], () => getNomenclature(1), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: warehouseData } = useSWR([`get-warehouse`], () => getWarehouses(posType), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: inventoryItemData } = useSWR(warehouseData ? [`get-inventory-items`] : null, () => getInventoryItems(warehouseData ? warehouseData[0].props.id : 1), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const workers: { name: string; value: number; }[] = workerData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const nomenclatures: { name: string; value: number; }[] = nomenclatureData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const warehouses: { name: string; value: number; }[] = warehouseData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const nomenclatureItems: { nomenclatureId: number; nomenclatureName: string; }[] = nomenclatureData?.map((item) => ({ nomenclatureId: item.props.id, nomenclatureName: item.props.name })) || [];

    const handleTableChange = (id: number, key: string, value: string | number) => {
        setTableData((prevData) =>
            prevData?.map((item) =>
                item.id === id ? { ...item, [key]: value } : item
            )
        );
    };

    const updateRow = () => {
        if (documentType === "INVENTORY")
            setTableData((prevData) => [
                ...prevData,
                {
                    id: prevData.length + 1,
                    check: false,
                    responsibleId: 0,
                    nomenclatureId: 0,
                    quantity: 0,
                    comment: "",
                    oldQuantity: 0,
                    deviation: 0
                },
            ]);
        else
            setTableData((prevData) => [
                ...prevData,
                {
                    id: prevData.length + 1,
                    check: false,
                    responsibleId: 0,
                    nomenclatureId: 0,
                    quantity: 0,
                    comment: "",
                },
            ]);
    };

    const handleSubmit = async () => {
        console.log("Final document creation values: ", tableData);
        if (warehouseId === 0) {
            setErrors((prev) => ({
                ...prev,
                warehouse: true
            }));
        }

        tableData?.map((data) => {
            if (data.responsibleId === 0)
                setErrors((prev) => ({
                    ...prev,
                    responsible: true
                }));
            if (data.nomenclatureId === 0)
                setErrors((prev) => ({
                    ...prev,
                    nomenclature: true
                }));
            if (data.quantity <= 0)
                setErrors((prev) => ({
                    ...prev,
                    quantity: true
                }));
        });

        if (documentType === "MOVING" && warehouseId === warehouseRecId) {
            setErrors((prev) => ({
                ...prev,
                warehouseRec: true,
                warehouse: true
            }));
        }

        const detailsValues: {
            nomenclatureId: number;
            responsibleId: number;
            quantity: number;
            comment?: string;
        }[] = tableData?.map((data) => ({
            nomenclatureId: data.nomenclatureId,
            responsibleId: data.responsibleId,
            quantity: Number(data.quantity),
            comment: data.comment
        })) || [];

        const detailValues: {
            nomenclatureId: number;
            quantity: number;
            comment?: string;
            metaData?: {
                warehouseReceirId?: number;
                oldQuantity?: number;
                deviation?: number;
            };
        }[] = tableData?.map((data) => {
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

            if (documentType === "INVENTORY" && "oldQuantity" in data && "deviation" in data) {
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


        console.log("Payload for details: ", detailsValues, detailValues);

        const result = await saveDoc({
            warehouseId: warehouseId == null ? 0 : warehouseId,
            responsibleId: tableData[0].responsibleId,
            carryingAt: new Date(selectedDate === null ? new Date().toISOString().split("T")[0] : selectedDate),
            details: detailValues
        })

        setEndDate(new Date(selectedDate === null ? new Date().toISOString().split("T")[0] : selectedDate));

        if (result) {
            console.log(result);
            navigate('/warehouse/documents');
        }
    }

    const handleSubmitSend = async () => {
        console.log("Final document creation values: ", tableData);
        if (warehouseId === 0) {
            setErrors((prev) => ({
                ...prev,
                warehouse: true
            }));
        }

        tableData?.map((data) => {
            if (data.responsibleId === 0)
                setErrors((prev) => ({
                    ...prev,
                    responsible: true
                }));
            if (data.nomenclatureId === 0)
                setErrors((prev) => ({
                    ...prev,
                    nomenclature: true
                }));
            if (data.quantity <= 0)
                setErrors((prev) => ({
                    ...prev,
                    quantity: true
                }));
        });

        if (documentType === "MOVING" && warehouseId === warehouseRecId) {
            setErrors((prev) => ({
                ...prev,
                warehouseRec: true,
                warehouse: true
            }));
        }

        const detailsValues: {
            nomenclatureId: number;
            responsibleId: number;
            quantity: number;
            comment?: string;
        }[] = tableData?.map((data) => ({
            nomenclatureId: data.nomenclatureId,
            responsibleId: data.responsibleId,
            quantity: Number(data.quantity),
            comment: data.comment
        })) || [];

        const detailValues: {
            nomenclatureId: number;
            quantity: number;
            comment?: string;
            metaData?: {
                warehouseReceirId?: number;
                oldQuantity?: number;
                deviation?: number;
            };
        }[] = tableData?.map((data) => {
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

            if (documentType === "INVENTORY" && "oldQuantity" in data && "deviation" in data) {
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


        console.log("Payload for details: ", detailsValues, detailValues);

        const result = await sendDoc({
            warehouseId: warehouseId == null ? 0 : warehouseId,
            responsibleId: tableData[0].responsibleId,
            carryingAt: new Date(selectedDate === null ? new Date().toISOString().split("T")[0] : selectedDate),
            details: detailValues
        })

        setEndDate(new Date(selectedDate === null ? new Date().toISOString().split("T")[0] : selectedDate));

        if (result) {
            console.log(result);
            navigate('/warehouse/documents');
        }
    }

    const columnsDocumentCreation = documentType === "INVENTORY" ? [
        {
            label: "",
            key: "check",
            render: (row: { check: boolean | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: boolean) => void) => (
                <input
                    type="checkbox"
                    checked={row.check}
                    className="w-[18px] h-[18px]"
                    onChange={() =>
                        handleChange(row.id, "check", !row.check)
                    }
                />
            ),
        },
        {
            label: "№",
            key: "id"
        },
        {
            label: "Ответственный",
            key: "responsibleId",
            render: (row: { responsibleId: number | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                <DropdownInput
                    value={row.responsibleId}
                    onChange={(value) => handleChange(row.id, "responsibleId", value)}
                    options={workers}
                    error={errors.responsible}
                />
            ),
        },
        {
            label: "Номенклатура",
            key: "nomenclatureId",
            render: (row: { nomenclatureId: number | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                <DropdownInput
                    value={row.nomenclatureId}
                    onChange={(value) => handleChange(row.id, "nomenclatureId", value)}
                    options={nomenclatures}
                    error={errors.nomenclature}
                />
            ),
        },
        {
            label: "Кол-во",
            key: "quantity",
            render: (row: { quantity: number | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                <Input
                    type="number"
                    value={row.quantity}
                    changeValue={(e) => handleChange(row.id, "quantity", e.target.value)}
                    error={errors.quantity}
                />
            ),
        },
        {
            label: "Комментарий",
            key: "comment",
            render: (row: { comment: string | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                <MultilineInput
                    value={row.comment}
                    rows={1}
                    changeValue={(e) => handleChange(row.id, "comment", e.target.value)}
                />
            ),
        },
        {
            label: "Кол-во учет",
            key: "oldQuantity",
            render: (row: { oldQuantity: number | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                <Input
                    type="number"
                    value={row.oldQuantity}
                    changeValue={(e) => handleChange(row.id, "oldQuantity", e.target.value)}
                />
            ),
        },
        {
            label: "Отклонение",
            key: "deviation",
            render: (row: { deviation: number | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                <Input
                    type="number"
                    value={row.deviation}
                    changeValue={(e) => handleChange(row.id, "deviation", e.target.value)}
                />
            ),
        }
    ] : [
        {
            label: "",
            key: "check",
            render: (row: { check: boolean | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: boolean) => void) => (
                <input
                    type="checkbox"
                    checked={row.check}
                    className="w-[18px] h-[18px]"
                    onChange={() =>
                        handleChange(row.id, "check", !row.check)
                    }
                />
            ),
        },
        {
            label: "№",
            key: "id"
        },
        {
            label: "Ответственный",
            key: "responsibleId",
            render: (row: { responsibleId: number | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                <DropdownInput
                    value={row.responsibleId}
                    onChange={(value) => handleChange(row.id, "responsibleId", value)}
                    options={workers}
                    error={errors.responsible}
                />
            ),
        },
        {
            label: "Номенклатура",
            key: "nomenclatureId",
            render: (row: { nomenclatureId: number | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                <DropdownInput
                    value={row.nomenclatureId}
                    onChange={(value) => handleChange(row.id, "nomenclatureId", value)}
                    options={nomenclatures}
                    error={errors.nomenclature}
                />
            ),
        },
        {
            label: "Кол-во",
            key: "quantity",
            render: (row: { quantity: number | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                <Input
                    type="number"
                    value={row.quantity}
                    changeValue={(e) => handleChange(row.id, "quantity", e.target.value)}
                    error={errors.quantity}
                />
            ),
        },
        {
            label: "Комментарий",
            key: "comment",
            render: (row: { comment: string | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                <MultilineInput
                    value={row.comment}
                    rows={1}
                    changeValue={(e) => handleChange(row.id, "comment", e.target.value)}
                />
            ),
        }
    ]

    return (
        <>
            <div>
                <DocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <div className="w-[1000px] h-full flex">
                        <div className="w-1/3">
                            <SearchInput
                                value={""}
                                onChange={() => { }}
                                classname="w-64"
                                searchType="outlined"
                            />
                        </div>
                        <div className="w-2/3">
                            {documentType === "RECEIPT" ?
                                <div className="mt-8">
                                    <OverflowTable
                                        tableData={nomenclatureItems}
                                        columns={columnsInventoryItems}
                                    />
                                </div> :
                                <div className="mt-8">
                                    <OverflowTable
                                        tableData={inventoryItemData}
                                        columns={columnsInventoryItems}
                                    />
                                </div>}
                        </div>
                    </div>
                </DocumentModal>
                {loadingDocument ?
                    <TableSkeleton columnCount={10} /> :
                    <div>
                        <div className="flex p-4 justify-between">
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
                                <div className="flex mt-3 text-text01 font-normal text-sm mx-2">{t("warehouse.from")}</div>
                                <Input
                                    type={"date"}
                                    value={selectedDate}
                                    changeValue={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col space-y-6">
                                <div className="flex">
                                    <div className="flex items-center justify-center w-64 text-text01 font-normal text-sm">{documentType === "MOVING" ? t("warehouse.warehouseSend") : t("warehouse.ware")}</div>
                                    <DropdownInput
                                        value={warehouseId}
                                        options={warehouses}
                                        label={t("warehouse.enterWare")}
                                        classname="w-80"
                                        onChange={(value) => setWarehouseId(value)}
                                        error={errors.warehouse}
                                    />
                                </div>
                                {documentType === "MOVING" && <div className="flex">
                                    <div className="flex items-center justify-center w-64 text-text01 font-normal text-sm">{t("warehouse.warehouseRec")}</div>
                                    <DropdownInput
                                        value={warehouseRecId}
                                        options={warehouses}
                                        label={t("warehouse.enterWare")}
                                        classname="w-80"
                                        onChange={(value) => setWarehouseRecId(value)}
                                        error={errors.warehouseRec}
                                    />
                                </div>}
                            </div>
                        </div>
                        <GoodsTable
                            tableData={tableData}
                            columns={columnsDocumentCreation}
                            handleChange={handleTableChange}
                            addRow={updateRow}
                            addProduct={addProduct}
                        />
                        <div className="flex space-x-3">
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
                                handleClick={handleSubmit}
                            />
                            <Button
                                title={t("warehouse.saveAccept")}
                                form={true}
                                isLoading={sendingDoc}
                                handleClick={handleSubmitSend}
                            />
                        </div>
                    </div>
                }
            </div>
        </>
    )
}

export default DocumentsCreation;