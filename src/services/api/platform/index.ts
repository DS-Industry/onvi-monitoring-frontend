import {AxiosResponse} from "axios";
import api from "../../../utils/axiosConfig";

enum LOGIN {
    CREATE_LOGIN = 'user/auth/login'
}

export async function loginPlatformUser(body: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.post(LOGIN.CREATE_LOGIN, body);
    console.log(response.data);
    return response.data;
}