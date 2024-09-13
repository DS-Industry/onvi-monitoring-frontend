import {AxiosResponse} from "axios";
import api from "../../../utils/axiosConfig";
enum DEVICE {
    GET_DEVICE = 'device/filter',
    GET_DEVICE_BY_POS = 'device/filter/pos',
}

export async function getDevice(userId: number): Promise<Pos[]> {
    const url = DEVICE.GET_DEVICE + `/${userId}`;
    const response: AxiosResponse<any> = await api.get(url);

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function getDeviceByPosId(posId: number): Promise<Pos[]> {
    const url = DEVICE.GET_DEVICE_BY_POS + `/${posId}`;
    const response: AxiosResponse<any> = await api.get(url);

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}