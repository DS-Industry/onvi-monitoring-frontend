import {AxiosResponse} from "axios";
import api from "@/config/axiosConfig";

enum LOGIN {
    CREATE_LOGIN = 'user/auth/login'
}

enum USER {
    USER_AVATAR = 'user/avatar',
    USER_UPDATE = 'user',
    USER_UPDATE_PASSWORD = 'user/password',
    USER_ORGANIZATION = 'user/organization'
}

export async function loginPlatformUser(body: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.post(LOGIN.CREATE_LOGIN, body);
    console.log(response.data);
    return response.data;
}

export async function uploadUserAvatar(body: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.post(USER.USER_AVATAR, body);
    console.log(response.data);
    return response.data;
}

export async function updateUserProfile(body: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.patch(USER.USER_UPDATE, body);
    console.log(response.data);
    return response.data;
}

export async function updateUserPassword(body: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.patch(USER.USER_UPDATE_PASSWORD, body);
    console.log(response.data);
    return response.data;
}

export async function createUserOrganization(body: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.post(USER.USER_ORGANIZATION, body);
    console.log(response.data);
    return response.data;
}