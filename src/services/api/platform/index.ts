import {AxiosResponse} from "axios";
import api from "@/config/axiosConfig";

enum LOGIN {
    CREATE_LOGIN = 'user/auth/login',
    CREATE_REGISTER = 'user/auth/register',
    REGISTER_ACTIVATION = 'user/auth/activation',
    PASSWORD_CONFIRM = 'user/auth/password/confirm',
    PASSWORD_VALID = 'user/auth/password/valid/confirm',
    PASSWORD_RESET = 'user/auth/password/reset'
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

export async function registerPlatformUser(body: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.post(LOGIN.CREATE_REGISTER, body);
    console.log(response.data);
    return response.data;
}

export async function registerActivationUser(body: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.post(LOGIN.REGISTER_ACTIVATION, body);
    console.log(response.data);
    return response.data;
}

export async function forgotPasswordUser(body: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.post(LOGIN.PASSWORD_CONFIRM, body);
    console.log(response.data);
    return response.data;
}

export async function passwordValidUser(body: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.post(LOGIN.PASSWORD_VALID, body);
    console.log(response.data);
    return response.data;
}

export async function passwordResetUser(body: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.post(LOGIN.PASSWORD_RESET, body);
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