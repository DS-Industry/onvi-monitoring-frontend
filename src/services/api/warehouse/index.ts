import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum WAREHOUSE {
    CREATE_NOMENCLATURE = 'user/warehouse/nomenclature',
    CREATE_NOMENCLATURE_FILE = 'user/warehouse/nomenclature-file',
    CREATE_CATEGORY = 'user/warehouse/category',
    CREATE_SUPPLIER = 'user/warehouse/supplier',
    GET_WAREHOUSE_POS = 'user/warehouse/pos',
    CREATE_DOCUMENT = 'user/warehouse/document',
    GET_INVENTORY_ITEM = 'user/warehouse/inventory-item/inventory',
    GET_STOCK_LEVEL = 'user/warehouse/inventory-item'
}

enum WarehouseDocumentType {
    WRITEOFF = 'WRITEOFF',
    INVENTORY = 'INVENTORY',
    COMMISSIONING = 'COMMISSIONING',
    RECEIPT = 'RECEIPT',
    MOVING = 'MOVING'
}

enum WarehouseDocumentStatus {
    CREATED = "CREATED",
    SAVED = "SAVED",
    SENT = "SENT"
}

type NOMENCLATURE_REQUEST = {
    name: string;
    sku: string;
    organizationId: number;
    categoryId: number;
    supplierId?: number;
    measurement: string;
}

type NOMENCLATURE_RESPONSE = {
    props: {
        id: number;
        name: string;
        sku: string;
        organizationId: number;
        categoryId: number;
        supplierId?: number;
        measurement: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        updatedById: number;
    }
}

type NOMENCLATURE_FILE_REQUEST = {
    file: File
}

type NOMENCLATURE_FILE_RESPONSE = {
    status: string;
}

type NOMENCLATURE_UPDATE_REQUEST = {
    nomenclatureId: number;
    name?: string;
    categoryId?: number;
    supplierId?: number;
    measurement?: string;
}

type CATEGORY_REQUEST = {
    name: string;
    description?: string;
    ownerCategoryId?: number;
}

type UPDATE_CATEGORY_REQUEST = {
    name?: string;
    description?: string;
}

type CATEGORY_RESPONSE = {
    props: {
        id: number;
        name: string;
        description?: string;
        ownerCategoryId?: number;
    }
}

type SUPPLIER_REQUEST = {
    name: string;
    contact: string;
}

type SUPPLIER_RESPONSE = {
    props: {
        id: number;
        name: string;
        contact: string;
    }
}

type WAREHOUSE_RESPONSE = {
    props: {
        id: number;
        name: string;
        location: string;
        managerId: number;
        posId: number;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        updatedById: number;
    }
}

type InventoryMetaData = {
    oldQuantity: number;
    deviation: number;
}

type MovingMetaData = {
    warehouseReceirId: number;
}

type DocumentBody = {
    warehouseId: number;
    responsibleId: number;
    carryingAt: Date;
    details: {
        nomenclatureId: number;
        quantity: number;
        comment?: string;
        metaData?: InventoryMetaData | MovingMetaData
    }[]
}

type DOCUMENT_SAVE_RESPONSE = {
    status: string;
}

type DOCUMENT_CREATE_BODY = {
    type: WarehouseDocumentType;
}

type DocumentResponse = {
    props: {
        id: number;
        name: string;
        type: WarehouseDocumentType;
        warehouseId: number;
        responsibleId: number;
        status: WarehouseDocumentStatus;
        carryingAt: Date;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        updatedById: number;
    }
}

type DOCUMENT_PARAMS = {
    dateStart: Date;
    dateEnd: Date;
    warehouseId?: number;
}

type DOCUMENTS_RESPONSE = {
    id: number;
    name: string;
    type: WarehouseDocumentType;
    warehouseId: number;
    responsibleId: number;
    status: WarehouseDocumentStatus;
    carryingAt: Date;

}

type GET_DOCUMENT_RESPONSE = {
    document: {
        props: {
            id: number;
            name: string;
            type: WarehouseDocumentType;
            warehouseId: number;
            responsibleId: number;
            status: WarehouseDocumentStatus;
            carryingAt: Date;
            createdAt: Date;
            updatedAt: Date;
            createdById: number;
            updatedById: number;
        }
    },
    details: {
        props: {
            id: number;
            warehouseDocumentId: number;
            nomenclatureId: number;
            quantity: number;
            comment?: string;
            metaData?: InventoryMetaData | MovingMetaData;
        }
    }[]
}

type INVENTORY_RESPONSE = {
    nomenclatureId: number;
    nomenclatureName: string;
    quantity: number;
}

type STOCK_PARAMS = {
    categoryId?: number;
    warehouseId?: number;
}

type STOCK_RESPONSE = {
    nomenclatureId: number;
    nomenclatureName: string;
    categoryName: string;
    measurement: string;
    sum?: number;
    inventoryItems: {
        warehouseName: string;
        quantity?: number;
    }[]
}

export async function createNomenclature(body: NOMENCLATURE_REQUEST): Promise<NOMENCLATURE_RESPONSE> {
    console.log(body);
    const response: AxiosResponse<NOMENCLATURE_RESPONSE> = await api.post(WAREHOUSE.CREATE_NOMENCLATURE, body);
    console.log(response.data);
    return response.data;
}

