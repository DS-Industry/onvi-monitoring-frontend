import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import SearchInput from "@/components/ui/Input/SearchInput";
import DocumentModal from "@/components/ui/Modal/DocumentModal";
import NoDataUI from "@/components/ui/NoDataUI";
// import GoodsTable from "@/components/ui/Table/GoodsTable";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { useCity, useDocumentType, usePosType, useSetEndDate } from "@/hooks/useAuthStore";
import { useUser } from "@/hooks/useUserStore";
import { getOrganization } from "@/services/api/organization";
import { getDocument, getInventoryItems, getNomenclature, getWarehouses, saveDocument, sendDocument } from "@/services/api/warehouse";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import InventoryEmpty from "@/assets/NoInventory.png"
import GoodsAntTable from "@/components/ui/Table/GoodsAntTable";
import { Select, Skeleton } from "antd";

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
    const location = useLocation();
    const warehouseID = location.state.wareHouseId;
    const [warehouseId, setWarehouseId] = useState<number | string | null>(warehouseID);
    const [warehouseRecId, setWarehouseRecId] = useState(0);
    const [docId, setDocId] = useState(0);
    const [noOverhead, setNoOverHead] = useState('');
    const [selectedDate, setSelectedDate] = useState<string | null>(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });
    const navigate = useNavigate();
    const setEndDate = useSetEndDate();
    const user = useUser();
    const [searchNomen, setSearchNomen] = useState("");

    const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});

    const handleCheckboxChange = (id: number) => {
        setSelectedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const { data: document, isLoading: loadingDocument, isValidating: validatingDocument } = useSWR([`get-document-view`], () => getDocument(location.state.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

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
                        responsibleName: user.name,
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
                        responsibleName: user.name,
                        nomenclatureId: doc.props.nomenclatureId,
                        quantity: doc.props.quantity,
                        comment: doc.props.comment || ""
                    }));
                setTableData(tableData);
            } else {
                setWarehouseId(location?.state?.wareHouseId || null);
                setNoOverHead(location?.state?.name || '');
                const validDate = new Date(location?.state?.carryingAt ?? '');
                setSelectedDate(!isNaN(validDate.getTime()) ? validDate.toISOString().split("T")[0] : null);
                setDocId(location?.state.ownerId);

                const tableData = documentType === "INVENTORY"
                    ? [{
                        id: location?.state.ownerId,
                        check: false, // Add the 'check' property
                        responsibleId: user.id,
                        responsibleName: user.name,
                        nomenclatureId: 0,
                        quantity: 0,
                        comment: "",
                        oldQuantity: 0,
                        deviation: 0
                    }]
                    : [{
                        id: location?.state.ownerId,
                        check: false, // Add the 'check' property
                        responsibleId: user.id,
                        responsibleName: user.name,
                        nomenclatureId: 0,
                        quantity: 0,
                        comment: ""
                    }];
                setTableData(tableData);
            }
        }
    }, [document, documentType, location?.state?.carryingAt, location?.state.ownerId, location?.state?.name, location?.state?.wareHouseId, loadingDocument, user.id, user.name]);


    const [globalErrors, setGlobalErrors] = useState({
        warehouse: false,
        warehouseRec: false,
    });

    const [errors, setErrors] = useState<Record<number, { nomenclature: boolean; quantity: boolean }>>({});

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


    const posType = usePosType();
    const city = useCity();

    const { data: organizationData } = useSWR([`get-org`], () => getOrganization({
        placementId: city
    }));

    const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const { data: nomenclatureData } = useSWR(organizations ? [`get-inventory`] : null, () => getNomenclature(organizations[0].value), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: warehouseData } = useSWR([`get-warehouse`], () => getWarehouses({
        posId: posType,
        placementId: city
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: inventoryItemData } = useSWR(warehouseId !== null && warehouseID !== "*" ? [`get-inventory-items`] : null, () => getInventoryItems(Number(warehouseId)), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const nomenclatures: { name: string; value: number; }[] = nomenclatureData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const warehouses: { name: string; value: number; }[] = warehouseData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const nomenclatureItems: { nomenclatureId: number; nomenclatureName: string; sku: string; }[] = nomenclatureData?.map((item) => ({ nomenclatureId: item.props.id, nomenclatureName: item.props.name, sku: item.props.sku })).filter((item) => item.nomenclatureName.toLowerCase().includes(searchNomen.toLowerCase())) || [];

    const inventoryItems: { nomenclatureId: number; nomenclatureName: string; sku: number; }[] = inventoryItemData?.map((item) => ({ nomenclatureId: item.nomenclatureId, nomenclatureName: item.nomenclatureName, sku: item.quantity })).filter((item) => item.nomenclatureName.toLowerCase().includes(searchNomen.toLowerCase())) || [];

    const oldQuantityItems: { nomenclatureId: number; quantity: number; }[] = inventoryItemData?.map((item) => ({ nomenclatureId: item.nomenclatureId, quantity: item.quantity })) || [];

    const firstNomenclature = nomenclatures.length > 0 ? nomenclatures[0].value : 0;

    const mockData = documentType === "INVENTORY" ? [
        { id: 1, check: false, responsibleId: user.id, responsibleName: user.name, nomenclatureId: firstNomenclature, quantity: 0, comment: "", oldQuantity: 0, deviation: 0 }
    ] : [
        { id: 1, check: false, responsibleId: user.id, responsibleName: user.name, nomenclatureId: firstNomenclature, quantity: 0, comment: "" }
    ];

    const [tableData, setTableData] = useState(mockData);

    const handleTableChange = (id: number, key: string, value: string | number) => {
        setTableData((prevData) =>
            prevData?.map((item) => {
                if (item.id === id) {
                    if ('oldQuantity' in item && 'deviation' in item) {
                        return {
                            ...item,
                            [key]: value,
                            oldQuantity: oldQuantityItems.find((q) => q.nomenclatureId === item.nomenclatureId)?.quantity,
                            deviation:
                                key === "quantity" || key === "oldQuantity"
                                    ? (key === "quantity" ? Number(value) : item.quantity) -
                                    (key === "oldQuantity" ? Number(value) : item.oldQuantity)
                                    : item.deviation
                        };
                    }
                    return { ...item, [key]: value };
                }
                return item;
            })
        );
    };

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

    const handleSubmit = async () => {
        console.log("Final document creation values: ", tableData);

        let hasErrors = false;

        const newErrors: Record<number, { nomenclature: boolean; quantity: boolean }> = {};
        tableData.forEach((data) => {
            newErrors[data.id] = { nomenclature: false, quantity: false };
        });

        const newGlobalErrors = { warehouse: false, warehouseRec: false };

        if (warehouseId === 0 || warehouseId === "*") {
            newGlobalErrors.warehouse = true;
            hasErrors = true;
        }

        if (documentType === "MOVING" && warehouseId === warehouseRecId) {
            newGlobalErrors.warehouseRec = true;
            newGlobalErrors.warehouse = true;
            hasErrors = true;
        }

        tableData?.map((data) => {
            if (data.nomenclatureId === 0) {
                newErrors[data.id].nomenclature = true;
                hasErrors = true;
            }
            if (data.quantity <= 0) {
                newErrors[data.id].quantity = true;
                hasErrors = true;
            }
        });

        if (documentType === "MOVING" && warehouseId === warehouseRecId) {
            setGlobalErrors((prev) => ({
                ...prev,
                warehouseRec: true,
                warehouse: true
            }));
            hasErrors = true;
        }

        setErrors(newErrors);
        setGlobalErrors(newGlobalErrors);

        if (hasErrors) {
            return;
        }

        const filteredTableData = tableData.filter((data) => data.check === true);

        const detailsValues: {
            nomenclatureId: number;
            responsibleId: number;
            quantity: number;
            comment?: string;
        }[] = filteredTableData?.map((data) => ({
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
            warehouseId: warehouseId == null ? 0 : Number(warehouseId),
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

        const newErrors: { nomenclature: boolean; quantity: boolean }[] = tableData.map(() => ({
            nomenclature: false,
            quantity: false
        }));

        let hasErrors = false;

        if (warehouseId === 0 || warehouseId === "*") {
            setGlobalErrors((prev) => ({
                ...prev,
                warehouse: true
            }));
            hasErrors = true;
        }

        tableData?.map((data) => {
            if (data.nomenclatureId === 0) {
                newErrors[data.id].nomenclature = true;
                hasErrors = true;
            }
            if (data.quantity <= 0) {
                newErrors[data.id].quantity = true;
                hasErrors = true;
            }
        });

        if (documentType === "MOVING" && warehouseId === warehouseRecId) {
            setGlobalErrors((prev) => ({
                ...prev,
                warehouseRec: true,
                warehouse: true
            }));
            hasErrors = true;
        }

        setErrors(newErrors);

        if (hasErrors) {
            return;
        }

        const filteredTableData = tableData.filter((data) => data.check === true);

        const detailsValues: {
            nomenclatureId: number;
            responsibleId: number;
            quantity: number;
            comment?: string;
        }[] = filteredTableData?.map((data) => ({
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
            warehouseId: warehouseId == null ? 0 : Number(warehouseId),
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
            key: "responsibleName"
        },
        {
            label: "Номенклатура",
            key: "nomenclatureId",
            render: (row: { nomenclatureId: number | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                // <DropdownInput
                //     value={row.nomenclatureId}
                //     label={nomenclatures.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                //     onChange={(value) => handleChange(row.id, "nomenclatureId", value)}
                //     options={nomenclatures}
                //     error={errors[row.id]?.nomenclature || false}
                //     classnameOptions="max-h-20"
                // />
                <Select
                    status={errors[row.id]?.nomenclature ? 'error' : ''}
                    value={row.nomenclatureId}
                    placeholder={nomenclatures.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                    onChange={(value) => handleChange(row.id, "nomenclatureId", value)}
                    options={[
                        { label: t("warehouse.notSel"), value: 0 },
                        ...nomenclatures.map((nom) => ({ label: nom.name, value: nom.value }))
                    ]}
                    className="w-80"
                    listHeight={160}
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
                    error={errors[row.id]?.quantity || false}
                />
            ),
        },
        {
            label: "Комментарий",
            key: "comment",
            render: (row: { comment: string | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                <Input
                    value={row.comment}
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
                    disabled={true}
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
                    disabled={true}
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
            key: "responsibleName"
        },
        {
            label: "Номенклатура",
            key: "nomenclatureId",
            render: (row: { nomenclatureId: number | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                // <DropdownInput
                //     value={row.nomenclatureId}
                //     label={nomenclatures.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                //     onChange={(value) => handleChange(row.id, "nomenclatureId", value)}
                //     options={nomenclatures}
                //     error={errors[row.id]?.nomenclature || false}
                //     classnameOptions="max-h-20"
                // />
                <Select
                    status={errors[row.id]?.nomenclature ? 'error' : ''}
                    value={row.nomenclatureId}
                    placeholder={nomenclatures.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                    onChange={(value) => handleChange(row.id, "nomenclatureId", value)}
                    options={[
                        { label: t("warehouse.notSel"), value: 0 },
                        ...nomenclatures.map((nom) => ({ label: nom.name, value: nom.value }))
                    ]}
                    className="w-80"
                    listHeight={160}
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
                    error={errors[row.id]?.quantity || false}
                />
            ),
        },
        {
            label: "Комментарий",
            key: "comment",
            render: (row: { comment: string | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: number) => void) => (
                <Input
                    value={row.comment}
                    changeValue={(e) => handleChange(row.id, "comment", e.target.value)}
                />
            ),
        }
    ]

    const columnsInventoryItems = [
        {
            label: "",
            key: "check",
            render: (row: { nomenclatureId: number; }) => (
                <input
                    type="checkbox"
                    checked={!!selectedItems[row.nomenclatureId]}  // Use selectedItems state
                    className="w-[18px] h-[18px]"
                    onChange={() => handleCheckboxChange(row.nomenclatureId)}
                />
            ),
        },
        {
            label: "Код",
            key: "sku"
        },
        {
            label: "Наименование товара",
            key: "nomenclatureName"
        }
    ]

    const addProductItem = () => {
        console.log("Add product Item.");

        const dataSource = documentType === "RECEIPT" ? nomenclatureItems : inventoryItems;

        if (!dataSource || !selectedItems) {
            return;
        }

        setTableData(prevData => {
            const existingNomenclatureIds = new Set(prevData.map(item => item.nomenclatureId));

            const selectedData = dataSource
                .filter(item => selectedItems?.[item.nomenclatureId] && !existingNomenclatureIds.has(item.nomenclatureId))
                .map(item => ({
                    id: item.nomenclatureId,
                    check: true,
                    responsibleId: user.id,
                    responsibleName: user.name,
                    nomenclatureId: item.nomenclatureId,
                    quantity: 0,
                    comment: "",
                    ...(documentType === "INVENTORY" && { oldQuantity: 0, deviation: 0 })
                }));

            if (selectedData.length === 0) {
                return prevData;
            }

            return [...prevData, ...selectedData];
        });

        setIsModalOpen(false);
    };

    return (
        <>
            <div>
                <DocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} handleClick={addProductItem}>
                    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-3xl xl:max-w-4xl h-full max-h-[90vh] overflow-y-auto flex flex-col space-y-5 p-4">
                        {/* Search Input */}
                        <div className="flex">
                            <SearchInput
                                value={searchNomen}
                                onChange={(value) => setSearchNomen(value)}
                                classname="w-full sm:w-64"
                                searchType="outlined"
                            />
                        </div>

                        {/* Table Content */}
                        <div className="mt-4 overflow-x-auto">
                            {documentType === "RECEIPT" ? (
                                nomenclatureItems.length > 0 ? (<OverflowTable
                                    tableData={nomenclatureItems}
                                    columns={columnsInventoryItems}
                                />) : (
                                    <div className="flex flex-col justify-center items-center">
                                        <NoDataUI
                                            title={t("roles.invent")}
                                            description={""}
                                        >
                                            <img src={InventoryEmpty} className="mx-auto" loading="lazy" />
                                        </NoDataUI>
                                    </div>)
                            ) : (
                                inventoryItems.length > 0 ? (
                                    <OverflowTable
                                        tableData={inventoryItems}
                                        columns={columnsInventoryItems}
                                    />) : (
                                    <div className="flex flex-col justify-center items-center">
                                        <NoDataUI
                                            title={t("roles.invent")}
                                            description={""}
                                        >
                                            <img src={InventoryEmpty} className="mx-auto" loading="lazy" />
                                        </NoDataUI>
                                    </div>)
                            )}
                        </div>
                    </div>
                </DocumentModal>

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
                                    <Input
                                        type={"date"}
                                        value={selectedDate}
                                        changeValue={(e) => setSelectedDate(e.target.value)}
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
                                        error={globalErrors.warehouse}
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
                                        error={globalErrors.warehouseRec}
                                    />
                                </div>}
                            </div>
                        </div>
                        <GoodsAntTable
                            tableData={tableData}
                            columns={columnsDocumentCreation}
                            handleChange={handleTableChange}
                            addRow={updateRow}
                            addProduct={addProduct}
                            deleteRow={deleteRow}
                            sortAscending={sortAscending}
                            sortDescending={sortDescending}
                        />
                        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3">
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