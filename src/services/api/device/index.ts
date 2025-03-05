import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";
enum DEVICE {
    GET_DEVICE = 'user/device/filter',
    GET_DEVICE_BY_POS = 'user/device/filter/pos',
    GET_PLACEMENT = 'user/placement'
}

type Pos = {
    props: {
        id: number;
        name: string;
        carWashDeviceMetadata: string;
        status: string;
        ipAddress: string;
        carWashDeviceTypeId: string;
        carWashPosId: number;
        deviceRoleId: number;
    }
}

type City = {
    id: number;
    country: string;
    region: string;
    city: string;
    utc: string;
}

export async function getDevice(userId: number): Promise<Pos[]> {
    const url = DEVICE.GET_DEVICE + `/${userId}`;
    const response: AxiosResponse<Pos[]> = await api.get(url);

    return response.data;
}

export async function getDeviceByPosId(posId: number): Promise<Pos[]> {
    const url = DEVICE.GET_DEVICE_BY_POS + `/${posId}`;
    const response: AxiosResponse<Pos[]> = await api.get(url);

    return response.data;
}

export async function getPlacement(): Promise<City[]> {
    const response: AxiosResponse<City[]> = await api.get(DEVICE.GET_PLACEMENT);

    return response.data;
}