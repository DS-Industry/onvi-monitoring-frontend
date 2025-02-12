import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum FINANCE {
    POST_CASH_COLLECTION = 'user/finance/cash-collection',
    TIME_STAMP = 'user/finance/time-stamp'
}

type CollectionBody = {
    cashCollectionDate: Date;
    posId: number;
}

type CollectionResponse = {
    id: number;
    cashCollectionDate: Date;
    oldCashCollectionDate: Date;
    status: string;
    sumFact: number;
    virtualSum: number;
    sumCard: number;
    shortage: number;
    countCar: number;
    countCarCard: number;
    averageCheck: number;
    cashCollectionDeviceType: {
        id: number;
        typeName: string;
        sumCoinDeviceType: number;
        sumPaperDeviceType: number;
        sumFactDeviceType: number;
        shortageDeviceType: number;
        virtualSumDeviceType: number;
    }[];
    cashCollectionDevice: {
        id: number;
        deviceId: number;
        deviceName: string;
        deviceType: string;
        oldTookMoneyTime: Date;
        tookMoneyTime: Date;
        sumDevice: number;
        sumCoinDevice: number;
        sumPaperDevice: number;
        virtualSumDevice: number;
    }[]
}

type RecalculateCollectionBody = {
    cashCollectionDeviceData: {
        cashCollectionDeviceId: number;
        tookMoneyTime: Date;
    }[]
    cashCollectionDeviceTypeData: {
        cashCollectionDeviceTypeId: number;
        sumCoin?: number;
        sumPaper?: number;
    }[]
}

type ReturnCollectionResponse = {
    status: string
}

type CashCollectionParams = {
    dateStart: Date;
    dateEnd: Date;
    page?: number;
    size?: number;
}

type CashCollectionsResponse = {
    cashCollectionsData: {
        id: number;
        posId: number;
        period: string;
        sumFact: number;
        sumCard: number;
        sumVirtual: number;
        profit: number;
        status: string;
        shortage: number;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        updatedById: number;
        cashCollectionDeviceType: {
            typeName: string;
            typeShortage: number;
        }[];
    }[];
    totalCount: number;
}

type TimestampResponse = {
    deviceId: number;
    deviceName: string;
    oldTookMoneyTime?: Date;
}

type TimestampBody = {
    dateTimeStamp: Date;
}

type TimestampResponseBody = {
    deviceId: number;
    tookMoneyTime: Date;
}

export async function postCollection(body: CollectionBody): Promise<CollectionResponse> {
    console.log(body);
    const response: AxiosResponse<CollectionResponse> = await api.post(FINANCE.POST_CASH_COLLECTION, body);
    console.log(response.data);
    return response.data;
}

export async function recalculateCollection(body: RecalculateCollectionBody, id: number): Promise<CollectionResponse> {
    console.log(body);
    const response: AxiosResponse<CollectionResponse> = await api.post(FINANCE.POST_CASH_COLLECTION + `/recalculate/${id}`, body);
    console.log(response.data);
    return response.data;
}

export async function sendCollection(body: RecalculateCollectionBody, id: number): Promise<CollectionResponse> {
    console.log(body);
    const response: AxiosResponse<CollectionResponse> = await api.post(FINANCE.POST_CASH_COLLECTION + `/send/${id}`, body);
    console.log(response.data);
    return response.data;
}

export async function returnCollection(id: number): Promise<ReturnCollectionResponse> {
    const response: AxiosResponse<ReturnCollectionResponse> = await api.patch(FINANCE.POST_CASH_COLLECTION + `/return/${id}`);
    console.log(response.data);
    return response.data;
}

export async function getCollectionById(id: number): Promise<CollectionResponse> {
    const response: AxiosResponse<CollectionResponse> = await api.get(FINANCE.POST_CASH_COLLECTION + `/${id}`);
    console.log(response.data);
    return response.data;
}

export async function getCollections(posId: number, params: CashCollectionParams): Promise<CashCollectionsResponse> {
    const response: AxiosResponse<CashCollectionsResponse> = await api.get(FINANCE.POST_CASH_COLLECTION + `s/${posId}`, { params });
    console.log(response.data);
    return response.data;
}

export async function getTimestamp(posId: number): Promise<TimestampResponse[]> {
    const response: AxiosResponse<TimestampResponse[]> = await api.get(FINANCE.TIME_STAMP + `/${posId}`);
    console.log(response.data);
    return response.data;
}

export async function postTimestamp(body: TimestampBody, id: number): Promise<TimestampResponseBody> {
    console.log(body);
    const response: AxiosResponse<TimestampResponseBody> = await api.post(FINANCE.TIME_STAMP + `/${id}`, body);
    console.log(response.data);
    return response.data;
}

