import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

enum SALE {
    SALE_PRICE = 'user/sale/price',
    SALE_DOCUMENTS = 'user/sale/documents',
    SALE_DOCUMENT = 'user/sale/document',
    SALE_MANAGER = 'user/sale/manager',
}

type SALE_PRICE_CREATE_REQUEST = {
    warehouseId: number;
    nomenclatureId: number;
    price: number;
};

type SALE_PRICE_REQUEST = {
    page?: number
    size?: number
};

type SALE_PRICE_UPDATE_REQUEST = {
    valueData: {
        id: number;
        price: number;
    }[];
};

type SALE_PRICE_DELETE_REQUEST = {
    ids: number[];
};

export type SALE_DOCUMENT_CREATE_REQUEST = {
    warehouseId: number;
    managerId: number;
    saleDate: Date;
    items: {
        nomenclatureId: number;
        quantity: number;
        fullSum: number;
    }[]
};

export type SALE_DOCUMENT_REQUEST = {
    dateStart: Date;
    dateEnd: Date;
    warehouseId?: number;
    page?: number
    size?: number
};

type SALE_PRICE_DELETE_RESPONSE = {
    status: string;
};

export type SALE_PRICE_RESPONSE = {
    id: number;
    nomenclatureId: number;
    nomenclatureName: string;
    warehouseId: number;
    price: number;
};

export type SALE_DOCUMENT_RESPONSE = {
    id: number;
    name: string;
    warehouseId: number;
    warehouseName: string;
    responsibleManagerName: string;
    saleDate: Date;
    details: {
        id: number;
        nomenclatureId: number;
        nomenclatureName: string;
        count: number;
        fullSum: number;
    }[];
};

export type SALE_DOCUMENTS_RESPONSE = {
    id: number;
    name: string;
    warehouseName: string;
    responsibleManagerName: string;
    saleDate: Date;
};

export type SALE_MANAGER_RESPONSE = {
    id: number;
    name: string;
};

export async function postSalePrice(
    body: SALE_PRICE_CREATE_REQUEST,
): Promise<SALE_PRICE_RESPONSE> {
    const response: AxiosResponse<SALE_PRICE_RESPONSE> = await api.post(
        SALE.SALE_PRICE,
        body
    );
    return response.data;
}

export async function getSalePrice(
    warehouseId: number,
    params: SALE_PRICE_REQUEST,
): Promise<SALE_PRICE_RESPONSE[]> {
    const response: AxiosResponse<SALE_PRICE_RESPONSE[]> = await api.get(
        SALE.SALE_PRICE + `/${warehouseId}`,
        { params }
    );
    return response.data;
}

export async function patchSalePrice(
    body: SALE_PRICE_UPDATE_REQUEST,
): Promise<SALE_PRICE_RESPONSE[]> {
    const response: AxiosResponse<SALE_PRICE_RESPONSE[]> = await api.patch(
        SALE.SALE_PRICE,
        body
    );
    return response.data;
}

export async function deleteSalePrices(
    body: SALE_PRICE_DELETE_REQUEST,
): Promise<SALE_PRICE_DELETE_RESPONSE> {
    const response: AxiosResponse<SALE_PRICE_DELETE_RESPONSE> = await api.delete(
        SALE.SALE_PRICE + '/many',
        { data: body }
    );
    return response.data;
}

export async function postSaleDocument(
    body: SALE_DOCUMENT_CREATE_REQUEST,
): Promise<SALE_DOCUMENT_RESPONSE> {
    const response: AxiosResponse<SALE_DOCUMENT_RESPONSE> = await api.post(
        SALE.SALE_DOCUMENT,
        body
    );
    return response.data;
}

export async function getSaleDocument(
    documentId: number,
): Promise<SALE_DOCUMENT_RESPONSE> {
    const response: AxiosResponse<SALE_DOCUMENT_RESPONSE> = await api.get(
        SALE.SALE_DOCUMENT + `/${documentId}`,
    );
    return response.data;
}

export async function getManagers(
    warehouseId: number,
): Promise<SALE_MANAGER_RESPONSE[]> {
    const response: AxiosResponse<SALE_MANAGER_RESPONSE[]> = await api.get(
        SALE.SALE_MANAGER + `/${warehouseId}`,
    );
    return response.data;
}

export async function getSaleDocuments(
    params: SALE_DOCUMENT_REQUEST,
): Promise<SALE_DOCUMENTS_RESPONSE[]> {
    const response: AxiosResponse<SALE_DOCUMENTS_RESPONSE[]> = await api.get(
        SALE.SALE_DOCUMENTS,
        { params }
    );
    return response.data;
}