export async function createNomenclatureFile(body: NOMENCLATURE_FILE_REQUEST): Promise<NOMENCLATURE_FILE_RESPONSE> {
    console.log(body);
    const formData = new FormData();
    formData.append("file", body.file); // Add the file to FormData
    const response: AxiosResponse<NOMENCLATURE_FILE_RESPONSE> = await api.post(WAREHOUSE.CREATE_NOMENCLATURE_FILE, formData);
    console.log(response.data);
    return response.data;
}

export async function updateNomenclature(body: NOMENCLATURE_UPDATE_REQUEST): Promise<NOMENCLATURE_RESPONSE> {
    console.log(body);
    const response: AxiosResponse<NOMENCLATURE_RESPONSE> = await api.patch(WAREHOUSE.CREATE_NOMENCLATURE, body);
    console.log(response.data);
    return response.data;
}

export async function createCategory(body: CATEGORY_REQUEST): Promise<CATEGORY_RESPONSE> {
    console.log(body);
    const response: AxiosResponse<CATEGORY_RESPONSE> = await api.post(WAREHOUSE.CREATE_CATEGORY, body);
    console.log(response.data);
    return response.data;
}

export async function updateCategory(body: UPDATE_CATEGORY_REQUEST, id: number): Promise<CATEGORY_RESPONSE> {
    console.log(body);
    const response: AxiosResponse<CATEGORY_RESPONSE> = await api.patch(WAREHOUSE.CREATE_CATEGORY + `/${id}`, body);
    console.log(response.data);
    return response.data;
}

export async function createSupplier(body: SUPPLIER_REQUEST): Promise<SUPPLIER_RESPONSE> {
    console.log(body);
    const response: AxiosResponse<SUPPLIER_RESPONSE> = await api.post(WAREHOUSE.CREATE_SUPPLIER, body);
    console.log(response.data);
    return response.data;
}

export async function getCategory(): Promise<CATEGORY_RESPONSE[]> {
    const response: AxiosResponse<CATEGORY_RESPONSE[]> = await api.get(WAREHOUSE.CREATE_CATEGORY);
    console.log(response);
    return response.data;
}

export async function getSupplier(): Promise<SUPPLIER_RESPONSE[]> {
    const response: AxiosResponse<SUPPLIER_RESPONSE[]> = await api.get(WAREHOUSE.CREATE_SUPPLIER);
    console.log(response);
    return response.data;
}

export async function getNomenclature(orgId: number): Promise<NOMENCLATURE_RESPONSE[]> {
    const response: AxiosResponse<NOMENCLATURE_RESPONSE[]> = await api.get(WAREHOUSE.CREATE_NOMENCLATURE + `/${orgId}`);
    console.log(response);
    return response.data;
}

export async function getWarehouses(posId: number): Promise<WAREHOUSE_RESPONSE[]> {
    const response: AxiosResponse<WAREHOUSE_RESPONSE[]> = await api.get(WAREHOUSE.GET_WAREHOUSE_POS + `/${posId}`);
    console.log(response);
    return response.data;
}

export async function createDocument(body: DOCUMENT_CREATE_BODY): Promise<DocumentResponse> {
    console.log(body);
    const response: AxiosResponse<DocumentResponse> = await api.post(WAREHOUSE.CREATE_DOCUMENT, body);
    console.log(response.data);
    return response.data;
}

export async function getAllDocuments(params: DOCUMENT_PARAMS): Promise<DOCUMENTS_RESPONSE[]> {
    const response: AxiosResponse<DOCUMENTS_RESPONSE[]> = await api.get(WAREHOUSE.CREATE_DOCUMENT + `s`, { params });
    console.log(response);
    return response.data;
}

export async function getInventoryItems(warehouseId: number): Promise<INVENTORY_RESPONSE[]> {
    const response: AxiosResponse<INVENTORY_RESPONSE[]> = await api.get(WAREHOUSE.GET_INVENTORY_ITEM + `/${warehouseId}`);
    console.log(response);
    return response.data;
}

export async function saveDocument(body: DocumentBody, documentId: number): Promise<DOCUMENT_SAVE_RESPONSE> {
    console.log(body);
    const response: AxiosResponse<DOCUMENT_SAVE_RESPONSE> = await api.post(WAREHOUSE.CREATE_DOCUMENT + `/save/${documentId}`, body);
    console.log(response.data);
    return response.data;
}

export async function sendDocument(body: DocumentBody, documentId: number): Promise<DOCUMENT_SAVE_RESPONSE> {
    console.log(body);
    const response: AxiosResponse<DOCUMENT_SAVE_RESPONSE> = await api.post(WAREHOUSE.CREATE_DOCUMENT + `/send/${documentId}`, body);
    console.log(response.data);
    return response.data;
}

export async function getDocument(documentId: number): Promise<GET_DOCUMENT_RESPONSE> {
    const response: AxiosResponse<GET_DOCUMENT_RESPONSE> = await api.get(WAREHOUSE.CREATE_DOCUMENT + `/${documentId}`);
    console.log(response);
    return response.data;
}

export async function getAllStockLevels(orgId: number, params: STOCK_PARAMS): Promise<STOCK_RESPONSE[]> {
    const response: AxiosResponse<STOCK_RESPONSE[]> = await api.get(WAREHOUSE.GET_STOCK_LEVEL + `/${orgId}`, { params });
    console.log(response);
    return response.data;
}
