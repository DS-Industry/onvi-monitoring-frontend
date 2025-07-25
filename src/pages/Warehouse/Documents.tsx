import { useButtonCreate } from "@/components/context/useContext";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Modal from "@/components/ui/Modal/Modal";
import React, { useCallback, useMemo, useState } from "react";
import Close from "@icons/close.svg?react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCity, useDocumentType, useEndDate, usePosType, useSetCity, useSetDocumentType, useSetEndDate, useSetStartDate, useSetWareHouseId, useStartDate, useWareHouseId } from "@/hooks/useAuthStore";
import useSWR from "swr";
import { createDocument, getAllDocuments, getWarehouses } from "@/services/api/warehouse";
import FilterMonitoring from "@/components/ui/Filter/FilterMonitoring";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsAllDocuments } from "@/utils/OverFlowTableData";
import NoDataUI from "@/components/ui/NoDataUI";
import OverheadsEmpty from "@/assets/NoOverhead.png"
import useSWRMutation from "swr/mutation";
import { getWorkers } from "@/services/api/equipment";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import { useSnackbar } from "@/components/context/useContext";

type DocumentParams = {
    dateStart: Date;
    dateEnd: Date;
    warehouseId: number | string;
    placementId: number | string;
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
    const allCategoriesText = t("warehouse.all");
    // const isTriggered = useRef(false);

    const wareHouseId = useWareHouseId();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const setWareHouseId = useSetWareHouseId();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const city = useCity();
    const document = useDocumentType();
    const [documentType, setDocumentType] = useState(document);
    const setDocument = useSetDocumentType();
    const setCity = useSetCity();
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();

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

    const { data: warehouseData } = useSWR(posType && city ? [`get-warehouse`] : null, () => getWarehouses({
        posId: posType,
        placementId: city
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const workers: { name: string; value: number; }[] = workerData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const warehouses: { name: string; value: number | string; }[] = warehouseData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const warehousesAllObj = {
        name: allCategoriesText,
        value: "*",
    };

    warehouses.unshift(warehousesAllObj);

    const filterParams = useMemo(() => ({
        dateStart: new Date(startDate),
        dateEnd: new Date(endDate),
        warehouseId: wareHouseId,
        placementId: city
    }), [city, endDate, startDate, wareHouseId]);

    const swrKey = useMemo(() =>
        wareHouseId ? `get-all-documents-${filterParams.warehouseId}-${filterParams.placementId}-${filterParams.dateStart}-${filterParams.dateEnd}` : null,
        [filterParams.dateEnd, filterParams.dateStart, filterParams.placementId, filterParams.warehouseId, wareHouseId]
    );

    const handleDataFilter = useCallback((newFilterData: Partial<DocumentParams>) => {
        if (newFilterData.warehouseId) setWareHouseId(newFilterData.warehouseId);
        if (newFilterData.dateStart) setStartDate(new Date(newFilterData.dateStart));
        if (newFilterData.dateEnd) setEndDate(new Date(newFilterData.dateEnd));
        if (newFilterData.placementId) setCity(newFilterData.placementId);
    }, [setCity, setEndDate, setStartDate, setWareHouseId]);

    const { data: allDocuments, isLoading: documentsLoading } = useSWR(swrKey, () => getAllDocuments(filterParams), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const data = allDocuments?.map((item) => ({
        ...item,
        warehouseName: warehouses.find((ware) => ware.value === item.warehouseId)?.name || "-",
        responsibleName: workers.find((wor) => wor.value === item.responsibleId)?.name || "-",
        status: t(`tables.${item.status}`),
        type: t(`routes.${item.type}`)
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
                    const { id, name, carryingAt, status } = result.props;

                    // Navigate with the correct state values
                    navigate("/warehouse/documents/creation", {
                        state: {
                            ownerId: id,
                            name,
                            carryingAt,
                            wareHouseId: wareHouseId,
                            status
                        }
                    });
                } else {
                    console.error("Document creation did not return expected data:", result);
                }
            } catch (error) {
              console.error("Error creating document:", error);
              showSnackbar("Error during form submission", "error");
            }
        }
    };

    return (
        <>
            <FilterMonitoring
                count={data.length}
                wareHousesSelect={warehouses}
                handleDataFilter={handleDataFilter}
                hideSearch={true}
            />
            {documentsLoading ? (
                <TableSkeleton columnCount={columnsAllDocuments.length} />
            ) :
                data.length > 0 ?
                    <div className="mt-8">
                        <DynamicTable
                            data={data}
                            columns={columnsAllDocuments}
                            isDisplayEdit={true}
                            isStatus={true}
                            navigableFields={[{ key: "name", getPath: () => '/warehouse/documents/view' }]}
                        />
                    </div> :
                    <NoDataUI
                        title={t("warehouse.noOverhead")}
                        description={""}
                    >
                        <img src={OverheadsEmpty} className="mx-auto" loading="lazy" alt="Documents" />
                    </NoDataUI>
            }
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