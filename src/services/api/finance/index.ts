import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum FINANCE {
    POST_CASH_COLLECTION = 'user/finance/cash-collection'
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

export async function postCollection(body: CollectionBody): Promise<CollectionResponse> {
    console.log(body);
    const response: AxiosResponse<CollectionResponse> = await api.post(FINANCE.POST_CASH_COLLECTION, body);
    console.log(response.data);
    return response.data;
}