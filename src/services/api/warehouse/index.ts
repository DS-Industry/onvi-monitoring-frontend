import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum WAREHOUSE {
    CREATE_NOMENCLATURE = 'user/warehouse/nomenclature',
    CREATE_NOMENCLATURE_FILE = 'user/warehouse/nomenclature-file',
    CREATE_CATEGORY = 'user/warehouse/category',
    CREATE_SUPPLIER = 'user/warehouse/supplier'
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