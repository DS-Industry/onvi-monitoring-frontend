import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

enum SALE {
    SALE_PRICE = 'user/sale/price',
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

type SALE_PRICE_RESPONSE = {
    props: {
        id: number;
        nomenclatureId: number;
        warehouseId: number;
        price: number;
    }
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