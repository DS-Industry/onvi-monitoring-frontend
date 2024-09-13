import {AxiosResponse} from "axios";
import api from "../../../utils/axiosConfig";


enum MONITORING {
    GET_DEPOSIT = '/pos/monitoring',
    GET_PROGRAMS = '/pos/program'
}


export async function getDeposit(params: any): Promise<any> {
    const response: AxiosResponse<any> = await api.get(MONITORING.GET_DEPOSIT, {params});

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function getDepositPos(posId: number, params: any): Promise<any> {
    const response: AxiosResponse<any> = await api.get(`/pos/monitoring/${posId}`, {params});

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function getDepositDevice(deviceId: number, params: any): Promise<any> {
    const response: AxiosResponse<any> = await api.get(`/device/monitoring/${deviceId}`, {params});

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function getPrograms(params: any): Promise<any> {
    const response: AxiosResponse<any> = await api.get(MONITORING.GET_PROGRAMS, {params});

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function getProgramPos(posId: number, params: any): Promise<any> {
    const response: AxiosResponse<any> = await api.get(`/pos/program/${posId}`, {params});

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}


export async function getProgramDevice(deviceId: number, params: any): Promise<any> {
    const response: AxiosResponse<any> = await api.get(`/device/program/${deviceId}`, {params});

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

