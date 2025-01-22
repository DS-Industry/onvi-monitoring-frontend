import { useButtonCreate } from "@/components/context/useContext";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Modal from "@/components/ui/Modal/Modal";
import React, { useEffect, useState } from "react";
import Close from "@icons/close.svg?react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDocumentType, useEndDate, usePosType, useSetDocumentType, useSetEndDate, useSetStartDate, useSetWareHouseId, useStartDate, useWareHouseId } from "@/hooks/useAuthStore";
import useSWR from "swr";
import { createDocument, getAllDocuments, getWarehouses } from "@/services/api/warehouse";
import FilterMonitoring from "@/components/ui/Filter/FilterMonitoring";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsAllDocuments } from "@/utils/OverFlowTableData";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import NoDataUI from "@/components/ui/NoDataUI";
import OverheadsEmpty from "@/assets/NoOverhead.png"
import useSWRMutation from "swr/mutation";
import { getWorkers } from "@/services/api/equipment";

type DocumentParams = {
    dateStart: Date;
    dateEnd: Date;
    warehouseId?: number;
}
enum WarehouseDocumentType {
    WRITEOFF = 'WRITEOFF',
    INVENTORY = 'INVENTORY',
    COMMISSIONING = 'COMMISSIONING',
    RECEIPT = 'RECEIPT',
    MOVING = 'MOVING'
}

const Documents: React.FC = () => {
    const { buttonOn, setButtonOn } = useButtonCreate();
    const { t } = useTranslation();
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const [isTableLoading, setIsTableLoading] = useState(false);
    // const isTriggered = useRef(false);

    const wareHouseId = useWareHouseId();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const setWareHouseId = useSetWareHouseId();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const document = useDocumentType();
    const [documentType, setDocumentType] = useState(document);
    const setDocument = useSetDocumentType();
    const navigate = useNavigate();

    const getDocumentType = (document: string) => {
        if (document === "COMMISSIONING")
            return WarehouseDocumentType.COMMISSIONING;
        else if (document === "WRITEOFF")
            return WarehouseDocumentType.WRITEOFF;
        else if (document === "MOVING")
            return WarehouseDocumentType.MOVING;
        else if (document === "INVENTORY")
            return WarehouseDocumentType.INVENTORY
        else
            return WarehouseDocumentType.RECEIPT;
    }

    const posType = usePosType();

    const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: warehouseData } = useSWR([`get-warehouse`], () => getWarehouses(posType), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const workers: { name: string; value: number; }[] = workerData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const warehouses: { name: string; value: number; }[] = warehouseData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const initialFilter = {
        dateStart: new Date(startDate.toString().slice(0, 10) || "2024-01-01"),
        dateEnd: new Date(endDate.toString().slice(0, 10) || `${formattedDate}`),
        warehouseId: wareHouseId || 1
    };

    const [dataFilter, setIsDataFilter] = useState<DocumentParams>(initialFilter);

    const handleDataFilter = (newFilterData: Partial<DocumentParams>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);
        if (newFilterData.warehouseId) setWareHouseId(newFilterData.warehouseId);
        if (newFilterData.dateStart) setStartDate(new Date(newFilterData.dateStart));
        if (newFilterData.dateEnd) setEndDate(new Date(newFilterData.dateEnd));
    };

    const { data: allDocuments, isLoading: documentsLoading, mutate: documentsMutating } = useSWR([`get-all-documents`], () => getAllDocuments({
        dateStart: dataFilter.dateStart,
        dateEnd: dataFilter.dateEnd,
        warehouseId: dataFilter.warehouseId
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    useEffect(() => {
        documentsMutating().then(() => setIsTableLoading(false));
    }, [dataFilter, documentsMutating]);

    useEffect(() => {
        if (!documentsLoading) {
            setIsTableLoading(false);
        }
    }, [documentsLoading]);    

    const data = allDocuments?.map((item) => ({
        ...item,
        warehouseName: warehouses.find((ware) => ware.value === item.warehouseId)?.name || "-",
        responsibleName: workers.find((wor) => wor.value === item.responsibleId)?.name || "-"
    })) || [];

    const documentTypes = [
        { name: t("routes.COMMISSIONING"), value: "COMMISSIONING" },
        { name: t("routes.WRITEOFF"), value: "WRITEOFF" },
        { name: t("routes.MOVING"), value: "MOVING" },
        { name: t("routes.INVENTORY"), value: "INVENTORY" },
        { name: t("routes.RECEIPT"), value: "RECEIPT" },
    ]

    const handleDropdownChange = (value: string) => {
        setDocumentType(value);
        setDocument(value);
    };

    const { trigger: createDoc, isMutating: loadingDocument } = useSWRMutation(
        ['create-document'],
        (_, { arg }: { arg: { type: WarehouseDocumentType } }) => createDocument(arg)
    );

    // useLayoutEffect(() => {
    //     if (!isTriggered.current) {
    //         createDoc();
    //         isTriggered.current = true; // Mark as triggered
    //     }
    // }, []);

    const handleModalSubmit = async () => {
        if (documentType) {
            const documentTypeEnum = getDocumentType(documentType);

            try {
                // Await the creation of the document
                const result = await createDoc({ type: documentTypeEnum });

                // Ensure result has the expected data
                if (result?.props) {
                    const { id, name, carryingAt, warehouseId, status } = result.props;

                    // Navigate with the correct state values
                    navigate("/warehouse/documents/creation", {
                        state: {
                            ownerId: id,
                            name,
                            carryingAt,
                            wareHouseId: warehouseId,
                            status
                        }
                    });
                } else {
                    console.error("Document creation did not return expected data:", result);
                }
            } catch (error) {
                console.error("Error creating document:", error);
            }
        }
    };

    console.log("Data length: ", data.length);

    return (
        <>
            <FilterMonitoring
                count={data.length}
                wareHousesSelect={warehouses}
                handleDataFilter={handleDataFilter}
            />
            {isTableLoading || documentsLoading ? (
                <TableSkeleton columnCount={columnsAllDocuments.length} />
            ) :
                data.length > 0 ?
                    <div className="mt-8">
                        <OverflowTable
                            tableData={data}
                            columns={columnsAllDocuments}
                            isDisplayEdit={true}
                            isStatus={true}
                            nameUrl={'/warehouse/documents/view'}
                        />
                    </div> :
                    <NoDataUI
                        title={t("warehouse.noOverhead")}
                        description={""}
                    >
                        <img src={OverheadsEmpty} className="mx-auto" />
                    </NoDataUI>
            }
            <Modal isOpen={buttonOn} onClose={() => setButtonOn(false)} handleClick={handleModalSubmit} classname="w-96" loading={loadingDocument}>
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