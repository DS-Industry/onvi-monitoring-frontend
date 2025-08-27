import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

enum WAREHOUSE {
  CREATE_NOMENCLATURE = 'user/warehouse/nomenclature',
  CREATE_NOMENCLATURE_FILE = 'user/warehouse/nomenclature-file',
  CREATE_CATEGORY = 'user/warehouse/category',
  CREATE_SUPPLIER = 'user/warehouse/supplier',
  GET_WAREHOUSE_POS = 'user/warehouse/pos',
  CREATE_DOCUMENT = 'user/warehouse/document',
  GET_INVENTORY_ITEM = 'user/warehouse/inventory-item/inventory',
  GET_STOCK_LEVEL = 'user/warehouse/inventory-item',
  CREATE_WAREHOUSE = 'user/warehouse',
}

export enum WarehouseDocumentType {
  WRITEOFF = 'WRITEOFF',
  INVENTORY = 'INVENTORY',
  COMMISSIONING = 'COMMISSIONING',
  RECEIPT = 'RECEIPT',
  MOVING = 'MOVING',
}

export enum WarehouseDocumentStatus {
  CREATED = 'CREATED',
  SAVED = 'SAVED',
  SENT = 'SENT',
}

enum PurposeType {
  SALE = 'SALE',
  INTERNAL_USE = 'INTERNAL_USE',
}

enum NomeclatureStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

type NOMENCLATURE_REQUEST = {
  name: string;
  sku: string;
  organizationId: number;
  categoryId: number;
  supplierId?: number;
  measurement: string;
  metaData: {
    description?: string;
    weight?: number;
    height?: number;
    width?: number;
    length?: number;
    purpose?: PurposeType;
  };
};

type NOMENCLATURE_RESPONSE = {
  props: {
    id: number;
    name: string;
    sku: string;
    organizationId: number;
    categoryId: number;
    supplierId?: number;
    measurement: string;
    image?: string;
    metaData: {
      description?: string;
      weight?: number;
      height?: number;
      width?: number;
      length?: number;
      purpose?: PurposeType;
    };
    status: NomeclatureStatus;
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
  };
};

type NOMENCLATURE_FILE_REQUEST = {
  file: File;
};

type NOMENCLATURE_FILE_RESPONSE = {
  status: string;
};

type NOMENCLATURE_UPDATE_REQUEST = {
  nomenclatureId: number;
  name?: string;
  categoryId?: number;
  supplierId?: number;
  measurement?: string;
  metaData: {
    description?: string;
    weight?: number;
    height?: number;
    width?: number;
    length?: number;
    purpose?: PurposeType;
  };
};

type CATEGORY_REQUEST = {
  name: string;
  description?: string;
  ownerCategoryId?: number;
};

type UPDATE_CATEGORY_REQUEST = {
  name?: string;
  description?: string;
};

type CATEGORY_RESPONSE = {
  props: {
    id: number;
    name: string;
    description?: string;
    ownerCategoryId?: number;
  };
};

type SUPPLIER_REQUEST = {
  name: string;
  contact: string;
};

type SUPPLIER_RESPONSE = {
  props: {
    id: number;
    name: string;
    contact: string;
  };
};

type WAREHOUSE_RESPONSE = {
  props: {
    id: number;
    name: string;
    managerName?: string;
    location: string;
    managerId: number;
    posId: number;
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
  };
};

export type InventoryMetaData = {
  oldQuantity: number;
  deviation: number;
};

export type MovingMetaData = {
  warehouseReceirId: number;
};

export type DocumentBody = {
  warehouseId: number;
  responsibleId: number;
  carryingAt: Date;
  details: {
    nomenclatureId: number;
    quantity: number;
    comment?: string;
    metaData?: InventoryMetaData | MovingMetaData;
  }[];
};

type DOCUMENT_SAVE_RESPONSE = {
  status: string;
};

type DOCUMENT_CREATE_BODY = {
  type: WarehouseDocumentType;
};

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
  };
};

type DOCUMENT_PARAMS = {
  dateStart: Date;
  dateEnd: Date;
  warehouseId?: number;
  placementId?: number;
};

