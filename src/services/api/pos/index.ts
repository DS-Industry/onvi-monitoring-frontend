import {AxiosResponse} from "axios";
import api from "@/config/axiosConfig";

enum POS {
    GET_POSES = 'pos/filter',
    CREATE_POS = 'pos'
}

export async function getPos(userId: number): Promise<Pos[]> {
    const url = POS.GET_POSES + `/${userId}`;
    const response: AxiosResponse<any> = await api.get(url);

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function postCreatePos(body: any, options: any): Promise<any> {
    const response: AxiosResponse<any> = await api.post(POS.CREATE_POS, body, options);

    return response.data;
}