import {AxiosResponse} from "axios";
import api from "@/config/axiosConfig";
enum DEVICE {
    GET_DEVICE = 'user/device/filter',
    GET_DEVICE_BY_POS = 'user/device/filter/pos',
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

export async function getDevice(userId: number): Promise<Pos[]> {
    const url = DEVICE.GET_DEVICE + `/${userId}`;
    const response: AxiosResponse<Pos[]> = await api.get(url);

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function getDeviceByPosId(posId: number): Promise<Pos[]> {
    const url = DEVICE.GET_DEVICE_BY_POS + `/${posId}`;
    const response: AxiosResponse<Pos[]> = await api.get(url);

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}