type DOCUMENTS_RESPONSE = {
  id: number;
  name: string;
  type: WarehouseDocumentType;
  warehouseId: number;
  warehouseName: string;
  responsibleId: number;
  responsibleName: string;
  status: WarehouseDocumentStatus;
  carryingAt: Date;
};

type GET_DOCUMENT_RESPONSE = {
  document: {
    props: {
      id: number;
      name: string;
      type: WarehouseDocumentType;
      warehouseId: number;
      responsibleId: number;
      responsibleName: string;
      status: WarehouseDocumentStatus;
      carryingAt: Date;
      createdAt: Date;
      updatedAt: Date;
      createdById: number;
      updatedById: number;
    };
  };
  details: {
    props: {
      id: number;
      warehouseDocumentId: number;
      nomenclatureId: number;
      quantity: number;
      comment?: string;
      metaData?: InventoryMetaData | MovingMetaData;
    };
  }[];
};

export type DocumentsTableRow = GET_DOCUMENT_RESPONSE['details'][number];

type INVENTORY_RESPONSE = {
  nomenclatureId: number;
  nomenclatureName: string;
  quantity: number;
};

type STOCK_PARAMS = {
  categoryId?: number;
  warehouseId?: number;
  placementId?: number;
  page?: number;
  size?: number;
};

type STOCK_RESPONSE = {
  nomenclatureId: number;
  nomenclatureName: string;
  categoryName: string;
  measurement: string;
  sum?: number;
  inventoryItems: {
    warehouseName: string;
    quantity?: number;
  }[];
};

type WAREHOUSE_BODY = {
  name: string;
  location: string;
  managerId: number;
  posId: number;
};

type WarehouseParams = {
  posId?: number;
  placementId?: number;
  page?: number;
  size?: number;
};

type GetSupplierParams = {
  name?: string;
  page?: number;
  size?: number;
};
type NomenclatureParams = {
  page?: number;
  size?: number;
};

export async function createNomenclature(
  body: NOMENCLATURE_REQUEST
): Promise<NOMENCLATURE_RESPONSE> {
  const response: AxiosResponse<NOMENCLATURE_RESPONSE> = await api.post(
    WAREHOUSE.CREATE_NOMENCLATURE,
    body
  );
  return response.data;
}

export async function createNomenclatureFile(
  body: NOMENCLATURE_FILE_REQUEST
): Promise<NOMENCLATURE_FILE_RESPONSE> {
  const formData = new FormData();
  formData.append('file', body.file); // Add the file to FormData
  const response: AxiosResponse<NOMENCLATURE_FILE_RESPONSE> = await api.post(
    WAREHOUSE.CREATE_NOMENCLATURE_FILE,
    formData
  );
  return response.data;
}

export async function updateNomenclature(
  body: NOMENCLATURE_UPDATE_REQUEST
): Promise<NOMENCLATURE_RESPONSE> {
  const response: AxiosResponse<NOMENCLATURE_RESPONSE> = await api.patch(
    WAREHOUSE.CREATE_NOMENCLATURE,
    body
  );
  return response.data;
}

export async function deleteNomenclature(
  id: number
): Promise<NOMENCLATURE_RESPONSE> {
  const response: AxiosResponse<NOMENCLATURE_RESPONSE> = await api.delete(
    WAREHOUSE.CREATE_NOMENCLATURE + `/${id}`
  );
  return response.data;
}

export async function createCategory(
  body: CATEGORY_REQUEST
): Promise<CATEGORY_RESPONSE> {
  const response: AxiosResponse<CATEGORY_RESPONSE> = await api.post(
    WAREHOUSE.CREATE_CATEGORY,
    body
  );
  return response.data;
}

export async function updateCategory(
  body: UPDATE_CATEGORY_REQUEST,
  id: number
): Promise<CATEGORY_RESPONSE> {
  const response: AxiosResponse<CATEGORY_RESPONSE> = await api.patch(
    WAREHOUSE.CREATE_CATEGORY + `/${id}`,
    body
  );
  return response.data;
}

export async function createSupplier(
  body: SUPPLIER_REQUEST
): Promise<SUPPLIER_RESPONSE> {
  const response: AxiosResponse<SUPPLIER_RESPONSE> = await api.post(
    WAREHOUSE.CREATE_SUPPLIER,
    body
  );
  return response.data;
}

