import {AxiosResponse} from "axios";
import api from "@/config/axiosConfig";


enum MONITORING {
    GET_DEPOSIT = '/user/pos/monitoring',
    GET_PROGRAMS = '/user/pos/program',
}


export async function getDeposit(posId: number,params: any): Promise<any> {
    const response: AxiosResponse<any> = await api.get(MONITORING.GET_DEPOSIT + `/${posId}`, {params});

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function getDepositPos(params: any): Promise<any> {
    const response: AxiosResponse<any> = await api.get(MONITORING.GET_DEPOSIT, {params});

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function getDepositDevice(deviceId: number, params: any): Promise<any> {
    const response: AxiosResponse<any> = await api.get(`/user/device/monitoring/${deviceId}`, {params});

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function getPrograms(posId: number,params: any): Promise<any> {
    const response: AxiosResponse<any> = await api.get(MONITORING.GET_PROGRAMS + `/${posId}`, {params});

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function getProgramPos(params: any): Promise<any> {
    const response: AxiosResponse<any> = await api.get(MONITORING.GET_PROGRAMS, {params});

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}


export async function getProgramDevice(deviceId: number, params: any): Promise<any> {
    const response: AxiosResponse<any> = await api.get(`/user/device/program/${deviceId}`, {params});

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