export async function getCategory(): Promise<CATEGORY_RESPONSE[]> {
  const response: AxiosResponse<CATEGORY_RESPONSE[]> = await api.get(
    WAREHOUSE.CREATE_CATEGORY
  );
  return response.data;
}

export async function getSupplier(
  params: GetSupplierParams
): Promise<SUPPLIER_RESPONSE[]> {
  const response: AxiosResponse<SUPPLIER_RESPONSE[]> = await api.get(
    WAREHOUSE.CREATE_SUPPLIER,
    { params }
  );
  return response.data;
}

export async function getNomenclature(
  orgId: number,
  params?: NomenclatureParams
): Promise<NOMENCLATURE_RESPONSE[]> {
  const response: AxiosResponse<NOMENCLATURE_RESPONSE[]> = await api.get(
    WAREHOUSE.CREATE_NOMENCLATURE + `/${orgId}`,
    { params }
  );
  return response.data;
}

export async function getWarehouses(
  params: WarehouseParams
): Promise<WAREHOUSE_RESPONSE[]> {
  const response: AxiosResponse<WAREHOUSE_RESPONSE[]> = await api.get(
    WAREHOUSE.CREATE_WAREHOUSE,
    { params }
  );
  return response.data;
}

export async function createDocument(
  body: DOCUMENT_CREATE_BODY
): Promise<DocumentResponse> {
  const response: AxiosResponse<DocumentResponse> = await api.post(
    WAREHOUSE.CREATE_DOCUMENT,
    body
  );
  return response.data;
}

export async function getAllDocuments(
  params: DOCUMENT_PARAMS
): Promise<DOCUMENTS_RESPONSE[]> {
  const response: AxiosResponse<DOCUMENTS_RESPONSE[]> = await api.get(
    WAREHOUSE.CREATE_DOCUMENT + `s`,
    { params }
  );
  return response.data;
}

export async function getInventoryItems(
  warehouseId: number
): Promise<INVENTORY_RESPONSE[]> {
  const response: AxiosResponse<INVENTORY_RESPONSE[]> = await api.get(
    WAREHOUSE.GET_INVENTORY_ITEM + `/${warehouseId}`
  );
  return response.data;
}

export async function saveDocument(
  body: DocumentBody,
  documentId: number
): Promise<DOCUMENT_SAVE_RESPONSE> {
  const response: AxiosResponse<DOCUMENT_SAVE_RESPONSE> = await api.post(
    WAREHOUSE.CREATE_DOCUMENT + `/save/${documentId}`,
    body
  );
  return response.data;
}

export async function sendDocument(
  body: DocumentBody,
  documentId: number
): Promise<DOCUMENT_SAVE_RESPONSE> {
  const response: AxiosResponse<DOCUMENT_SAVE_RESPONSE> = await api.post(
    WAREHOUSE.CREATE_DOCUMENT + `/send/${documentId}`,
    body
  );
  return response.data;
}

export async function getDocument(
  documentId: number
): Promise<GET_DOCUMENT_RESPONSE> {
  const response: AxiosResponse<GET_DOCUMENT_RESPONSE> = await api.get(
    WAREHOUSE.CREATE_DOCUMENT + `/${documentId}`
  );
  return response.data;
}

export async function getAllStockLevels(
  orgId: number,
  params: STOCK_PARAMS
): Promise<STOCK_RESPONSE[]> {
  const response: AxiosResponse<STOCK_RESPONSE[]> = await api.get(
    WAREHOUSE.GET_STOCK_LEVEL + `/${orgId}`,
    { params }
  );
  return response.data;
}

export async function getAllStockLevelsCount(
  orgId: number,
  params: STOCK_PARAMS
): Promise<{ count: number }> {
  const response: AxiosResponse<{ count: number }> = await api.get(
    WAREHOUSE.GET_STOCK_LEVEL + `-count/${orgId}`,
    { params }
  );
  return response.data;
}

export async function createWarehouse(
  body: WAREHOUSE_BODY
): Promise<WAREHOUSE_RESPONSE> {
  const response: AxiosResponse<WAREHOUSE_RESPONSE> = await api.post(
    WAREHOUSE.CREATE_WAREHOUSE,
    body
  );
  return response.data;
}
